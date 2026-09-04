import React from 'react';
import type { User } from '@/types/entities/user';
import { Sparkles, ShoppingBag, TrendingUp, Gift } from 'lucide-react';

export interface UserPortalHeroBannerProps {
  user: User | null;
  points: number;
  tier: string;
  totalOrders: number;
  totalSpent: number;
}

export function UserPortalHeroBanner({
  user,
  points,
  tier,
  totalOrders,
  totalSpent,
}: UserPortalHeroBannerProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-6 sm:p-8 text-white shadow-xl border border-zinc-700/50">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} className="text-orange-400" />
                <span>CSMART MEMBERSHIP</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Xin chào, {user?.full_name || 'Khách Hàng'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                Chào mừng bạn quay trở lại! Bạn đang có <strong className="text-orange-400">{points} điểm CSMART</strong> tích lũy và hưởng quyền lợi hạng <strong className="text-orange-400">{tier}</strong>.
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 backdrop-blur-xs flex flex-col">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                  <ShoppingBag size={12} className="text-orange-400" /> Tổng Đơn
                </span>
                <span className="text-lg font-black text-white mt-1">{totalOrders}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 backdrop-blur-xs flex flex-col">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                  <TrendingUp size={12} className="text-emerald-400" /> Tổng Chi Tiêu
                </span>
                <span className="text-lg font-black text-white mt-1">
                  {totalSpent > 0 ? `${(totalSpent / 1000000).toFixed(1)}M` : '0đ'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 backdrop-blur-xs flex flex-col">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                  <Gift size={12} className="text-amber-400" /> Ưu Đãi Khả Dụng
                </span>
                <span className="text-lg font-black text-white mt-1">3 Mã</span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
