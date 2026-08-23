'use client';

import { AiRequestLog } from '@/types/ai/log';
import { X, Pencil, Trash2 } from 'lucide-react';

interface AiLogsDetailModalProps {
  detailLog: AiRequestLog | null;
  onClose: () => void;
  onEditLog?: (log: AiRequestLog) => void;
  onDeleteLog?: (id: string) => void;
}

export function AiLogsDetailModal({
  detailLog,
  onClose,
  onEditLog,
  onDeleteLog,
}: AiLogsDetailModalProps) {
  if (!detailLog) return null;

  return (
    <div className="fixed inset-0 bg-[#09090B]/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b-2 border-[#09090B] bg-[#09090B] text-white">
          <span className="font-mono font-black uppercase text-sm">Log #{String(detailLog.id).slice(0, 8)}... — {detailLog.endpoint}</span>
          <button onClick={onClose} className="p-1 hover:text-[#F97316] cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 font-mono text-xs">
          <div><span className="font-black text-[#09090B]">Input:</span><p className="mt-1 text-zinc-600 bg-zinc-50 p-3 border border-zinc-200 whitespace-pre-wrap">{detailLog.input_text ?? '—'}</p></div>
          <div><span className="font-black text-[#09090B]">Output JSON (AI Ban đầu):</span><pre className="mt-1 bg-[#09090B] text-emerald-400 p-3 overflow-x-auto text-[10px] max-h-48">{JSON.stringify(detailLog.output_json, null, 2)}</pre></div>
          {detailLog.corrected_output && (
            <div className="p-3 bg-amber-50 border-2 border-[#09090B]">
              <span className="font-black text-[#09090B] flex items-center gap-1.5 text-xs">
                ✨ Corrected Output JSON (Dùng Cho Fine-Tune):
              </span>
              <pre className="mt-1 bg-white text-[#09090B] p-3 border border-[#09090B] overflow-x-auto text-[10px] max-h-48">
                {typeof detailLog.corrected_output === 'object'
                  ? JSON.stringify(detailLog.corrected_output, null, 2)
                  : String(detailLog.corrected_output)}
              </pre>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><span className="font-black">Confidence:</span> {detailLog.confidence_score != null ? `${(detailLog.confidence_score * 100).toFixed(1)}%` : 'N/A'}</div>
            <div><span className="font-black">Latency:</span> {detailLog.execution_time_ms ? `${detailLog.execution_time_ms}ms` : 'N/A'}</div>
            <div><span className="font-black">Flag:</span> <span className={detailLog.flag_for_review ? 'text-rose-600 font-black' : 'text-emerald-600'}>{detailLog.flag_for_review ? 'CẦN REVIEW' : 'SẠCH'}</span></div>
            <div><span className="font-black">Created:</span> {new Date(detailLog.created_at).toLocaleString('vi-VN')}</div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t-2 border-[#09090B]">
            {onDeleteLog && (
              <button
                onClick={() => {
                  onDeleteLog(detailLog.id);
                  onClose();
                }}
                className="px-4 py-2 border-2 border-[#09090B] bg-rose-400 text-white font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} /> Xóa Log
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {onEditLog && (
                <button
                  onClick={() => {
                    const target = detailLog;
                    onClose();
                    onEditLog(target);
                  }}
                  className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil size={13} /> Chỉnh Sửa
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 border-2 border-[#09090B] bg-[#09090B] text-white font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
