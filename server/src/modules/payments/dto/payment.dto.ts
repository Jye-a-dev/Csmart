import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsEnum, IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ example: 'CREDIT_CARD', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: 'PENDING', enum: PaymentStatus, default: 'PENDING' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @ApiProperty({ example: 'TXN123456789', required: false })
  @IsOptional()
  @IsString()
  transaction_code?: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z', required: false })
  @IsOptional()
  paid_at?: Date;
}

export class ProcessPaymentDto {
  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ example: 150000.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'MOMO', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: 'http://localhost:5000/orders/success', required: false })
  @IsOptional()
  @IsString()
  return_url?: string;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}

