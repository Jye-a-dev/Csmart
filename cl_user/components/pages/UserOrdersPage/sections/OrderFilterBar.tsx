'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Order, OrderStatus } from '@/types/entities/order';

interface OrderFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  orders: Order[];
}

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: OrderStatus.PENDING, label: 'Chờ xác nhận' },
  { key: OrderStatus.PROCESSING, label: 'Đang xử lý' },
  { key: OrderStatus.SHIPPED, label: 'Đang giao' },
  { key: OrderStatus.DELIVERED, label: 'Đã giao' },
  { key: OrderStatus.CANCELLED, label: 'Đã hủy' },
];

export function OrderFilterBar({
  searchQuery,
  onSearchChange,
  selectedTab,
  onSelectTab,
  orders,
}: OrderFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-3 sm:p-4 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Tìm theo mã đơn hàng, tên sản phẩm hoặc địa chỉ..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
        />
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.key === 'ALL'
              ? orders.length
              : orders.filter((o) => o.status === tab.key).length;
          const isActive = selectedTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectTab(tab.key)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

