'use client';

import { Play, Loader2 } from 'lucide-react';

interface EvaluatorRunJobSectionProps {
  jobId: string | null;
  jobStatus: string | null;
  taskLoading: boolean;
  onRunEvaluate: () => void;
}

export function EvaluatorRunJobSection({
  jobId,
  jobStatus,
  taskLoading,
  onRunEvaluate,
}: EvaluatorRunJobSectionProps) {
  return (
    <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Play size={18} className="text-[#F97316]" />
        <h2 className="font-mono font-black text-sm uppercase text-[#09090B]">Chạy Evaluate Job</h2>
      </div>
      <p className="font-mono text-xs text-zinc-500">Khởi động background job đánh giá toàn bộ logs trong queue BullMQ. Job sẽ cập nhật metrics confidence và flag bất thường.</p>
      {jobId && (
        <div className="p-3 border-2 border-[#09090B] bg-zinc-50 font-mono text-xs space-y-1">
          <div className="text-zinc-500">Job ID: <span className="font-black text-[#09090B]">{jobId}</span></div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Status:</span>
            {jobStatus === 'active' || jobStatus === 'waiting' ? (
              <span className="flex items-center gap-1 text-amber-600 font-black"><Loader2 size={12} className="animate-spin" />{jobStatus?.toUpperCase()}</span>
            ) : jobStatus === 'completed' ? (
              <span className="text-emerald-600 font-black">COMPLETED ✓</span>
            ) : (
              <span className="text-rose-600 font-black">{jobStatus?.toUpperCase()}</span>
            )}
          </div>
        </div>
      )}
      <button
        onClick={onRunEvaluate}
        disabled={taskLoading || jobStatus === 'active' || jobStatus === 'waiting'}
        className="w-full py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {taskLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
        Chạy Evaluate
      </button>
    </div>
  );
}
