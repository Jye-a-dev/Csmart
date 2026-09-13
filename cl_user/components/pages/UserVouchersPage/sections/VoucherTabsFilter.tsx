'use client';

import React from 'react';
import { Gift, Truck, Percent, Sparkles, Clock } from 'lucide-react';
import type { Voucher } from './VoucherCard';

interface VoucherTabsFilterProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  vouchers: Voucher[];
}

const VOUCHER_TABS = [
  { key: 'ALL', label: 'Tất Cả Voucher', icon: Gift },
  { key: 'FREESHIP', label: 'Vận Chuyển', icon: Truck },
  { key: 'DISCOUNT', label: 'Giảm Giá Đơn Hàng', icon: Percent },
  { key: 'VIP', label: 'Đặc Quyền VIP', icon: Sparkles },
  { key: 'EXPIRED', label: 'Đã Hết Hạn', icon: Clock },
];

export function VoucherTabsFilter({
  selectedTab,
  onSelectTab,
  vouchers,
}: VoucherTabsFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {VOUCHER_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = selectedTab === tab.key;
        const count =
          tab.key === 'EXPIRED'
            ? vouchers.filter((v) => v.is_expired).length
            : tab.key === 'ALL'
            ? vouchers.filter((v) => !v.is_expired).length
            : vouchers.filter((v) => !v.is_expired && v.category === tab.key).length;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Icon size={14} />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

