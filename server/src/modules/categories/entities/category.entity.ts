import { ApiProperty } from '@nestjs/swagger';

export class Category {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'electronics' })
  slug: string;

  @ApiProperty({ example: 'Electronic gadgets and items', required: false })
  description?: string;

  @ApiProperty({ example: null, required: false })
  parent_id?: number;

  @ApiProperty({ example: '2026-08-02T22:06:59.000Z' })
  created_at: Date;
}
