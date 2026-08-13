'use client';

import { Order } from '@/types/entities/order';
import { MapPin, StickyNote, Clock } from 'lucide-react';

export const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

interface OrderInfoCardProps {
  order: Order;
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  return (
    <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-4 py-2.5 font-mono text-xs font-black uppercase">Thông tin đơn hàng</div>
      <div className="p-4 space-y-3 font-mono text-xs">
        <div className="flex items-start gap-2">
          <MapPin size={13} className="text-[#F97316] mt-0.5 shrink-0" />
          <div><span className="font-black text-zinc-500 uppercase">Địa chỉ:</span><p className="text-[#09090B] mt-0.5">{order.shipping_address}</p></div>
        </div>
        {order.note && (
          <div className="flex items-start gap-2">
            <StickyNote size={13} className="text-[#F97316] mt-0.5 shrink-0" />
            <div><span className="font-black text-zinc-500 uppercase">Ghi chú:</span><p className="text-[#09090B] mt-0.5 italic">{order.note}</p></div>
          </div>
        )}
        {order.cancel_reason && (
          <div className="flex items-start gap-2">
            <Clock size={13} className="text-rose-500 mt-0.5 shrink-0" />
            <div><span className="font-black text-rose-500 uppercase">Lý do hủy:</span><p className="text-rose-600 mt-0.5">{order.cancel_reason}</p></div>
          </div>
        )}
        <div className="border-t border-zinc-200 pt-3 space-y-1.5">
          <div className="flex justify-between"><span className="text-zinc-500">Tổng tiền hàng</span><span className="font-black">{fmt(order.total_amount)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">Phí ship</span><span>{fmt(order.shipping_fee)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">Giảm giá</span><span className="text-emerald-600">-{fmt(order.discount_amount)}</span></div>
          <div className="flex justify-between border-t border-[#09090B] pt-2 mt-2"><span className="font-black text-[#09090B]">Thanh toán</span><span className="font-black text-[#F97316] text-sm">{fmt(order.total_amount + order.shipping_fee - order.discount_amount)}</span></div>
        </div>
      </div>
    </div>
  );
}
