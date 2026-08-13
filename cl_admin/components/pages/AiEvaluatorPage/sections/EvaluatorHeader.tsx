'use client';

import { FlaskConical, RefreshCw } from 'lucide-react';

interface EvaluatorHeaderProps {
  logsLoading: boolean;
  onRefresh: () => void;
}

export function EvaluatorHeader({ logsLoading, onRefresh }: EvaluatorHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#09090B] text-[#F97316]"><FlaskConical size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">AI Evaluator</h1>
        </div>
        <p className="font-mono text-xs text-zinc-500">Fine-Tuning Hub — Đánh giá độ chính xác & xuất dữ liệu huấn luyện</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onRefresh} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
          <RefreshCw size={15} className={logsLoading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}
