import { ApiProperty } from '@nestjs/swagger';

export class AiRequestLog {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '/ai/ner' })
  endpoint: string;

  @ApiProperty({ example: 1, required: false })
  user_id?: number;

  @ApiProperty({ example: 'Perform SQL request extraction', required: false })
  input_text?: string;

  @ApiProperty({ example: { result: 'success' } })
  output_json: Record<string, any>;

  @ApiProperty({ example: 0.95, required: false })
  confidence_score?: number;

  @ApiProperty({ example: false })
  flag_for_review: boolean;

  @ApiProperty({ example: 120, required: false })
  execution_time_ms?: number;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;
}
