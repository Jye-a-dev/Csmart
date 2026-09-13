'use client';

import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Order } from '@/types/entities/order';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <h3 className="text-base font-black text-zinc-900">
              Chi Tiết Đơn Hàng #{order.order_code}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ngày đặt:{' '}
              {new Date(order.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Shipping Address */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/70 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
              <MapPin size={15} className="text-orange-600" />
              <span>Địa chỉ giao hàng</span>
            </div>
            <p className="text-xs text-zinc-800 font-medium pl-6">
              {order.shipping_address}
            </p>
            {order.note && (
              <p className="text-[11px] text-zinc-500 italic pl-6">
                Ghi chú: {order.note}
              </p>
            )}
          </div>

          {/* Status Roadmap */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Trạng Thái Đơn Hàng
            </h4>
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900">Tình trạng hiện tại:</p>
                <div className="mt-1">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              {order.cancel_reason && (
                <div className="text-right">
                  <p className="text-[11px] font-medium text-rose-600">
                    Lý do hủy: {order.cancel_reason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Danh Sách Sản Phẩm
            </h4>
            <div className="border border-zinc-200/80 rounded-2xl divide-y divide-zinc-100 overflow-hidden">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{item.product_name}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Số lượng: {item.quantity} x{' '}
                      {Number(item.unit_price).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-zinc-900">
                    {Number(item.subtotal || item.unit_price * item.quantity).toLocaleString(
                      'vi-VN'
                    )}
                    đ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/70 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Tiền hàng:</span>
              <span>
                {Number(
                  Number(order.total_amount) -
                    Number(order.shipping_fee) +
                    Number(order.discount_amount)
                ).toLocaleString('vi-VN')}
                đ
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Phí vận chuyển:</span>
              <span>{Number(order.shipping_fee || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Giảm giá voucher:</span>
                <span>-{Number(order.discount_amount).toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-zinc-900 text-sm">
              <span>Tổng thanh toán:</span>
              <span className="text-orange-600 text-base">
                {Number(order.total_amount).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 flex justify-end bg-zinc-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-300 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

