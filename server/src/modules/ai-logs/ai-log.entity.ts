import { ApiProperty } from '@nestjs/swagger';

export class AiRequestLog {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id: string;

  @ApiProperty({ example: '/ai/ner' })
  endpoint: string;

  @ApiProperty({
    example: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    required: false,
  })
  user_id?: string;

  @ApiProperty({ example: 'Perform SQL request extraction', required: false })
  input_text?: string;

  @ApiProperty({ example: { result: 'success' } })
  output_json: Record<string, any>;

  @ApiProperty({ example: { result: 'corrected_success' }, required: false })
  corrected_output?: Record<string, any>;

  @ApiProperty({ example: 0.95, required: false })
  confidence_score?: number;

  @ApiProperty({ example: false })
  flag_for_review: boolean;

  @ApiProperty({ example: 120, required: false })
  execution_time_ms?: number;

  @ApiProperty({
    example: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    required: false,
  })
  review_id?: string;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;
}
