'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAiLogs } from '@/hooks';
import { AiRequestLog } from '@/types/ai/log';
import { ScrollText, RefreshCw, Search, AlertTriangle, CheckCircle, Clock, Hash, Eye, X } from 'lucide-react';

const ENDPOINTS = ['ALL', 'classify-intent', 'extract-ner', 'text-to-sql', 'search/hybrid', 'ocr', 'ask-faq'];

export default function AiLogsPage() {
  const { loading, findAllLogs } = useAiLogs();

  const [logs, setLogs] = useState<AiRequestLog[]>([]);
  const [search, setSearch] = useState('');
  const [endpointFilter, setEndpointFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState<'ALL' | 'FLAGGED' | 'CLEAN'>('ALL');
  const [detailLog, setDetailLog] = useState<AiRequestLog | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await findAllLogs({ limit: 500 });
      setLogs(data || []);
    } catch {
      console.error('Failed to load AI logs');
    }
  }, [findAllLogs]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = logs.filter((l) => {
    const epMatch = endpointFilter === 'ALL' || l.endpoint === endpointFilter;
    const flagMatch = flagFilter === 'ALL' || (flagFilter === 'FLAGGED' ? l.flag_for_review : !l.flag_for_review);
    const searchMatch = !search || l.endpoint.includes(search) || (l.input_text ?? '').toLowerCase().includes(search.toLowerCase());
    return epMatch && flagMatch && searchMatch;
  });

  const avgLatency = logs.length ? Math.round(logs.reduce((s, l) => s + (l.execution_time_ms ?? 0), 0) / logs.length) : 0;
  const flaggedCount = logs.filter((l) => l.flag_for_review).length;
  const flagRate = logs.length ? ((flaggedCount / logs.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 font-sans">
      {/* Detail Modal */}
      {detailLog && (
        <div className="fixed inset-0 bg-[#09090B]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b-2 border-[#09090B] bg-[#09090B] text-white">
              <span className="font-mono font-black uppercase text-sm">Log #{detailLog.id} — {detailLog.endpoint}</span>
              <button onClick={() => setDetailLog(null)} className="p-1 hover:text-[#F97316] cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 font-mono text-xs">
              <div><span className="font-black text-[#09090B]">Input:</span><p className="mt-1 text-zinc-600 bg-zinc-50 p-3 border border-zinc-200 whitespace-pre-wrap">{detailLog.input_text ?? '—'}</p></div>
              <div><span className="font-black text-[#09090B]">Output JSON:</span><pre className="mt-1 bg-[#09090B] text-emerald-400 p-3 overflow-x-auto text-[10px] max-h-60">{JSON.stringify(detailLog.output_json, null, 2)}</pre></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-black">Confidence:</span> {detailLog.confidence_score != null ? `${(detailLog.confidence_score * 100).toFixed(1)}%` : 'N/A'}</div>
                <div><span className="font-black">Latency:</span> {detailLog.execution_time_ms ? `${detailLog.execution_time_ms}ms` : 'N/A'}</div>
                <div><span className="font-black">Flag:</span> <span className={detailLog.flag_for_review ? 'text-rose-600 font-black' : 'text-emerald-600'}>{detailLog.flag_for_review ? 'CẦN REVIEW' : 'SẠCH'}</span></div>
                <div><span className="font-black">Created:</span> {new Date(detailLog.created_at).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#09090B] text-[#F97316]"><ScrollText size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">AI Telemetry Logs</h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">Nhật ký toàn bộ pipeline_ai requests</p>
        </div>
        <button onClick={load} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 font-mono text-xs font-bold">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng logs', value: logs.length, icon: Hash, color: 'bg-blue-400' },
          { label: 'Flagged', value: flaggedCount, icon: AlertTriangle, color: 'bg-amber-400' },
          { label: 'Flag Rate', value: `${flagRate}%`, icon: CheckCircle, color: 'bg-rose-400' },
          { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: 'bg-purple-400' },
        ].map((s) => (
          <div key={s.label} className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-4">
            <div className={`inline-flex p-2 mb-3 ${s.color} border-2 border-[#09090B]`}><s.icon size={16} /></div>
            <div className="font-mono text-2xl font-black text-[#09090B]">{s.value}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400"><Search size={14} /></div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm endpoint, input text..." className="w-full pl-9 pr-4 py-2.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white shadow-[2px_2px_0px_0px_#09090B]" />
        </div>
        <select value={endpointFilter} onChange={(e) => setEndpointFilter(e.target.value)} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
          {ENDPOINTS.map((ep) => <option key={ep} value={ep}>{ep === 'ALL' ? 'Tất cả endpoint' : ep}</option>)}
        </select>
        <select value={flagFilter} onChange={(e) => setFlagFilter(e.target.value as typeof flagFilter)} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
          <option value="ALL">Tất cả</option>
          <option value="FLAGGED">🚩 Flagged</option>
          <option value="CLEAN">✓ Sạch</option>
        </select>
      </div>

      {/* Table */}
      {loading && filtered.length === 0 ? (
        <div className="text-center font-mono text-zinc-500 py-16 italic">Đang tải logs...</div>
      ) : (
        <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="bg-[#09090B] text-[#FAFAFA]">
                {['#ID', 'Endpoint', 'Input', 'Confidence', 'Latency (ms)', 'Flag', 'Thời gian', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-black uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-zinc-400 italic">Không có log nào.</td></tr>
              ) : filtered.map((log, i) => (
                <tr key={log.id} className={`border-t-2 border-[#09090B] ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}>
                  <td className="px-4 py-3 font-black text-[#F97316]">#{log.id}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 border border-[#09090B] bg-[#09090B] text-white text-[10px] font-black">{log.endpoint}</span></td>
                  <td className="px-4 py-3 max-w-45"><span className="line-clamp-1 text-zinc-600">{log.input_text ?? '—'}</span></td>
                  <td className="px-4 py-3">
                    {log.confidence_score != null ? (
                      <span className={`px-2 py-0.5 font-black text-[10px] ${log.confidence_score >= 0.8 ? 'bg-emerald-100 text-emerald-700' : log.confidence_score >= 0.5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {(log.confidence_score * 100).toFixed(0)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{log.execution_time_ms ?? '—'}</td>
                  <td className="px-4 py-3">
                    {log.flag_for_review ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-black text-[10px] flex items-center gap-1 w-fit"><AlertTriangle size={10} />FLAG</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-black text-[10px] flex items-center gap-1 w-fit"><CheckCircle size={10} />OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(log.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetailLog(log)} className="p-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
