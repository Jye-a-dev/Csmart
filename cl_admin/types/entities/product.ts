export enum ProductStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRE_ORDER = 'PRE_ORDER',
  DISCONTINUED = 'DISCONTINUED',
}

export interface ProductColor {
  name: string;
  hex?: string;
  in_stock: boolean;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  category_id?: string; // UUID reference to categories
  description?: string;
  short_description?: string;
  specifications?: string;
  colors?: ProductColor[];
  base_price: number;
  discount_price?: number;
  stock_quantity: number;
  status: ProductStatus;
  is_published: boolean;
  tags?: string[];
  attributes?: Record<string, unknown>;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  slug: string;
  category_id?: string; // UUID reference to categories
  description?: string;
  short_description?: string;
  specifications?: string;
  colors?: ProductColor[];
  base_price: number;
  discount_price?: number;
  stock_quantity?: number;
  status?: ProductStatus;
  is_published?: boolean;
  tags?: string[];
  attributes?: Record<string, unknown>;
  images?: string[];
}

export type UpdateProductDto = Partial<CreateProductDto>;
