import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum ItemShippingStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export class OrderItem {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  order_id: number;

  @ApiProperty({ example: 1, required: false })
  product_id?: number;

  @ApiProperty({ example: 'Awesome Product' })
  product_name: string;

  @ApiProperty({ example: 99.99 })
  unit_price: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 199.98 })
  subtotal: number;

  @ApiProperty({ example: 'PENDING', enum: ItemShippingStatus })
  shipping_status: ItemShippingStatus;

  @ApiProperty({ example: 'GHN', required: false })
  courier_name?: string;

  @ApiProperty({ example: 'TRK123456789', required: false })
  tracking_number?: string;

  @ApiProperty({ example: '2026-08-05T22:00:00.000Z', required: false })
  estimated_delivery?: Date;

  @ApiProperty({ example: '2026-08-04T12:00:00.000Z', required: false })
  delivered_at?: Date;
}

export class Order {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ORD12345' })
  order_code: string;

  @ApiProperty({ example: 1, required: false })
  user_id?: number;

  @ApiProperty({ example: 'PENDING', enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ example: 250.0 })
  total_amount: number;

  @ApiProperty({ example: 30.0 })
  shipping_fee: number;

  @ApiProperty({ example: 10.0 })
  discount_amount: number;

  @ApiProperty({ example: '123 Main St, Ward 5, District 1, HCMC' })
  shipping_address: string;

  @ApiProperty({ example: 'Deliver after 5 PM', required: false })
  note?: string;

  @ApiProperty({ example: 'Out of stock', required: false })
  cancel_reason?: string;

  @ApiProperty({ type: [OrderItem], required: false })
  items?: OrderItem[];

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  updated_at: Date;
}
