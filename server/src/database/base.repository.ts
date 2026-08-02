import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from './pg.provider';

@Injectable()
export class BaseRepository {
  constructor(@Inject(PG_CONNECTION) protected readonly pool: Pool) {}

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async countAll(tableName: string): Promise<number> {
    const sql = `SELECT COUNT(*)::int as count FROM "${tableName}"`;
    const res = await this.queryOne<{ count: number }>(sql);
    return res ? res.count : 0;
  }

  async countBy(
    tableName: string,
    filters: Record<string, any>,
  ): Promise<number> {
    const keys = Object.keys(filters);
    if (keys.length === 0) {
      return this.countAll(tableName);
    }
    const whereClauses = keys
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(' AND ');
    const sql = `SELECT COUNT(*)::int as count FROM "${tableName}" WHERE ${whereClauses}`;
    const params = keys.map((key) => filters[key] as unknown);
    const res = await this.queryOne<{ count: number }>(sql, params);
    return res ? res.count : 0;
  }
}
