'use client';

import { HelpCircle, RefreshCw, Plus } from 'lucide-react';

interface FaqsHeaderProps {
  totalFaqs: number;
  activeCount: number;
  loading: boolean;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
}

export function FaqsHeader({
  totalFaqs,
  activeCount,
  loading,
  onRefresh,
  onOpenCreateModal,
}: FaqsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#09090B] text-[#F97316]"><HelpCircle size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">Quản Lý FAQs</h1>
        </div>
        <p className="font-mono text-xs text-zinc-500">{totalFaqs} câu hỏi · {activeCount} đang kích hoạt · Phục vụ endpoint ASK_FAQ</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onRefresh} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        <button onClick={onOpenCreateModal} className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 text-xs">
          <Plus size={15} /> Thêm FAQ
        </button>
      </div>
    </div>
  );
}
