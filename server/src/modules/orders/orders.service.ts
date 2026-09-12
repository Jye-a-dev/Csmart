import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { Order, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    return this.ordersRepository.createOrder(dto);
  }

  async findAll(
    limit?: number,
    offset?: number,
    filters?: { user_id?: string; status?: string; search?: string },
  ): Promise<Order[]> {
    return this.ordersRepository.findAllOrders(limit, offset, filters);
  }

  /**
   * Resolves order by either primary key UUID or human-readable order_code (e.g. ORD-10023).
   */
  async findOne(identifier: string): Promise<Order> {
    const isNumber = /^\d+$/.test(identifier);
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        identifier,
      );

    let order: Order | null = null;
    if (isNumber || isUuid) {
      order = await this.ordersRepository.findOrderById(identifier);
    } else {
      const querySql = `
        SELECT id, order_code, user_id, status, total_amount, shipping_fee, 
               discount_amount, shipping_address, note, cancel_reason, created_at, updated_at
        FROM orders
        WHERE order_code = $1
      `;
      order = await this.ordersRepository.queryOne<Order>(querySql, [
        identifier,
      ]);
      if (order) {
        order.items = await this.ordersRepository.findOrderItemsByOrderId(
          order.id,
        );
      }
    }

    if (!order) {
      throw new NotFoundException(
        `Order with identifier '${identifier}' not found`,
      );
    }
    return order;
  }

  async update(identifier: string, dto: UpdateOrderDto): Promise<Order> {
    const existing = await this.findOne(identifier);

    // Business state machine guardrail: do not cancel or alter orders that are already shipped or delivered
    const immutableStatuses: OrderStatus[] = [
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];
    if (
      dto.status === OrderStatus.CANCELLED &&
      immutableStatuses.includes(existing.status)
    ) {
      throw new BadRequestException(
        `Cannot cancel order #${existing.order_code} because it is already in '${existing.status}' status. Manual return workflow required.`,
      );
    }

    if (dto.shipping_address && immutableStatuses.includes(existing.status)) {
      throw new BadRequestException(
        `Cannot update shipping address for order #${existing.order_code} because it is already in '${existing.status}' status.`,
      );
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
