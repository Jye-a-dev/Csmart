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
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  order_id: string;

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
