import { ApiProperty } from '@nestjs/swagger';

export type HitlStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'LABELLED';

export class ReviewQueueItem {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', required: false })
  log_id?: string;

  @ApiProperty({ example: 'classify-intent' })
  endpoint: string;

  @ApiProperty({ example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', required: false })
  user_id?: string;

  @ApiProperty({ example: 'Tìm áo thun trắng', required: false })
  input_text?: string;

  @ApiProperty({ example: { intent: 'UNKNOWN' } })
  output_json: Record<string, any>;

  @ApiProperty({ example: 0.62, required: false })
  confidence_score?: number;

  @ApiProperty({ example: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', required: false })
  reviewer_id?: string;

  @ApiProperty({ example: 'PENDING' })
  status: HitlStatus;

  @ApiProperty({ example: 'Kết quả sai intent', required: false })
  reviewer_note?: string;

  @ApiProperty({ example: 'SEARCH_PRODUCT', required: false })
  corrected_label?: string;

  @ApiProperty({ example: '2026-08-11T21:00:00.000Z', required: false })
  reviewed_at?: Date;

  @ApiProperty({ example: '2026-08-11T20:00:00.000Z' })
  created_at: Date;
}
