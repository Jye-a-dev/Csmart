import { ApiProperty } from '@nestjs/swagger';

export class Faq {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Shipping' })
  topic: string;

  @ApiProperty({ example: 'How long does shipping take?' })
  question: string;

  @ApiProperty({ example: 'Standard shipping takes 3-5 business days.' })
  answer: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;
}
