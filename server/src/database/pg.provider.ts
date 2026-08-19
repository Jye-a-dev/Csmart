import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_CONNECTION = 'PG_CONNECTION';

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
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
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
