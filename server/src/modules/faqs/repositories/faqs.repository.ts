import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { Faq } from '../entities/faq.entity';
import { CreateFaqDto, UpdateFaqDto } from '../dto/faq.dto';

@Injectable()
export class FaqsRepository extends BaseRepository {
  async createFaq(dto: CreateFaqDto): Promise<Faq> {
    const sql = `
      INSERT INTO faqs (topic, question, answer, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING id, topic, question, answer, is_active, created_at
    `;
    const params = [
      dto.topic,
      dto.question,
      dto.answer,
      dto.is_active !== undefined ? dto.is_active : true,
    ];
    return (await this.queryOne<Faq>(sql, params))!;
  }

  async findAllFaqs(limit = 10, offset = 0): Promise<Faq[]> {
    const sql = `
      SELECT id, topic, question, answer, is_active, created_at
      FROM faqs
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<Faq>(sql, [limit, offset]);
  }

  async findFaqById(id: number): Promise<Faq | null> {
    const sql = `
      SELECT id, topic, question, answer, is_active, created_at
      FROM faqs
      WHERE id = $1
    `;
    return this.queryOne<Faq>(sql, [id]);
  }

  async updateFaq(id: number, dto: UpdateFaqDto): Promise<Faq | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.topic !== undefined) {
      updates.push(`topic = $${paramIndex++}`);
      params.push(dto.topic);
    }
    if (dto.question !== undefined) {
      updates.push(`question = $${paramIndex++}`);
      params.push(dto.question);
    }
    if (dto.answer !== undefined) {
      updates.push(`answer = $${paramIndex++}`);
      params.push(dto.answer);
    }
    if (dto.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(dto.is_active);
    }

    if (updates.length === 0) {
      return this.findFaqById(id);
    }

    params.push(id);
    const sql = `
      UPDATE faqs
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, topic, question, answer, is_active, created_at
    `;
    return this.queryOne<Faq>(sql, params);
  }

  async deleteFaq(id: number): Promise<boolean> {
    const sql = `DELETE FROM faqs WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: number }>(sql, [id]);
    return !!res;
  }
}
