'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAiLogs } from '@/hooks';
import { AiRequestLog, CreateAiRequestLogDto, UpdateAiRequestLogDto } from '@/types/ai/log';
import {
  AiLogsDetailModal,
  AiLogsHeader,
  AiLogsStats,
  AiLogsFilters,
  AiLogsTable,
  AiLogModal,
  ConfirmActionModal,
} from './sections';

export default function AiLogsPage() {
  const { loading, findAllLogs, createLog, updateLog, removeLog, removeAllLogs } = useAiLogs();
  const isSavingRef = useRef(false);

  const [logs, setLogs] = useState<AiRequestLog[]>([]);
  const [search, setSearch] = useState('');
  const [endpointFilter, setEndpointFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState<'ALL' | 'FLAGGED' | 'CLEAN'>('ALL');
  
  // Multiselect state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Active Log state
  const [detailLog, setDetailLog] = useState<AiRequestLog | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState<AiRequestLog | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Custom Confirm Modal state (replaces window.confirm)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const data = await findAllLogs({ limit: 500 });
      setLogs(data || []);
    } catch {
      showToast('Không thể tải danh sách AI logs', 'err');
    }
  }, [findAllLogs]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  // Multiselect Handlers
  const filtered = logs.filter((l) => {
    const epMatch = endpointFilter === 'ALL' || l.endpoint === endpointFilter;
    const flagMatch = flagFilter === 'ALL' || (flagFilter === 'FLAGGED' ? l.flag_for_review : !l.flag_for_review);
    const searchMatch = !search || l.endpoint.includes(search) || (l.input_text ?? '').toLowerCase().includes(search.toLowerCase());
    return epMatch && flagMatch && searchMatch;
  });

  const handleToggleSelectAll = () => {
    if (filtered.length === 0) return;
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((l) => l.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // CRUD Handlers
  const handleOpenCreate = () => {
    setSelectedLogForEdit(null);
    setIsLogModalOpen(true);
  };

  const handleOpenEdit = (log: AiRequestLog) => {
    setSelectedLogForEdit(log);
    setIsLogModalOpen(true);
  };

  const handleSubmitLog = async (id?: string, data?: CreateAiRequestLogDto | UpdateAiRequestLogDto) => {
    if (!data || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      if (id) {
        await updateLog(id, data as UpdateAiRequestLogDto);
        showToast(`Đã cập nhật Log #${id}!`);
      } else {
        const created = await createLog(data as CreateAiRequestLogDto);
        showToast(`Đã tạo AI Log mới #${created.id}!`);
      }
      void load();
    } catch {
      showToast('Lỗi khi lưu AI Log', 'err');
      throw new Error('Save failed');
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleToggleFlag = async (log: AiRequestLog) => {
    setTogglingId(log.id);
    try {
      const nextFlag = !log.flag_for_review;
      await updateLog(log.id, { flag_for_review: nextFlag });
      showToast(`Log #${log.id}: cờ review -> ${nextFlag ? 'FLAGGED' : 'CLEAN'}`);
      setLogs((prev) => prev.map((l) => (l.id === log.id ? { ...l, flag_for_review: nextFlag } : l)));
    } catch {
      showToast('Lỗi khi đổi cờ review', 'err');
    } finally {
      setTogglingId(null);
    }
  };

  // Modal-based confirm handlers (No window.confirm)
  const handleDeleteLog = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'XÁC NHẬN XÓA LOG',
      message: `Bạn có chắc chắn muốn xóa AI Log #${id}? Thao tác này không thể hoàn tác.`,
      confirmText: 'Xóa Log',
      variant: 'danger',
      onConfirm: async () => {
        await removeLog(id);
        showToast(`Đã xóa AI Log #${id}`);
        setLogs((prev) => prev.filter((l) => l.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        if (detailLog?.id === id) setDetailLog(null);
      },
    });
  };

  const handleDeleteAllLogs = () => {
    if (logs.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: 'XÁC NHẬN XÓA TOÀN BỘ LOGS',
      message: `Bạn có chắc chắn muốn xóa sạch toàn bộ ${logs.length} AI request logs trong cơ sở dữ liệu? Thao tác này sẽ xóa vĩnh viễn tất cả nhật ký.`,
      confirmText: `Xóa Sạch ${logs.length} Logs`,
      variant: 'danger',
      onConfirm: async () => {
        const count = await removeAllLogs();
        showToast(`Đã xóa sạch ${count ?? logs.length} AI logs!`);
        setLogs([]);
        setSelectedIds([]);
        setDetailLog(null);
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmConfig({
      isOpen: true,
      title: 'XÁC NHẬN XÓA NHIỀU LOGS',
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} AI request logs đã chọn không? Thao tác này sẽ xóa các bản ghi được chọn.`,
      confirmText: `Xóa ${selectedIds.length} Logs`,
      variant: 'danger',
      onConfirm: async () => {
        await Promise.all(selectedIds.map((id) => removeLog(id)));
        showToast(`Đã xóa ${selectedIds.length} logs đã chọn!`);
        setLogs((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
        setSelectedIds([]);
      },
    });
  };

  const handleBatchFlag = async (flag: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => updateLog(id, { flag_for_review: flag })));
      showToast(`Đã ${flag ? 'gắn cờ' : 'bỏ cờ'} review cho ${selectedIds.length} logs!`);
      setLogs((prev) => prev.map((l) => (selectedIds.includes(l.id) ? { ...l, flag_for_review: flag } : l)));
    } catch {
      showToast('Lỗi khi cập nhật danh sách logs', 'err');
    }
  };

  const avgLatency = logs.length ? Math.round(logs.reduce((s, l) => s + (l.execution_time_ms ?? 0), 0) / logs.length) : 0;
  const flaggedCount = logs.filter((l) => l.flag_for_review).length;
  const flagRate = logs.length ? ((flaggedCount / logs.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Custom Confirm Modal (Replaces browser window.confirm) */}
      <ConfirmActionModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
      />

      {/* Detail Modal */}
      <AiLogsDetailModal
        detailLog={detailLog}
        onClose={() => setDetailLog(null)}
        onEditLog={handleOpenEdit}
        onDeleteLog={handleDeleteLog}
      />

      {/* Create / Edit Modal */}
      <AiLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        log={selectedLogForEdit}
        onSubmit={handleSubmitLog}
      />

      {/* Header Section */}
      <AiLogsHeader
        loading={loading}
        totalLogsCount={logs.length}
        onRefresh={load}
        onOpenCreate={handleOpenCreate}
        onDeleteAll={handleDeleteAllLogs}
      />

      {/* Stats Cards Section */}
      <AiLogsStats
        totalLogs={logs.length}
        flaggedCount={flaggedCount}
        flagRate={flagRate}
        avgLatency={avgLatency}
      />

      {/* Filters Section */}
      <AiLogsFilters
        search={search}
        setSearch={setSearch}
        endpointFilter={endpointFilter}
        setEndpointFilter={setEndpointFilter}
        flagFilter={flagFilter}
        setFlagFilter={setFlagFilter}
      />

      {/* Table Section with Multiselect */}
      <AiLogsTable
        loading={loading}
        filtered={filtered}
        selectedIds={selectedIds}
        togglingId={togglingId}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectRow={handleToggleSelectRow}
        onClearSelection={() => setSelectedIds([])}
        onBatchFlag={handleBatchFlag}
        onBatchDelete={handleBatchDelete}
        onSelectLog={setDetailLog}
        onEditLog={handleOpenEdit}
        onToggleFlag={handleToggleFlag}
        onDeleteLog={handleDeleteLog}
      />
    </div>
  );
}
