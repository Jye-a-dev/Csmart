import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    return this.ordersRepository.createOrder(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<Order[]> {
    return this.ordersRepository.findAllOrders(limit, offset);
  }

  /**
   * Resolves order by either primary key UUID or human-readable order_code (e.g. ORD-10023).
   */
  async findOne(identifier: string): Promise<Order> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

    let order: Order | null = null;
    if (isUuid) {
      order = await this.ordersRepository.findOrderById(identifier);
    } else {
      const querySql = `
        SELECT id, order_code, user_id, status, total_amount, shipping_fee, 
               discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
        FROM orders
        WHERE order_code = $1
      `;
      order = await this.ordersRepository.queryOne<Order>(querySql, [identifier]);
      if (order) {
        order.items = await this.ordersRepository.findOrderItemsByOrderId(order.id);
      }
    }

    if (!order) {
      throw new NotFoundException(`Order with identifier '${identifier}' not found`);
    }
    return order;
  }

  async update(identifier: string, dto: UpdateOrderDto): Promise<Order> {
    const existing = await this.findOne(identifier);

    // Business guardrail: do not modify shipping address or cancel delivered orders
    if (existing.status === 'DELIVERED' && (dto.status === 'CANCELLED' || dto.shipping_address)) {
      throw new BadRequestException(`Cannot alter or cancel already DELIVERED order #${existing.order_code}`);
    }

    const updated = await this.ordersRepository.updateOrder(existing.id, dto);
    if (!updated) {
      throw new NotFoundException(`Order with ID ${existing.id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.ordersRepository.deleteOrder(id);
  }

  async countAll(): Promise<number> {
    return this.ordersRepository.countAll('orders');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.ordersRepository.countBy('orders', filters);
  }

  async getTotalRevenue(): Promise<number> {
    return this.ordersRepository.getTotalRevenue();
  }
}
