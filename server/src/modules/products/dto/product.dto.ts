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
} from 'class-validator';
import { Transform } from 'class-transformer';
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

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @Transform(({ value }) => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'null' ||
      value === 'undefined'
    )
      return undefined;
    return String(value);
  })
  @IsOptional()
  category_id?: string;

  @ApiProperty({ example: 'Product description details', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Short description text', required: false })
  @IsOptional()
  @IsString()
  short_description?: string;

  @ApiProperty({ example: 'Specifications text/HTML', required: false })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({
    example: [{ name: 'Đen', hex: '#000000', in_stock: true }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  colors?: Record<string, any>[];

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

  @ApiProperty({ example: ['data:image/jpeg;base64,...'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
