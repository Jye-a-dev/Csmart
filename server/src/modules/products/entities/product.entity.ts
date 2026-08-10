import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRE_ORDER = 'PRE_ORDER',
  DISCONTINUED = 'DISCONTINUED',
}

export class Product {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'PROD12345' })
  sku: string;

  @ApiProperty({ example: 'Awesome Product' })
  name: string;

  @ApiProperty({ example: 'awesome-product' })
  slug: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  category_id?: string;

  @ApiProperty({ example: 'Product description details', required: false })
  description?: string;

  @ApiProperty({ example: 99.99 })
  base_price: number;

  @ApiProperty({ example: 79.99, required: false })
  discount_price?: number;

  @ApiProperty({ example: 100 })
  stock_quantity: number;

  @ApiProperty({ example: 'IN_STOCK', enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty({ example: true })
  is_published: boolean;

  @ApiProperty({ example: ['electronics', 'gadget'], required: false })
  tags?: string[];

  @ApiProperty({ example: { color: 'red', size: 'M' }, required: false })
  attributes?: Record<string, any>;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  updated_at: Date;
}
