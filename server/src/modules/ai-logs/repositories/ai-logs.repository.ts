import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { AiRequestLog } from '../entities/ai-log.entity';
import {
  CreateAiRequestLogDto,
  UpdateAiRequestLogDto,
} from '../dto/ai-log.dto';

@Injectable()
export class AiLogsRepository extends BaseRepository {
  async createLog(dto: CreateAiRequestLogDto): Promise<AiRequestLog> {
    const sql = `
      INSERT INTO ai_request_logs (
        endpoint, user_id, input_text, output_json, 
        confidence_score, flag_for_review, execution_time_ms, review_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, endpoint, user_id, input_text, output_json, 
                confidence_score, flag_for_review, execution_time_ms, review_id, created_at
    `;
    const params = [
      dto.endpoint,
      dto.user_id || null,
      dto.input_text || null,
      JSON.stringify(dto.output_json),
      dto.confidence_score !== undefined ? dto.confidence_score : null,
      dto.flag_for_review !== undefined ? dto.flag_for_review : false,
      dto.execution_time_ms !== undefined ? dto.execution_time_ms : null,
      dto.review_id !== undefined ? dto.review_id : null,
    ];
    return (await this.queryOne<AiRequestLog>(sql, params))!;
  }

  async findAllLogs(limit = 10, offset = 0): Promise<AiRequestLog[]> {
    const sql = `
      SELECT id, endpoint, user_id, input_text, output_json, 
             confidence_score, flag_for_review, execution_time_ms, review_id, created_at
      FROM ai_request_logs
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<AiRequestLog>(sql, [limit, offset]);
  }

  async findLogById(id: number): Promise<AiRequestLog | null> {
    const sql = `
      SELECT id, endpoint, user_id, input_text, output_json, 
             confidence_score, flag_for_review, execution_time_ms, review_id, created_at
      FROM ai_request_logs
      WHERE id = $1
    `;
    return this.queryOne<AiRequestLog>(sql, [id]);
  }

  async updateLog(
    id: number,
    dto: UpdateAiRequestLogDto,
  ): Promise<AiRequestLog | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fieldsMapping: Record<string, string> = {
      endpoint: 'endpoint',
      user_id: 'user_id',
      input_text: 'input_text',
      output_json: 'output_json',
      confidence_score: 'confidence_score',
      flag_for_review: 'flag_for_review',
      execution_time_ms: 'execution_time_ms',
    };

    const dtoRecord = dto as Record<string, any>;
    for (const key of Object.keys(fieldsMapping)) {
      if (dtoRecord[key] !== undefined) {
        updates.push(`${fieldsMapping[key]} = $${paramIndex++}`);
        if (key === 'output_json') {
          params.push(JSON.stringify(dtoRecord[key]));
        } else {
          params.push(dtoRecord[key]);
        }
      }
    }

    if (updates.length === 0) {
      return this.findLogById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `
      UPDATE ai_request_logs
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, endpoint, user_id, input_text, output_json, 
                confidence_score, flag_for_review, execution_time_ms, created_at
    `;
    return this.queryOne<AiRequestLog>(sql, params);
  }

  async deleteLog(id: number): Promise<boolean> {
    const sql = `DELETE FROM ai_request_logs WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: number }>(sql, [id]);
    return !!res;
  }

  /** Liên kết log với HITL review entry sau khi enqueue */
  async updateReviewId(logId: number, reviewId: number): Promise<void> {
    await this.pool.query(
      `UPDATE ai_request_logs SET review_id = $1 WHERE id = $2`,
      [reviewId, logId],
    );
  }
}
