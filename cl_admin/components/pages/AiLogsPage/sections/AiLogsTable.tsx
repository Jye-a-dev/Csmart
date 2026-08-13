'use client';

import { AiRequestLog } from '@/types/ai/log';
import { AlertTriangle, CheckCircle, Eye, Pencil, Trash2, CheckSquare } from 'lucide-react';

interface AiLogsTableProps {
  loading: boolean;
  filtered: AiRequestLog[];
  selectedIds: string[];
  togglingId: string | null;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;
  onClearSelection: () => void;
  onBatchFlag: (flag: boolean) => void;
  onBatchDelete: () => void;
  onSelectLog: (log: AiRequestLog) => void;
  onEditLog: (log: AiRequestLog) => void;
  onToggleFlag: (log: AiRequestLog) => void;
  onDeleteLog: (id: string) => void;
}

export function AiLogsTable({
  loading,
  filtered,
  selectedIds,
  togglingId,
  onToggleSelectAll,
  onToggleSelectRow,
  onClearSelection,
  onBatchFlag,
  onBatchDelete,
  onSelectLog,
  onEditLog,
  onToggleFlag,
  onDeleteLog,
}: AiLogsTableProps) {
  const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;
  const isSomeSelected = selectedIds.length > 0;

  if (loading && filtered.length === 0) {
    return <div className="text-center font-mono text-zinc-500 py-16 italic">Đang tải logs...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Bulk Action Toolbar */}
      {isSomeSelected && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-4 border-[#09090B] bg-[#F97316] text-[#09090B] shadow-[4px_4px_0px_0px_#09090B] font-mono text-xs font-black animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} />
            <span>ĐÃ CHỌN {selectedIds.length} / {filtered.length} LOGS</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onBatchFlag(true)}
              className="px-3 py-1.5 border-2 border-[#09090B] bg-[#09090B] text-white hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#09090B] transition-all cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <AlertTriangle size={12} className="text-amber-400" /> Gắn Cờ ({selectedIds.length})
            </button>
            <button
              onClick={() => onBatchFlag(false)}
              className="px-3 py-1.5 border-2 border-[#09090B] bg-white text-[#09090B] hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#09090B] transition-all cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <CheckCircle size={12} className="text-emerald-600" /> Bỏ Cờ ({selectedIds.length})
            </button>
            <button
              onClick={onBatchDelete}
              className="px-3 py-1.5 border-2 border-[#09090B] bg-rose-600 text-white hover:bg-rose-700 shadow-[2px_2px_0px_0px_#09090B] transition-all cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <Trash2 size={12} /> Xóa Đã Chọn ({selectedIds.length})
            </button>
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 border-2 border-[#09090B] bg-zinc-200 text-[#09090B] hover:bg-zinc-300 transition-all cursor-pointer text-[11px]"
            >
              Bỏ Chọn
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="bg-[#09090B] text-[#FAFAFA]">
              <th className="px-3 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 accent-[#F97316] cursor-pointer"
                  title="Chọn tất cả"
                />
              </th>
              {['#ID', 'Endpoint', 'Input', 'Confidence', 'Latency (ms)', 'Flag', 'Thời gian', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-black uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-zinc-400 italic">Không có log nào.</td></tr>
            ) : filtered.map((log, i) => {
              const isSelected = selectedIds.includes(log.id);
              return (
                <tr key={log.id} className={`border-t-2 border-[#09090B] ${isSelected ? 'bg-amber-100/60' : i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRow(log.id)}
                      className="w-4 h-4 accent-[#F97316] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-black text-[#F97316]">#{i + 1}</td>
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
                    <button
                      onClick={() => onToggleFlag(log)}
                      disabled={togglingId === log.id}
                      title="Nhấn để đổi cờ kiểm duyệt"
                      className="cursor-pointer disabled:opacity-50"
                    >
                      {log.flag_for_review ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-black text-[10px] flex items-center gap-1 w-fit border border-rose-300 hover:bg-rose-200 transition-colors">
                          <AlertTriangle size={10} />FLAG {log.corrected_output ? '✨ (HỌC)' : ''}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-black text-[10px] flex items-center gap-1 w-fit border border-emerald-300 hover:bg-emerald-200 transition-colors">
                          <CheckCircle size={10} />OK
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(log.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onSelectLog(log)} title="Xem chi tiết" className="p-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => onEditLog(log)} title="Sửa Log" className="p-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => onDeleteLog(log.id)} title="Xóa Log" className="p-1.5 border-2 border-[#09090B] bg-rose-400 text-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
