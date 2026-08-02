import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsRepository } from './repositories/payments.repository';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsRepository.createPayment(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<Payment[]> {
    return this.paymentsRepository.findAllPayments(limit, offset);
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto): Promise<Payment> {
    await this.findOne(id);
    const updated = await this.paymentsRepository.updatePayment(id, dto);
    if (!updated) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.paymentsRepository.deletePayment(id);
  }

  async countAll(): Promise<number> {
    return this.paymentsRepository.countAll('payments');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.paymentsRepository.countBy('payments', filters);
  }
}
