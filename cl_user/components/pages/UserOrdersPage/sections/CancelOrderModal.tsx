'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Order } from '@/types/entities/order';

interface CancelOrderModalProps {
  order: Order | null;
  cancelling: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CANCEL_REASONS = [
  'Đổi ý không muốn mua nữa',
  'Muốn thay đổi địa chỉ nhận hàng',
  'Muốn thay đổi mã giảm giá / voucher',
  'Thời gian giao hàng quá lâu',
  'Khác',
];

export function CancelOrderModal({
  order,
  cancelling,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!order) return null;

  const handleConfirm = () => {
    const finalReason =
      cancelReason === 'Khác' ? customReason.trim() || 'Khác' : cancelReason;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-rose-600">
          <AlertCircle size={24} />
          <h3 className="text-base font-black text-zinc-900">Xác Nhận Hủy Đơn Hàng</h3>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.order_code}</strong>? Sau
          khi hủy, thao tác này không thể hoàn tác.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-700 block">Chọn lý do hủy:</label>
          {CANCEL_REASONS.map((reason) => (
            <label
              key={reason}
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs hover:bg-zinc-50 cursor-pointer"
            >
              <input
                type="radio"
                name="cancel_reason"
                checked={cancelReason === reason}
                onChange={() => setCancelReason(reason)}
                className="accent-orange-600"
              />
              <span>{reason}</span>
            </label>
          ))}

          {cancelReason === 'Khác' && (
            <textarea
              placeholder="Nhập lý do cụ thể..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full mt-2 p-3 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-orange-500"
              rows={2}
            />
          )}
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Giữ đơn hàng
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={cancelling}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {cancelling ? 'Đang hủy...' : 'Đồng ý hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}

