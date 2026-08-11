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
