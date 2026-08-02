import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';

@Injectable()
export class PaymentsRepository extends BaseRepository {
  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    const sql = `
      INSERT INTO payments (order_id, payment_method, payment_status, transaction_code, amount, paid_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, order_id, payment_method, payment_status, transaction_code, amount, paid_at, created_at
    `;
    const params = [
      dto.order_id,
      dto.payment_method,
      dto.payment_status || 'PENDING',
      dto.transaction_code || null,
      dto.amount,
      dto.paid_at || null,
    ];
    return (await this.queryOne<Payment>(sql, params))!;
  }

  async findAllPayments(limit = 10, offset = 0): Promise<Payment[]> {
    const sql = `
      SELECT id, order_id, payment_method, payment_status, transaction_code, amount, paid_at, created_at
      FROM payments
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    return this.query<Payment>(sql, [limit, offset]);
  }

  async findPaymentById(id: number): Promise<Payment | null> {
    const sql = `
      SELECT id, order_id, payment_method, payment_status, transaction_code, amount, paid_at, created_at
      FROM payments
      WHERE id = $1
    `;
    return this.queryOne<Payment>(sql, [id]);
  }

  async updatePayment(
    id: number,
    dto: UpdatePaymentDto,
  ): Promise<Payment | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fieldsMapping: Record<string, string> = {
      order_id: 'order_id',
      payment_method: 'payment_method',
      payment_status: 'payment_status',
      transaction_code: 'transaction_code',
      amount: 'amount',
      paid_at: 'paid_at',
    };

    const dtoRecord = dto as Record<string, any>;
    for (const key of Object.keys(fieldsMapping)) {
      if (dtoRecord[key] !== undefined) {
        updates.push(`${fieldsMapping[key]} = $${paramIndex++}`);
        params.push(dtoRecord[key]);
      }
    }

    if (updates.length === 0) {
      return this.findPaymentById(id);
    }

    params.push(id);
    const sql = `
      UPDATE payments
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, order_id, payment_method, payment_status, transaction_code, amount, paid_at, created_at
    `;
    return this.queryOne<Payment>(sql, params);
  }

  async deletePayment(id: number): Promise<boolean> {
    const sql = `DELETE FROM payments WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: number }>(sql, [id]);
    return !!res;
  }
}
