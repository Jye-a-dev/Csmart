'use client';

import { OrderStatus } from '@/types/entities/order';
import { Save, Loader2 } from 'lucide-react';

interface OrderStatusSectionProps {
  orderStatus: OrderStatus;
  setOrderStatus: (s: OrderStatus) => void;
  cancelReason: string;
  setCancelReason: (r: string) => void;
  saving: boolean;
  onSave: () => void;
}

export function OrderStatusSection({
  orderStatus,
  setOrderStatus,
  cancelReason,
  setCancelReason,
  saving,
  onSave,
}: OrderStatusSectionProps) {
  return (
    <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-4 py-2.5 font-mono text-xs font-black uppercase">Cập nhật trạng thái</div>
      <div className="p-4 space-y-3">
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
          className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-xs focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white"
        >
          {Object.values(OrderStatus).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {orderStatus === OrderStatus.CANCELLED && (
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Lý do hủy đơn..."
            className="w-full border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none resize-none bg-white"
          />
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-2.5 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Lưu Trạng Thái
        </button>
      </div>
    </div>
  );
}
