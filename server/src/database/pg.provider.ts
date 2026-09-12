import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_CONNECTION = 'PG_CONNECTION';
export const PG_READONLY_CONNECTION = 'PG_READONLY_CONNECTION';

export const PgProvider: Provider = {
  provide: PG_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('PgProvider');
    const connectionString = configService.get<string>('DATABASE_URL');
    const pool = new Pool({
      connectionString,
    });

    try {
      const client = await pool.connect();
      logger.log('Database connection established successfully');

      // Auto-migrate database table schema for category and product images if columns do not exist
      await client.query(`
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url_1 TEXT;
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url_2 TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
        ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]';

        CREATE TABLE IF NOT EXISTS ocr_records (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          document_type VARCHAR(50) NOT NULL DEFAULT 'INVOICE',
          order_code VARCHAR(100) NOT NULL,
          tracking_number VARCHAR(100),
          courier_name VARCHAR(100),
          customer_name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(50),
          address TEXT,
          total_amount NUMERIC(12, 2) DEFAULT 0,
          confidence_score REAL DEFAULT 0.95,
          execution_time_ms INT DEFAULT 300,
          image_url TEXT,
          status VARCHAR(50) DEFAULT 'VERIFIED',
          extracted_items JSONB DEFAULT '[]'::jsonb,
          raw_text_chunks JSONB DEFAULT '[]'::jsonb,
          is_product_created BOOLEAN DEFAULT FALSE,
          product_id TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
        );

        ALTER TABLE ocr_records ADD COLUMN IF NOT EXISTS is_product_created BOOLEAN DEFAULT FALSE;
        ALTER TABLE ocr_records ADD COLUMN IF NOT EXISTS product_id TEXT;

        -- Create read-only role for Text-to-SQL security isolation
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'csmart_readonly') THEN
            CREATE ROLE csmart_readonly WITH LOGIN PASSWORD 'csmart_ro_pass';
          END IF;
        END
        $$;
        GRANT USAGE ON SCHEMA public TO csmart_readonly;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO csmart_readonly;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO csmart_readonly;
      `);

      client.release();
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Failed to establish database connection', errorStack);
      throw error;
    }

    return pool;
  },
};

export const PgReadonlyProvider: Provider = {
  provide: PG_READONLY_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('PgReadonlyProvider');
    const primaryUrl = configService.get<string>('DATABASE_URL') || '';
    const readonlyUrl = configService.get<string>('READONLY_DATABASE_URL');

    // Build read-only connection string using csmart_readonly credentials if not explicitly configured
    let targetUrl = readonlyUrl;
    if (!targetUrl && primaryUrl) {
      try {
        const parsed = new URL(primaryUrl);
        parsed.username = 'csmart_readonly';
        parsed.password = 'csmart_ro_pass';
        targetUrl = parsed.toString();
      } catch {
        targetUrl = primaryUrl;
      }
    }

    const pool = new Pool({
      connectionString: targetUrl || primaryUrl,
      max: 5,
    });

    try {
      const client = await pool.connect();
      logger.log(
        'Dedicated read-only connection established for Text-to-SQL execution',
      );
      client.release();
      return pool;
    } catch (err) {
      logger.warn(
        `Could not connect as csmart_readonly (${err}). Falling back to primary pool.`,
      );
      return new Pool({ connectionString: primaryUrl, max: 5 });
    }
  },
};
