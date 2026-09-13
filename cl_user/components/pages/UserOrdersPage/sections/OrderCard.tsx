'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Order, OrderStatus } from '@/types/entities/order';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
  onCancel: (order: Order) => void;
  onViewDetail: (order: Order) => void;
}

export function OrderCard({ order, onCancel, onViewDetail }: OrderCardProps) {
  const isCancellable =
    order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;
  const formattedTotal = Number(order.total_amount).toLocaleString('vi-VN');
  const formattedDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs hover:border-orange-200 transition-all overflow-hidden">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-zinc-900">
                #{order.order_code}
              </span>
              <span className="text-zinc-400 text-xs">•</span>
              <span className="text-xs font-medium text-zinc-500">{formattedDate}</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-xs sm:max-w-md">
              Giao đến: {order.shipping_address}
            </p>
          </div>
        </div>
        <div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 sm:p-5 divide-y divide-zinc-100">
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => (
            <div
              key={item.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0 font-black text-xs">
                  CS
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                    {item.product_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                    <span>SL: x{item.quantity}</span>
                    {item.courier_name && (
                      <>
                        <span>•</span>
                        <span className="text-orange-600 font-semibold">
                          {item.courier_name}
                          {item.tracking_number ? ` (${item.tracking_number})` : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs sm:text-sm font-extrabold text-zinc-900">
                  {Number(item.subtotal || item.unit_price * item.quantity).toLocaleString('vi-VN')}
                  đ
                </p>
                <p className="text-[10px] text-zinc-400">
                  {Number(item.unit_price).toLocaleString('vi-VN')}đ / món
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500 italic">Đơn hàng không có mục hiển thị.</p>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/30 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-zinc-600">
          <span>Tổng thanh toán: </span>
          <span className="text-base sm:text-lg font-black text-orange-600">
            {formattedTotal}đ
          </span>
          {order.discount_amount > 0 && (
            <span className="ml-2 text-[11px] text-emerald-600 font-semibold">
              (Đã giảm {Number(order.discount_amount).toLocaleString('vi-VN')}đ)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCancellable && (
            <button
              type="button"
              onClick={() => onCancel(order)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Hủy đơn
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewDetail(order)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Chi tiết</span>
            <ChevronRight size={14} />
          </button>
          <Link
            href="/user"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-xs"
          >
            Mua lại
          </Link>
        </div>
      </div>
    </div>
  );
}

