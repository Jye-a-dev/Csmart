import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../database/base.repository';
import { Order, OrderItem } from './order.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersRepository extends BaseRepository {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let resolvedUserId: number | null = null;
      if (dto.user_id) {
        if (typeof dto.user_id === 'number' || /^\d+$/.test(String(dto.user_id))) {
          resolvedUserId = Number(dto.user_id);
        } else {
          const userRes = await client.query<{ id: number }>(
            'SELECT id FROM users WHERE uuid::text = $1 LIMIT 1',
            [String(dto.user_id)],
          );
          if (userRes.rows.length > 0) {
            resolvedUserId = userRes.rows[0].id;
          }
        }
      }

      const generatedCode =
        dto.order_code ||
        `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

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
        generatedCode,
        resolvedUserId,
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
      if (dto.items && Array.isArray(dto.items)) {
        for (const item of dto.items) {
          let resolvedProductId: number | null = null;
          if (item.product_id) {
            if (typeof item.product_id === 'number' || /^\d+$/.test(String(item.product_id))) {
              resolvedProductId = Number(item.product_id);
            }
          }

          const itemParams = [
            newOrder.id,
            resolvedProductId,
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

  async findAllOrders(
    limit = 10,
    offset = 0,
    filters?: { user_id?: string | number; status?: string; search?: string },
  ): Promise<Order[]> {
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.user_id) {
      if (typeof filters.user_id === 'number' || /^\d+$/.test(String(filters.user_id))) {
        whereClauses.push(`user_id = $${paramIndex++}`);
        params.push(Number(filters.user_id));
      } else {
        whereClauses.push(
          `user_id IN (SELECT id FROM users WHERE uuid::text = $${paramIndex++})`,
        );
        params.push(String(filters.user_id));
      }
    }
    if (filters?.status) {
      whereClauses.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters?.search) {
      whereClauses.push(
        `(order_code ILIKE $${paramIndex} OR shipping_address ILIKE $${paramIndex})`,
      );
      paramIndex++;
      params.push(`%${filters.search}%`);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `
      SELECT id, order_code, user_id, status, total_amount, shipping_fee, 
             discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
      FROM orders
      ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);
    const orders = await this.query<Order>(sql, params);

    for (const order of orders) {
      order.items = await this.findOrderItemsByOrderId(order.id);
    }
    return orders;
  }

  async findOrderById(id: string | number): Promise<Order | null> {
    const isNum = typeof id === 'number' || /^\d+$/.test(String(id));
    const sql = isNum
      ? `
      SELECT id, order_code, user_id, status, total_amount, shipping_fee, 
             discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
      FROM orders
      WHERE id = $1
    `
      : `
      SELECT id, order_code, user_id, status, total_amount, shipping_fee, 
             discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
      FROM orders
      WHERE order_code = $1
    `;
    const order = await this.queryOne<Order>(sql, [id]);
    if (order) {
      order.items = await this.findOrderItemsByOrderId(order.id);
    }
    return order;
  }

  async findOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const sql = `
      SELECT id, order_id, product_id, product_name, unit_price, quantity, subtotal,
             shipping_status, courier_name, tracking_number, estimated_delivery, delivered_at
      FROM order_items
      WHERE order_id = $1
      ORDER BY id ASC
    `;
    return this.query<OrderItem>(sql, [orderId]);
  }

  async updateOrder(id: string, dto: UpdateOrderDto): Promise<Order | null> {
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

  async deleteOrder(id: string): Promise<boolean> {
    const sql = `DELETE FROM orders WHERE id = $1 RETURNING id`;
    const res = await this.queryOne<{ id: string }>(sql, [id]);
    return !!res;
  }

  async getTotalRevenue(): Promise<number> {
    const sql = `
      SELECT COALESCE(SUM(total_amount), 0)::numeric as total_revenue
      FROM orders
      WHERE status IN ('DELIVERED', 'SHIPPED', 'PROCESSING')
    `;
    const res = await this.queryOne<{ total_revenue: string | number }>(sql);
    return Number(res?.total_revenue || 0);
  }
}
