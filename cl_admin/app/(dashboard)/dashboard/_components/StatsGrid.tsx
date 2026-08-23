'use client';

import { TrendingUp, ShoppingBag, ClipboardList } from 'lucide-react';

interface Stats {
  todayRevenue: number;
  totalOrders: number;
  outOfStock: number;
  pendingReview: number;
}

interface StatsGridProps {
  stats: Stats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Doanh thu thực tế */}
      <div className="border-4 border-[#09090B] bg-white p-8 shadow-[4px_4px_0px_0px_#09090B] hover:-translate-y-1 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider">Doanh thu thực tế</span>
          <div className="p-2 border-2 border-[#09090B] bg-[#F97316]/10 text-[#F97316]">
            <TrendingUp size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-black text-[#09090B] mb-2 leading-none">
          {stats.todayRevenue.toLocaleString('vi-VN')}đ
        </h3>
        <p className="text-[10px] font-mono text-zinc-500 uppercase">Tính từ các đơn hàng thành công</p>
      </div>

      {/* Tổng đơn hàng */}
      <div className="border-4 border-[#09090B] bg-white p-8 shadow-[4px_4px_0px_0px_#09090B] hover:-translate-y-1 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider">Tổng số đơn hàng</span>
          <div className="p-2 border-2 border-[#09090B] bg-blue-50 text-blue-600">
            <ShoppingBag size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-black text-[#09090B] mb-2 leading-none">
          {stats.totalOrders} Đơn
        </h3>
        <p className="text-[10px] font-mono text-zinc-500 uppercase">Cập nhật trực tiếp</p>
      </div>

      {/* Yêu cầu chờ duyệt HITL */}
      <div className="border-4 border-[#09090B] bg-zinc-950 text-white p-8 shadow-[4px_4px_0px_0px_#F97316] hover:-translate-y-1 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">Yêu cầu chờ duyệt HITL</span>
          <div className="p-2 border-2 border-zinc-800 bg-[#F97316] text-[#09090B]">
            <ClipboardList size={20} />
          </div>
        </div>
        <h3 className="text-3xl font-black text-[#FAFAFA] mb-2 leading-none">
          {stats.pendingReview} Hồ Sơ
        </h3>
        <p className="text-[10px] font-mono text-[#F97316] uppercase font-bold animate-pulse">Cần phê duyệt thủ công</p>
      </div>

    </div>
  );
}
