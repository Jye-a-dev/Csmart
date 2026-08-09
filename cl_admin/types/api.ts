// User Types
export interface User {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  is_active: boolean;
  avatar_url?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: number;
  user_id: number;
  recipient_name: string;
  phone: string;
  street_address: string;
  ward?: string;
  district: string;
  city_province: string;
  is_default: boolean;
  created_at: string;
}

export interface CreateUserDto {
  full_name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  is_active?: boolean;
  avatar_url?: string;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface CreateUserAddressDto {
  recipient_name: string;
  phone: string;
  street_address: string;
  ward?: string;
  district: string;
  city_province: string;
  is_default?: boolean;
}

export type UpdateUserAddressDto = Partial<CreateUserAddressDto>;

// Product Types
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

// Payment Types
export enum PaymentMethod {
  COD = 'COD',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_code?: string;
  amount: number;
  paid_at?: string;
  created_at: string;
}

export interface CreatePaymentDto {
  order_id: number;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  transaction_code?: string;
  amount: number;
  paid_at?: string;
}

export type UpdatePaymentDto = Partial<CreatePaymentDto>;

// Order Types
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum ItemShippingStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  shipping_status: ItemShippingStatus;
  courier_name?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
}

export interface Order {
  id: number;
  order_code: string;
  user_id?: number;
  status: OrderStatus;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  shipping_address: string;
  note?: string;
  cancel_reason?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderItemDto {
  product_id?: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  shipping_status?: ItemShippingStatus;
  courier_name?: string;
  tracking_number?: string;
}

export interface CreateOrderDto {
  order_code: string;
  user_id?: number;
  status?: OrderStatus;
  total_amount: number;
  shipping_fee?: number;
  discount_amount?: number;
  shipping_address: string;
  note?: string;
  cancel_reason?: string;
  items: CreateOrderItemDto[];
}

export type UpdateOrderDto = Partial<CreateOrderDto>;

// FAQ Types
export interface Faq {
  id: number;
  topic: string;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateFaqDto {
  topic: string;
  question: string;
  answer: string;
  is_active?: boolean;
}

export type UpdateFaqDto = Partial<CreateFaqDto>;

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  created_at: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

// AI Request Log Types
export interface AiRequestLog {
  id: number;
  endpoint: string;
  user_id?: number;
  input_text?: string;
  output_json: Record<string, unknown>;
  confidence_score?: number;
  flag_for_review: boolean;
  execution_time_ms?: number;
  created_at: string;
}

export interface CreateAiRequestLogDto {
  endpoint: string;
  user_id?: number;
  input_text?: string;
  output_json: Record<string, unknown>;
  confidence_score?: number;
  flag_for_review?: boolean;
  execution_time_ms?: number;
}

export type UpdateAiRequestLogDto = Partial<CreateAiRequestLogDto>;

// Auth Types
export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: User;
}

// Copilot Types
export interface ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatStreamDto {
  messages: ChatMessageDto[];
}

// AI Tasks Types
export interface SubmitOcrResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface SubmitEvaluateResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface JobStatusResponse {
  id: string;
  status: string;
  progress?: number;
  result?: unknown;
  failedReason?: string;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failuresCount: number;
  lastFailureTime: number | null;
}
