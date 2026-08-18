import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { OcrRecord } from '../entities/ocr-record.entity';
import { CreateOcrRecordDto, UpdateOcrRecordDto } from '../dto/ocr-record.dto';

@Injectable()
export class OcrRecordsRepository extends BaseRepository {
  async createRecord(dto: CreateOcrRecordDto): Promise<OcrRecord> {
    const sql = `
      INSERT INTO ocr_records (
        document_type, order_code, tracking_number, courier_name,
        customer_name, phone_number, address, total_amount,
        confidence_score, execution_time_ms, image_url, status,
        extracted_items, raw_text_chunks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb)
      RETURNING *
    `;
    const params = [
      dto.document_type || 'INVOICE',
      dto.order_code,
      dto.tracking_number || null,
      dto.courier_name || null,
      dto.customer_name || 'Khách hàng',
      dto.phone_number || null,
      dto.address || null,
      dto.total_amount || 0,
      dto.confidence_score !== undefined ? dto.confidence_score : 0.95,
      dto.execution_time_ms !== undefined ? dto.execution_time_ms : 300,
      dto.image_url ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      dto.status || 'VERIFIED',
      JSON.stringify(dto.extracted_items || []),
      JSON.stringify(dto.raw_text_chunks || []),
    ];

    const row = await this.queryOne<OcrRecord>(sql, params);
    return row!;
  }

  async findAllRecords(
    limit = 50,
    offset = 0,
    documentType?: string,
    status?: string,
    search?: string,
  ): Promise<OcrRecord[]> {
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (documentType) {
      whereClauses.push(`document_type = $${paramIdx++}`);
      params.push(documentType);
    }
    if (status) {
      whereClauses.push(`status = $${paramIdx++}`);
      params.push(status);
    }
    if (search) {
      whereClauses.push(`(
        order_code ILIKE $${paramIdx} OR
        tracking_number ILIKE $${paramIdx} OR
        customer_name ILIKE $${paramIdx} OR
        phone_number ILIKE $${paramIdx}
      )`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereStr =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    params.push(limit, offset);
    const sql = `
      SELECT *
      FROM ocr_records
      ${whereStr}
      ORDER BY created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    return this.query<OcrRecord>(sql, params);
  }

  async findRecordById(id: string): Promise<OcrRecord | null> {
    const sql = `SELECT * FROM ocr_records WHERE id = $1`;
    return this.queryOne<OcrRecord>(sql, [id]);
  }

  async updateRecord(
    id: string,
    dto: UpdateOcrRecordDto,
  ): Promise<OcrRecord | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fields: (keyof UpdateOcrRecordDto)[] = [
      'document_type',
      'order_code',
      'tracking_number',
      'courier_name',
      'customer_name',
      'phone_number',
      'address',
      'total_amount',
      'confidence_score',
      'execution_time_ms',
      'image_url',
      'status',
    ];

    fields.forEach((field) => {
      if (dto[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(dto[field]);
      }
    });

    if (dto.extracted_items !== undefined) {
      updates.push(`extracted_items = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(dto.extracted_items));
    }
    if (dto.raw_text_chunks !== undefined) {
      updates.push(`raw_text_chunks = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(dto.raw_text_chunks));
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updates.length === 1) {
      return this.findRecordById(id);
    }

    params.push(id);
    const sql = `
      UPDATE ocr_records
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    return this.queryOne<OcrRecord>(sql, params);
  }

  async deleteRecord(id: string): Promise<boolean> {
    const sql = `DELETE FROM ocr_records WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: string }>(sql, [id]);
    return !!res;
  }
}
