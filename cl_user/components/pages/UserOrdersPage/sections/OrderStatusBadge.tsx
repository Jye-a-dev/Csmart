'use client';

import React from 'react';
import { Clock, Package, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { OrderStatus } from '@/types/entities/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status) {
    case OrderStatus.PENDING:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={13} />
          Chờ xác nhận
        </span>
      );
    case OrderStatus.PROCESSING:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Package size={13} />
          Đang đóng gói
        </span>
      );
    case OrderStatus.SHIPPED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Truck size={13} />
          Đang vận chuyển
        </span>
      );
    case OrderStatus.DELIVERED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} />
          Giao thành công
        </span>
      );
    case OrderStatus.CANCELLED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={13} />
          Đã hủy
        </span>
      );
    case OrderStatus.REFUNDED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <RotateCcw size={13} />
          Đã hoàn tiền
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
          {status}
        </span>
      );
  }
}

