'use client';

import React from 'react';
import { History } from 'lucide-react';
import { Payment, PaymentStatus } from '@/types/entities/payment';

interface PaymentHistorySectionProps {
  payments: Payment[];
  loading: boolean;
}

export function PaymentHistorySection({ payments, loading }: PaymentHistorySectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
          <History size={18} className="text-orange-600" />
          <span>Lịch Sử Giao Dịch Gần Đây</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Nhật ký các lượt thanh toán thành công và hoàn tiền
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
        {loading && payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">Đang tải lịch sử thanh toán...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">Chưa có giao dịch thanh toán nào.</div>
        ) : (
          payments.map((pay) => (
            <div key={pay.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center font-black text-xs shrink-0">
                  {pay.payment_method}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-zinc-900">
                    Thanh toán đơn #{pay.order_id}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                    <span>Mã GD: {pay.transaction_code || pay.id.slice(0, 10)}</span>
                    <span>•</span>
                    <span>
                      {new Date(pay.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm font-black text-zinc-900 block">
                  {Number(pay.amount).toLocaleString('vi-VN')}đ
                </span>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                    pay.payment_status === PaymentStatus.COMPLETED
                      ? 'bg-emerald-50 text-emerald-700'
                      : pay.payment_status === PaymentStatus.PENDING
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {pay.payment_status === PaymentStatus.COMPLETED
                    ? 'Thành công'
                    : pay.payment_status === PaymentStatus.PENDING
                    ? 'Đang chờ'
                    : 'Thất bại'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

