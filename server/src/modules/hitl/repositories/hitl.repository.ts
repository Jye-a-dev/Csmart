import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { ReviewQueueItem, HitlStatus } from '../entities/review-queue.entity';
import { EnqueueReviewDto } from '../dto/hitl.dto';

@Injectable()
export class HitlRepository extends BaseRepository {
  // ─── Enqueue ──────────────────────────────────────────────────────────────

  async enqueue(dto: EnqueueReviewDto): Promise<ReviewQueueItem> {
    const sql = `
      INSERT INTO ai_review_queue
        (log_id, endpoint, user_id, input_text, output_json, confidence_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      dto.log_id ?? null,
      dto.endpoint,
      dto.user_id ?? null,
      dto.input_text ?? null,
      JSON.stringify(dto.output_json),
      dto.confidence_score ?? null,
    ];
    return (await this.queryOne<ReviewQueueItem>(sql, params))!;
  }

  // ─── Find all (filtered by status) ───────────────────────────────────────

  async findAll(
    status?: HitlStatus,
    limit = 20,
    offset = 0,
  ): Promise<ReviewQueueItem[]> {
    const whereClause = status ? `WHERE status = $3::hitl_status` : '';
    const params: any[] = status ? [limit, offset, status] : [limit, offset];
    const sql = `
      SELECT * FROM ai_review_queue
      ${whereClause}
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<ReviewQueueItem>(sql, params);
  }

  async findById(id: string): Promise<ReviewQueueItem | null> {
    return this.queryOne<ReviewQueueItem>(
      `SELECT * FROM ai_review_queue WHERE id = $1`,
      [id],
    );
  }

  async countByStatus(status?: HitlStatus): Promise<number> {
    if (status) {
      const res = await this.queryOne<{ count: number }>(
        `SELECT COUNT(*)::int as count FROM ai_review_queue WHERE status = $1::hitl_status`,
        [status],
      );
      return res?.count ?? 0;
    }
    return this.countAll('ai_review_queue');
  }

  // ─── Update status ────────────────────────────────────────────────────────

  async approve(
    id: string,
    reviewerId: string,
    note?: string,
  ): Promise<ReviewQueueItem | null> {
    return this.queryOne<ReviewQueueItem>(
      `UPDATE ai_review_queue
       SET status = 'APPROVED'::hitl_status,
           reviewer_id = $2,
           reviewer_note = $3,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, reviewerId, note ?? null],
    );
  }

  async reject(
    id: string,
    reviewerId: string,
    note?: string,
  ): Promise<ReviewQueueItem | null> {
    return this.queryOne<ReviewQueueItem>(
      `UPDATE ai_review_queue
       SET status = 'REJECTED'::hitl_status,
           reviewer_id = $2,
           reviewer_note = $3,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, reviewerId, note ?? null],
    );
  }

  async label(
    id: string,
    reviewerId: string,
    correctedLabel: string,
    note?: string,
  ): Promise<ReviewQueueItem | null> {
    return this.queryOne<ReviewQueueItem>(
      `UPDATE ai_review_queue
       SET status = 'LABELLED'::hitl_status,
           reviewer_id = $2,
           corrected_label = $3,
           reviewer_note = $4,
           reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, reviewerId, correctedLabel, note ?? null],
    );
  }

  // ─── Export fine-tune dataset ─────────────────────────────────────────────

  async findLabelled(): Promise<ReviewQueueItem[]> {
    return this.query<ReviewQueueItem>(
      `SELECT * FROM ai_review_queue WHERE status = 'LABELLED'::hitl_status ORDER BY id ASC`,
    );
  }
}
