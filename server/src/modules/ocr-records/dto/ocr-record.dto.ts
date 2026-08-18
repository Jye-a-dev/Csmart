import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOcrRecordDto {
  @ApiProperty({ example: 'INVOICE' })
  @IsString()
  @IsOptional()
  document_type?: string;

  @ApiProperty({ example: 'ORD-98421' })
  @IsString()
  @IsOptional()
  order_code?: string;

  @ApiProperty({ required: false, example: 'GHN-99823411' })
  @IsString()
  @IsOptional()
  tracking_number?: string;

  @ApiProperty({ required: false, example: 'Giao Hàng Nhanh (GHN)' })
  @IsString()
  @IsOptional()
  courier_name?: string;

  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString()
  @IsOptional()
  customer_name?: string;

  @ApiProperty({ required: false, example: '0988 123 456' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ required: false, example: '12 Đường Lê Lợi, Q.1, TP.HCM' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 1450000 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiProperty({ required: false, example: 0.95 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  confidence_score?: number;

  @ApiProperty({ required: false, example: 320 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  execution_time_ms?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ required: false, example: 'VERIFIED' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  extracted_items?: any[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  raw_text_chunks?: string[];
}

export class UpdateOcrRecordDto extends PartialType(CreateOcrRecordDto) {}
