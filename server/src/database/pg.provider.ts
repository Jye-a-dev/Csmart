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
      client.release();
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Failed to establish database connection', errorStack);
      throw error;
    }

    return pool;
  },
};
