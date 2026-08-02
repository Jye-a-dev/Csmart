import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  COD = 'COD',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class Payment {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  order_id: number;

  @ApiProperty({ example: 'CREDIT_CARD', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @ApiProperty({ example: 'PENDING', enum: PaymentStatus })
  payment_status: PaymentStatus;

  @ApiProperty({ example: 'TXN123456789', required: false })
  transaction_code?: string;

  @ApiProperty({ example: 150.0 })
  amount: number;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z', required: false })
  paid_at?: Date;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;
}
