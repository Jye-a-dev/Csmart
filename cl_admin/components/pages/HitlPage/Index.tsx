'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAiLogs } from '@/hooks';
import { AiRequestLog } from '@/types/ai/log';
import { Bot, RefreshCw, CheckCircle, Trash2, AlertTriangle, Filter, Clock, Zap } from 'lucide-react';

const ENDPOINTS = ['classify-intent', 'extract-ner', 'text-to-sql', 'search/hybrid', 'ocr', 'ask-faq'];

const confidenceBadge = (score?: number) => {
  if (score === undefined || score === null) return { label: 'N/A', cls: 'bg-zinc-100 text-zinc-500' };
  if (score >= 0.8) return { label: `${(score * 100).toFixed(0)}%`, cls: 'bg-emerald-100 text-emerald-700' };
  if (score >= 0.5) return { label: `${(score * 100).toFixed(0)}%`, cls: 'bg-amber-100 text-amber-700' };
  return { label: `${(score * 100).toFixed(0)}%`, cls: 'bg-rose-100 text-rose-700' };
};

export default function HitlPage() {
  const { loading, findAllLogs, updateLog, removeLog } = useAiLogs();

  const [logs, setLogs] = useState<AiRequestLog[]>([]);
  const [endpointFilter, setEndpointFilter] = useState<string>('ALL');
  const [confidenceMax, setConfidenceMax] = useState<number>(1.0);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const data = await findAllLogs({ limit: 300 });
      // Only show flagged for review
      setLogs((data || []).filter((l) => l.flag_for_review === true));
    } catch {
      showToast('Không thể tải dữ liệu HITL', 'err');
    }
  }, [findAllLogs]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await updateLog(id, { flag_for_review: false });
      showToast(`Log #${id} đã được duyệt ✓`);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch {
      showToast('Lỗi khi duyệt log', 'err');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm(`Xác nhận xóa log #${id}?`)) return;
    setProcessingId(id);
    try {
      await removeLog(id);
      showToast(`Log #${id} đã bị từ chối & xóa`);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch {
      showToast('Lỗi khi xóa log', 'err');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = logs.filter((l) => {
    const epMatch = endpointFilter === 'ALL' || l.endpoint === endpointFilter;
    const confMatch = (l.confidence_score ?? 0) <= confidenceMax;
    return epMatch && confMatch;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] transition-all ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#09090B] text-[#F97316]">
              <Bot size={20} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">HITL Queue</h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">
            Hàng chờ duyệt thủ công — {filtered.length} yêu cầu cần review
          </p>
        </div>
        <button
          onClick={load}
          className="p-3 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 font-mono text-xs font-bold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Chờ duyệt', value: logs.length, icon: AlertTriangle, color: 'bg-amber-400' },
          { label: 'Lọc hiện tại', value: filtered.length, icon: Filter, color: 'bg-blue-400' },
          { label: 'Avg Latency', value: `${Math.round(logs.reduce((s, l) => s + (l.execution_time_ms ?? 0), 0) / (logs.length || 1))}ms`, icon: Clock, color: 'bg-purple-400' },
          { label: 'Endpoints', value: new Set(logs.map((l) => l.endpoint)).size, icon: Zap, color: 'bg-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-4">
            <div className={`inline-flex p-2 mb-3 ${s.color} border-2 border-[#09090B]`}>
              <s.icon size={16} />
            </div>
            <div className="font-mono text-2xl font-black text-[#09090B]">{s.value}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-[#09090B] bg-[#FAFAFA] shadow-[3px_3px_0px_0px_#09090B]">
        <div className="flex items-center gap-3 flex-1">
          <label className="font-mono text-xs font-black uppercase whitespace-nowrap">Endpoint:</label>
          <select
            value={endpointFilter}
            onChange={(e) => setEndpointFilter(e.target.value)}
            className="flex-1 border-2 border-[#09090B] font-mono text-xs px-3 py-2 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
          >
            <option value="ALL">Tất cả</option>
            {ENDPOINTS.map((ep) => <option key={ep} value={ep}>{ep}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 flex-1">
          <label className="font-mono text-xs font-black uppercase whitespace-nowrap">
            Confidence ≤ {(confidenceMax * 100).toFixed(0)}%:
          </label>
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={confidenceMax}
            onChange={(e) => setConfidenceMax(Number(e.target.value))}
            className="flex-1 accent-[#F97316]"
          />
        </div>
      </div>

      {/* Table */}
      {loading && filtered.length === 0 ? (
        <div className="text-center font-mono text-zinc-500 py-16 italic">Đang tải hàng chờ HITL...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-[#09090B]/15">
          <Bot size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="font-mono text-zinc-500 font-bold">Không có yêu cầu nào cần review.</p>
        </div>
      ) : (
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
                          onClick={() => handleApprove(log.id)}
                          disabled={isProcessing}
                          title="Duyệt — xóa cờ review"
                          className="p-1.5 border-2 border-[#09090B] bg-emerald-400 text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer disabled:opacity-40"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleReject(log.id)}
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
      )}
    </div>
  );
}
