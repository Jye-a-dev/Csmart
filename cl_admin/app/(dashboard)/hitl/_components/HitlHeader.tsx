'use client';

import { Bot, RefreshCw } from 'lucide-react';

interface HitlHeaderProps {
  filteredCount: number;
  loading: boolean;
  onRefresh: () => void;
}

export function HitlHeader({ filteredCount, loading, onRefresh }: HitlHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#09090B] text-[#F97316]">
            <Bot size={20} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">HITL Queue</h1>
        </div>
        <p className="font-mono text-xs text-zinc-500">
          Hàng chờ duyệt thủ công — {filteredCount} yêu cầu cần review
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="p-3 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 font-mono text-xs font-bold"
      >
        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        Làm mới
      </button>
    </div>
  );
}
