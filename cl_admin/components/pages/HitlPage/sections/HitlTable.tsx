'use client';

import { AiRequestLog } from '@/types/ai/log';
import { Bot, CheckCircle, Trash2 } from 'lucide-react';

export const confidenceBadge = (score?: number) => {
  if (score === undefined || score === null) return { label: 'N/A', cls: 'bg-zinc-100 text-zinc-500' };
  if (score >= 0.8) return { label: `${(score * 100).toFixed(0)}%`, cls: 'bg-emerald-100 text-emerald-700' };
  if (score >= 0.5) return { label: `${(score * 100).toFixed(0)}%`, cls: 'bg-amber-100 text-amber-700' };
  return { label: `${(score * 100).toFixed(0)}%`, cls: 'bg-rose-100 text-rose-700' };
};

interface HitlTableProps {
  loading: boolean;
  filtered: AiRequestLog[];
  processingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function HitlTable({ loading, filtered, processingId, onApprove, onReject }: HitlTableProps) {
  if (loading && filtered.length === 0) {
    return <div className="text-center font-mono text-zinc-500 py-16 italic">Đang tải hàng chờ HITL...</div>;
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 border-4 border-dashed border-[#09090B]/15">
        <Bot size={40} className="mx-auto mb-3 text-zinc-300" />
        <p className="font-mono text-zinc-500 font-bold">Không có yêu cầu nào cần review.</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] overflow-x-auto">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="bg-[#09090B] text-[#FAFAFA]">
            <th className="px-4 py-3 text-left font-black uppercase">#ID</th>
            <th className="px-4 py-3 text-left font-black uppercase">Endpoint</th>
            <th className="px-4 py-3 text-left font-black uppercase">Input</th>
            <th className="px-4 py-3 text-left font-black uppercase">Confidence</th>
            <th className="px-4 py-3 text-left font-black uppercase">Latency</th>
            <th className="px-4 py-3 text-left font-black uppercase">Thời gian</th>
            <th className="px-4 py-3 text-center font-black uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log, i) => {
            const badge = confidenceBadge(log.confidence_score);
            const isProcessing = processingId === log.id;
            return (
              <tr key={log.id} className={`border-t-2 border-[#09090B] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} ${isProcessing ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-black text-[#F97316]">#{log.id}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 border border-[#09090B] bg-[#09090B] text-[#FAFAFA] text-[10px] font-black uppercase">{log.endpoint}</span>
                </td>
                <td className="px-4 py-3 max-w-55">
                  <span className="line-clamp-2 text-zinc-600 italic">{log.input_text ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 font-black text-[10px] ${badge.cls}`}>{badge.label}</span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{log.execution_time_ms ? `${log.execution_time_ms}ms` : '—'}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(log.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onApprove(log.id)}
                      disabled={isProcessing}
                      title="Duyệt — xóa cờ review"
                      className="p-1.5 border-2 border-[#09090B] bg-emerald-400 text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer disabled:opacity-40"
                    >
                      <CheckCircle size={14} />
                    </button>
                    <button
                      onClick={() => onReject(log.id)}
                      disabled={isProcessing}
                      title="Từ chối & xóa log"
                      className="p-1.5 border-2 border-[#09090B] bg-rose-400 text-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
