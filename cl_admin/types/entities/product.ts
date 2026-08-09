export enum ProductStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRE_ORDER = 'PRE_ORDER',
  DISCONTINUED = 'DISCONTINUED',
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  category_id?: number;
  description?: string;
  base_price: number;
  discount_price?: number;
  stock_quantity: number;
  status: ProductStatus;
  is_published: boolean;
  tags?: string[];
  attributes?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  slug: string;
  category_id?: number;
  description?: string;
  base_price: number;
  discount_price?: number;
  stock_quantity?: number;
  status?: ProductStatus;
  is_published?: boolean;
  tags?: string[];
  attributes?: Record<string, unknown>;
}

export type UpdateProductDto = Partial<CreateProductDto>;
