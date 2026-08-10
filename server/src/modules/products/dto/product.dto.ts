import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'PROD12345' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Awesome Product' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'awesome-product' })
  @IsString()
  slug: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: 'Product description details', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  base_price: number;

  @ApiProperty({ example: 79.99, required: false })
  @IsOptional()
  @IsNumber()
  discount_price?: number;

  @ApiProperty({ example: 100, default: 0 })
  @IsOptional()
  @IsInt()
  stock_quantity?: number;

  @ApiProperty({
    example: 'IN_STOCK',
    enum: ProductStatus,
    default: 'IN_STOCK',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @ApiProperty({ example: ['electronics', 'gadget'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: { color: 'red', size: 'M' }, required: false })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
