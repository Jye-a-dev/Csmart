import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsInt,
} from 'class-validator';

export class CreateAiRequestLogDto {
  @ApiProperty({ example: '/ai/ner' })
  @IsString()
  endpoint: string;

  @ApiProperty({
    example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ example: 'Perform SQL request extraction', required: false })
  @IsOptional()
  @IsString()
  input_text?: string;

  @ApiProperty({ example: { result: 'success' } })
  @IsObject()
  output_json: Record<string, any>;

  @ApiProperty({ example: { result: 'corrected_success' }, required: false })
  @IsOptional()
  @IsObject()
  corrected_output?: Record<string, any>;

  @ApiProperty({ example: 0.95, required: false })
  @IsOptional()
  @IsNumber()
  confidence_score?: number;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  flag_for_review?: boolean;

  @ApiProperty({ example: 120, required: false })
  @IsOptional()
  @IsInt()
  execution_time_ms?: number;

  @ApiProperty({
    example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  review_id?: string;
}

export class UpdateAiRequestLogDto extends PartialType(CreateAiRequestLogDto) {}
