'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import { OrderStatus } from '@/types/entities/order';

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-700',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-700',
  [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700',
  [OrderStatus.CANCELLED]: 'bg-rose-100 text-rose-700',
  [OrderStatus.REFUNDED]: 'bg-zinc-100 text-zinc-600',
};

interface OrderDetailHeaderProps {
  orderCode: string;
  status: OrderStatus;
  createdAt: string;
  loading: boolean;
  onRefresh: () => void;
}

export function OrderDetailHeader({
  orderCode,
  status,
  createdAt,
  loading,
  onRefresh,
}: OrderDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.push('/orders')} className="p-2 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <div className="p-2 bg-[#09090B] text-[#F97316]"><ShoppingBag size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">{orderCode}</h1>
          <span className={`px-3 py-1 border-2 border-[#09090B] font-mono text-xs font-black uppercase ${ORDER_STATUS_COLORS[status]}`}>{status}</span>
        </div>
        <p className="font-mono text-xs text-zinc-500 ml-24">
          Tạo lúc: {new Date(createdAt).toLocaleString('vi-VN')}
        </p>
      </div>
      <button onClick={onRefresh} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
