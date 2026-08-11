import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateAiRequestLogDto {
  @ApiProperty({ example: '/ai/ner' })
  @IsString()
  endpoint: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiProperty({ example: 'Perform SQL request extraction', required: false })
  @IsOptional()
  @IsString()
  input_text?: string;

  @ApiProperty({ example: { result: 'success' } })
  @IsObject()
  output_json: Record<string, any>;

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

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsInt()
  review_id?: number;
}

export class UpdateAiRequestLogDto extends PartialType(CreateAiRequestLogDto) {}
