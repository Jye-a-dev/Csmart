import { ApiProperty } from '@nestjs/swagger';

export class ExtractedItem {
  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit_price: number;
}

export class OcrRecord {
  @ApiProperty()
  id: string;

  @ApiProperty()
  document_type: string;

  @ApiProperty()
  order_code: string;

  @ApiProperty({ required: false })
  tracking_number?: string;

  @ApiProperty({ required: false })
  courier_name?: string;

  @ApiProperty()
  customer_name: string;

  @ApiProperty({ required: false })
  phone_number?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty()
  total_amount: number;

  @ApiProperty()
  confidence_score: number;

  @ApiProperty()
  execution_time_ms: number;

  @ApiProperty({ required: false })
  image_url?: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [ExtractedItem] })
  extracted_items: ExtractedItem[];

  @ApiProperty({ type: [String] })
  raw_text_chunks: string[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
