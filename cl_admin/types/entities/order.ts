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
  id: string;
  order_id: string;
  product_id?: string;
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
  id: string;
  order_code: string;
  user_id?: string;
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
  product_id?: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  shipping_status?: ItemShippingStatus;
  courier_name?: string;
  tracking_number?: string;
}

export interface CreateOrderDto {
  order_code: string;
  user_id?: string;
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
