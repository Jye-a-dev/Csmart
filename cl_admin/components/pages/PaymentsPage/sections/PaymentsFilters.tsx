'use client';

import { PaymentMethod, PaymentStatus } from '@/types/entities/payment';
import { Search } from 'lucide-react';
import { METHOD_LABELS } from './PaymentsBreakdown';

interface StatusConfigItem {
  label: string;
  cls: string;
  icon: React.ElementType;
}

interface PaymentsFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  methodFilter: PaymentMethod | 'ALL';
  setMethodFilter: (m: PaymentMethod | 'ALL') => void;
  statusFilter: PaymentStatus | 'ALL';
  setStatusFilter: (s: PaymentStatus | 'ALL') => void;
  statusConfig: Record<PaymentStatus, StatusConfigItem>;
}

export function PaymentsFilters({
  search,
  setSearch,
  methodFilter,
  setMethodFilter,
  statusFilter,
  setStatusFilter,
  statusConfig,
}: PaymentsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400"><Search size={14} /></div>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm Order ID, mã giao dịch..." className="w-full pl-9 pr-4 py-2.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white shadow-[2px_2px_0px_0px_#09090B]" />
      </div>
      <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'ALL')} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
        <option value="ALL">Tất cả phương thức</option>
        {Object.values(PaymentMethod).map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
      </select>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
        <option value="ALL">Tất cả trạng thái</option>
        {Object.values(PaymentStatus).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
      </select>
    </div>
  );
}
