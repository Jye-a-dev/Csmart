import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/base.repository';
import { Order, OrderItem } from '../entities/order.entity';
import {
  CreateOrderDto,
  UpdateOrderDto,
  CreateOrderItemDto,
} from '../dto/order.dto';

@Injectable()
export class OrdersRepository extends BaseRepository {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const orderSql = `
        INSERT INTO orders (
          order_code, user_id, status, total_amount, shipping_fee, 
          discount_amount, shipping_address, note, cancel_reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, order_code, user_id, status, total_amount, shipping_fee, 
                  discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
      `;
      const orderParams = [
        dto.order_code,
        dto.user_id || null,
        dto.status || 'PENDING',
        dto.total_amount,
        dto.shipping_fee !== undefined ? dto.shipping_fee : 0,
        dto.discount_amount !== undefined ? dto.discount_amount : 0,
        dto.shipping_address,
        dto.note || null,
        dto.cancel_reason || null,
      ];

      const orderRes = await client.query<Order>(orderSql, orderParams);
      const newOrder = orderRes.rows[0];

      const itemSql = `
        INSERT INTO order_items (
          order_id, product_id, product_name, unit_price, quantity, 
          shipping_status, courier_name, tracking_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, order_id, product_id, product_name, unit_price, quantity, subtotal,
                  shipping_status, courier_name, tracking_number, estimated_delivery, delivered_at
      `;

      const createdItems: OrderItem[] = [];
      for (const item of dto.items) {
        const itemParams = [
          newOrder.id,
          item.product_id || null,
          item.product_name,
          item.unit_price,
          item.quantity,
          item.shipping_status || 'PENDING',
          item.courier_name || null,
          item.tracking_number || null,
        ];
        const itemRes = await client.query<OrderItem>(itemSql, itemParams);
        createdItems.push(itemRes.rows[0]);
      }

      await client.query('COMMIT');
      newOrder.items = createdItems;
      return newOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAllOrders(limit = 10, offset = 0): Promise<Order[]> {
    const sql = `
      SELECT id, order_code, user_id, status, total_amount, shipping_fee, 
             discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
      FROM orders
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    const orders = await this.query<Order>(sql, [limit, offset]);

    for (const order of orders) {
      order.items = await this.findOrderItemsByOrderId(order.id);
    }
    return orders;
  }

  async findOrderById(id: number): Promise<Order | null> {
    const sql = `
      SELECT id, order_code, user_id, status, total_amount, shipping_fee, 
             discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
      FROM orders
      WHERE id = $1
    `;
    const order = await this.queryOne<Order>(sql, [id]);
    if (order) {
      order.items = await this.findOrderItemsByOrderId(order.id);
    }
    return order;
  }

  async findOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    const sql = `
      SELECT id, order_id, product_id, product_name, unit_price, quantity, subtotal,
             shipping_status, courier_name, tracking_number, estimated_delivery, delivered_at
      FROM order_items
      WHERE order_id = $1
      ORDER BY id ASC
    `;
    return this.query<OrderItem>(sql, [orderId]);
  }

  async updateOrder(id: number, dto: UpdateOrderDto): Promise<Order | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fieldsMapping: Record<string, string> = {
      order_code: 'order_code',
      user_id: 'user_id',
      status: 'status',
      total_amount: 'total_amount',
      shipping_fee: 'shipping_fee',
      discount_amount: 'discount_amount',
      shipping_address: 'shipping_address',
      note: 'note',
      cancel_reason: 'cancel_reason',
    };

    const dtoRecord = dto as Record<string, any>;
    for (const key of Object.keys(fieldsMapping)) {
      if (dtoRecord[key] !== undefined) {
        updates.push(`${fieldsMapping[key]} = $${paramIndex++}`);
        params.push(dtoRecord[key]);
      }
    }

    if (updates.length === 0) {
      return this.findOrderById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const sql = `
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, order_code, user_id, status, total_amount, shipping_fee, 
                discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
    `;
    const order = await this.queryOne<Order>(sql, params);
    if (order) {
      order.items = await this.findOrderItemsByOrderId(order.id);
    }
    return order;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const sql = `DELETE FROM orders WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: number }>(sql, [id]);
    return !!res;
  }
}
