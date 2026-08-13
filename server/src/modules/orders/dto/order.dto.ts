import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, ItemShippingStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', required: false })
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @ApiProperty({ example: 'Awesome Product' })
  @IsString()
  product_name: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 'PENDING',
    enum: ItemShippingStatus,
    default: 'PENDING',
  })
  @IsOptional()
  @IsEnum(ItemShippingStatus)
  shipping_status?: ItemShippingStatus;

  @ApiProperty({ example: 'GHN', required: false })
  @IsOptional()
  @IsString()
  courier_name?: string;

  @ApiProperty({ example: 'TRK123456789', required: false })
  @IsOptional()
  @IsString()
  tracking_number?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'ORD12345' })
  @IsString()
  order_code: string;

  @ApiProperty({ example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', required: false })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ example: 'PENDING', enum: OrderStatus, default: 'PENDING' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  total_amount: number;

  @ApiProperty({ example: 30.0, default: 0 })
  @IsOptional()
  @IsNumber()
  shipping_fee?: number;

  @ApiProperty({ example: 10.0, default: 0 })
  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @ApiProperty({ example: '123 Main St, Ward 5, District 1, HCMC' })
  @IsString()
  shipping_address: string;

  @ApiProperty({ example: 'Deliver after 5 PM', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 'Out of stock', required: false })
  @IsOptional()
  @IsString()
  cancel_reason?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
