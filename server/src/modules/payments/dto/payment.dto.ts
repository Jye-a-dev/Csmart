import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  order_id: number;

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

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
