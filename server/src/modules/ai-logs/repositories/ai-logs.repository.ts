import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { AiRequestLog } from '../entities/ai-log.entity';
import {
  CreateAiRequestLogDto,
  UpdateAiRequestLogDto,
} from '../dto/ai-log.dto';

@Injectable()
export class AiLogsRepository extends BaseRepository {
  async onModuleInit() {
    try {
      await this.pool.query(
        `ALTER TABLE ai_request_logs ADD COLUMN IF NOT EXISTS corrected_output JSONB;`,
      );
    } catch {
      // Ignore if table does not exist yet or column exists
    }
  }

  async createLog(dto: CreateAiRequestLogDto): Promise<AiRequestLog> {
    const sql = `
      INSERT INTO ai_request_logs (
        endpoint, user_id, input_text, output_json, corrected_output,
        confidence_score, flag_for_review, execution_time_ms, review_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, endpoint, user_id, input_text, output_json, corrected_output,
                confidence_score, flag_for_review, execution_time_ms, review_id, created_at
    `;
    const params = [
      dto.endpoint,
      dto.user_id || null,
      dto.input_text || null,
      JSON.stringify(dto.output_json),
      dto.corrected_output ? JSON.stringify(dto.corrected_output) : null,
      dto.confidence_score !== undefined ? dto.confidence_score : null,
      dto.flag_for_review !== undefined ? dto.flag_for_review : false,
      dto.execution_time_ms !== undefined ? dto.execution_time_ms : null,
      dto.review_id !== undefined ? dto.review_id : null,
    ];
    return (await this.queryOne<AiRequestLog>(sql, params))!;
  }

  async findAllLogs(limit = 10, offset = 0): Promise<AiRequestLog[]> {
    const sql = `
      SELECT id, endpoint, user_id, input_text, output_json, corrected_output,
             confidence_score, flag_for_review, execution_time_ms, review_id, created_at
      FROM ai_request_logs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<AiRequestLog>(sql, [limit, offset]);
  }

  async findLogById(id: string): Promise<AiRequestLog | null> {
    const sql = `
      SELECT id, endpoint, user_id, input_text, output_json, corrected_output,
             confidence_score, flag_for_review, execution_time_ms, review_id, created_at
      FROM ai_request_logs
      WHERE id = $1
    `;
    return this.queryOne<AiRequestLog>(sql, [id]);
  }

  async updateLog(
    id: string,
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
      corrected_output: 'corrected_output',
      confidence_score: 'confidence_score',
      flag_for_review: 'flag_for_review',
      execution_time_ms: 'execution_time_ms',
    };

    const dtoRecord = dto as Record<string, any>;
    for (const key of Object.keys(fieldsMapping)) {
      if (dtoRecord[key] !== undefined) {
        updates.push(`${fieldsMapping[key]} = $${paramIndex++}`);
        if (key === 'output_json' || key === 'corrected_output') {
          params.push(dtoRecord[key] ? JSON.stringify(dtoRecord[key]) : null);
        } else {
          params.push(dtoRecord[key]);
        }
      }
    }

    if (updates.length === 0) {
      return this.findLogById(id);
    }

    params.push(id);
    const sql = `
      UPDATE ai_request_logs
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, endpoint, user_id, input_text, output_json, corrected_output,
                confidence_score, flag_for_review, execution_time_ms, created_at
    `;
    return this.queryOne<AiRequestLog>(sql, params);
  }

  async deleteLog(id: string): Promise<boolean> {
    const sql = `DELETE FROM ai_request_logs WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: string }>(sql, [id]);
    return !!res;
  }

  async deleteAllLogs(): Promise<number> {
    const sql = `DELETE FROM ai_request_logs RETURNING id`;
    const res = await this.query<{ id: string }>(sql);
    return res.length;
  }

  /** Liên kết log với HITL review entry sau khi enqueue */
  async updateReviewId(logId: string, reviewId: string): Promise<void> {
    await this.pool.query(
      `UPDATE ai_request_logs SET review_id = $1 WHERE id = $2`,
      [reviewId, logId],
    );
  }

  /** Tìm bản ghi log có corrected_output cho endpoint và input_text trùng khớp */
  async findCorrectedLog(
    endpoint: string,
    inputText: string,
  ): Promise<AiRequestLog | null> {
    const sql = `
      SELECT id, endpoint, user_id, input_text, output_json, corrected_output,
             confidence_score, flag_for_review, execution_time_ms, review_id, created_at
      FROM ai_request_logs
      WHERE endpoint = $1
        AND TRIM(LOWER(input_text)) = TRIM(LOWER($2))
        AND corrected_output IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return this.queryOne<AiRequestLog>(sql, [endpoint, inputText]);
  }
}
