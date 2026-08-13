'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAiLogs } from '@/hooks';
import { AiRequestLog } from '@/types/ai/log';
import {
  HitlHeader,
  HitlStats,
  HitlFilters,
  HitlTable,
} from './sections';

export default function HitlPage() {
  const { loading, findAllLogs, updateLog, removeLog } = useAiLogs();

  const [logs, setLogs] = useState<AiRequestLog[]>([]);
  const [endpointFilter, setEndpointFilter] = useState<string>('ALL');
  const [confidenceMax, setConfidenceMax] = useState<number>(1.0);
  const [processingId, setProcessingId] = useState<string | null>(null);
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

  const handleApprove = async (id: string) => {
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

  const handleReject = async (id: string) => {
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

      {/* Header Section */}
      <HitlHeader
        filteredCount={filtered.length}
        loading={loading}
        onRefresh={load}
      />

      {/* Stats Cards Section */}
      <HitlStats logs={logs} filteredCount={filtered.length} />

      {/* Filters Section */}
      <HitlFilters
        endpointFilter={endpointFilter}
        setEndpointFilter={setEndpointFilter}
        confidenceMax={confidenceMax}
        setConfidenceMax={setConfidenceMax}
      />

      {/* Table Section */}
      <HitlTable
        loading={loading}
        filtered={filtered}
        processingId={processingId}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
