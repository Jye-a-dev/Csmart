export type OcrDocType = 'INVOICE' | 'SHIPPING_LABEL' | 'PRODUCT_LABEL';

export interface ExtractedItem {
  name: string;
  quantity: number;
  unit_price: number;
  sku?: string;
  origin?: string;
  type?: string;
  color?: string;
  stock_quantity?: number;
  status?: string;
  specifications?: string;
}

export interface OcrExtractedData {
  document_type: OcrDocType;
  order_code: string;
  tracking_number?: string;
  courier_name?: string;
  customer_name: string;
  phone_number: string;
  address: string;
  total_amount: number;
  confidence_score: number;
  execution_time_ms: number;
  image_url?: string;
  extracted_items: ExtractedItem[];
  raw_text_chunks: string[];
  product_name?: string;
  origin?: string;
  type?: string;
  color?: string;
}

export interface OcrRecordItem extends OcrExtractedData {
  id: string;
  image_url: string;
  created_at: string;
  updated_at?: string;
  status: 'VERIFIED' | 'NEEDS_REVIEW';
  notes?: string;
}
