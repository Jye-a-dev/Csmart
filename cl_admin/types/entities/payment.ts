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
