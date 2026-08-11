import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsObject,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

/** Dùng nội bộ để enqueue vào HITL khi pipeline trả flag_for_review */
export class EnqueueReviewDto {
  @IsOptional()
  @IsInt()
  log_id?: number;

  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsString()
  input_text?: string;

  @IsObject()
  output_json: Record<string, any>;

  @IsOptional()
  @IsNumber()
  confidence_score?: number;
}

/** PATCH /hitl/queue/:id/approve */
export class ApproveReviewDto {
  @ApiProperty({ example: 'Kết quả chính xác', required: false })
  @IsOptional()
  @IsString()
  reviewer_note?: string;
}

/** PATCH /hitl/queue/:id/reject */
export class RejectReviewDto {
  @ApiProperty({ example: 'Intent phân loại sai', required: false })
  @IsOptional()
  @IsString()
  reviewer_note?: string;
}

/** PATCH /hitl/queue/:id/label */
export class LabelReviewDto {
  @ApiProperty({
    example: 'SEARCH_PRODUCT',
    description: 'Nhãn đúng do Admin gán lại',
  })
  @IsString()
  @IsNotEmpty()
  corrected_label: string;

  @ApiProperty({ example: 'Intent thực tế là tìm kiếm sản phẩm' })
  @IsOptional()
  @IsString()
  reviewer_note?: string;
}
