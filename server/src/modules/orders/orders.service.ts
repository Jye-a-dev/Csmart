import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './repositories/orders.repository';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    return this.ordersRepository.createOrder(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<Order[]> {
    return this.ordersRepository.findAllOrders(limit, offset);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    await this.findOne(id);
    const updated = await this.ordersRepository.updateOrder(id, dto);
    if (!updated) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.ordersRepository.deleteOrder(id);
  }

  async countAll(): Promise<number> {
    return this.ordersRepository.countAll('orders');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.ordersRepository.countBy('orders', filters);
  }
}
