'use client';

import { ScrollText, RefreshCw, Plus, Trash2 } from 'lucide-react';

interface AiLogsHeaderProps {
  loading: boolean;
  totalLogsCount: number;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onDeleteAll: () => void;
}

export function AiLogsHeader({
  loading,
  totalLogsCount,
  onRefresh,
  onOpenCreate,
  onDeleteAll,
}: AiLogsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#09090B] text-[#F97316]"><ScrollText size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">AI Telemetry Logs</h1>
        </div>
        <p className="font-mono text-xs text-zinc-500">Nhật ký toàn bộ pipeline_ai requests</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onRefresh} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 font-mono text-xs font-bold">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Làm mới
        </button>
        <button onClick={onOpenCreate} className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 text-xs">
          <Plus size={15} /> Thêm AI Log
        </button>
        <button
          onClick={onDeleteAll}
          disabled={totalLogsCount === 0 || loading}
          className="px-4 py-3 border-2 border-[#09090B] bg-rose-400 text-white font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={15} /> Xóa Tất Cả
        </button>
      </div>
    </div>
  );
}
