'use client';

import { useState } from 'react';
import { ChatMLSample } from './EvaluatorSampleModal';
import {
  FileCode,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Trash2,
  Download,
  Zap,
} from 'lucide-react';

interface EvaluatorDatasetPreviewProps {
  samples: ChatMLSample[];
  onSelectSample: (sample: ChatMLSample) => void;
  onDeleteSample: (id: string) => void;
  onClearSamples: () => void;
  onExportEvaluatedJsonl: () => void;
  onSaveToDbAndTrain?: () => void;
  savingToDb?: boolean;
}

export function EvaluatorDatasetPreview({
  samples,
  onSelectSample,
  onDeleteSample,
  onClearSamples,
  onExportEvaluatedJsonl,
  onSaveToDbAndTrain,
  savingToDb = false,
}: EvaluatorDatasetPreviewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'passed' | 'review_needed' | 'invalid'>('ALL');

  if (samples.length === 0) return null;

  const passedCount = samples.filter((s) => s.status === 'passed').length;
  const reviewCount = samples.filter((s) => s.status === 'review_needed').length;
  const invalidCount = samples.filter((s) => s.status === 'invalid').length;
  const avgScore = Math.round(samples.reduce((acc, s) => acc + s.score, 0) / (samples.length || 1));
  const validRate = ((passedCount / samples.length) * 100).toFixed(1);

  const filteredSamples = samples.filter((s) => {
    const statusMatch = statusFilter === 'ALL' || s.status === statusFilter;
    const userText = s.messages.find((m) => m.role === 'user')?.content ?? '';
    const assistantText = s.messages.find((m) => m.role === 'assistant')?.content ?? '';
    const searchMatch =
      !search ||
      userText.toLowerCase().includes(search.toLowerCase()) ||
      assistantText.toLowerCase().includes(search.toLowerCase()) ||
      (s.metadata?.endpoint ?? '').toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="border-4 border-[#09090B] bg-white shadow-[6px_6px_0px_0px_#09090B] p-6 space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCode size={20} className="text-[#F97316]" />
            <h2 className="font-mono font-black text-lg uppercase text-[#09090B]">
              Danh Sách & Kết Quả Đánh Giá Dataset ({samples.length} Samples)
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-500">
            Tự động đánh giá cấu trúc ChatML, cú pháp JSON và điểm chất lượng huấn luyện
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onSaveToDbAndTrain && (
            <button
              onClick={onSaveToDbAndTrain}
              disabled={savingToDb}
              className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap size={13} className={savingToDb ? 'animate-spin' : ''} />
              {savingToDb ? 'Đang Lưu & Huấn Luyện...' : '💾 Lưu Vào DB & Cho Pipeline Học'}
            </button>
          )}
          <button
            onClick={onExportEvaluatedJsonl}
            className="px-4 py-2 border-2 border-[#09090B] bg-emerald-400 text-[#09090B] font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={13} /> Export ChatML (.jsonl)
          </button>
          <button
            onClick={onClearSamples}
            className="px-3 py-2 border-2 border-[#09090B] bg-rose-400 text-white font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 size={13} /> Xóa Bảng
          </button>
        </div>
      </div>

      {/* Evaluation Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-2 border-[#09090B] p-3 bg-zinc-50 font-mono">
          <div className="text-[10px] text-zinc-500 uppercase font-black">Tỷ lệ Đạt chuẩn</div>
          <div className="text-2xl font-black text-emerald-700">{validRate}%</div>
          <div className="text-[10px] text-zinc-400">{passedCount}/{samples.length} Đạt chuẩn</div>
        </div>
        <div className="border-2 border-[#09090B] p-3 bg-zinc-50 font-mono">
          <div className="text-[10px] text-zinc-500 uppercase font-black">Avg Quality Score</div>
          <div className="text-2xl font-black text-[#09090B]">{avgScore}/100</div>
          <div className="text-[10px] text-zinc-400">Điểm trung bình</div>
        </div>
        <div className="border-2 border-[#09090B] p-3 bg-zinc-50 font-mono">
          <div className="text-[10px] text-zinc-500 uppercase font-black">Cần Review</div>
          <div className="text-2xl font-black text-amber-600">{reviewCount}</div>
          <div className="text-[10px] text-zinc-400">Thiếu thông số / chưa tối ưu</div>
        </div>
        <div className="border-2 border-[#09090B] p-3 bg-zinc-50 font-mono">
          <div className="text-[10px] text-zinc-500 uppercase font-black">Không hợp lệ</div>
          <div className="text-2xl font-black text-rose-600">{invalidCount}</div>
          <div className="text-[10px] text-zinc-400">Lỗi cú pháp ChatML</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo user query, assistant response, endpoint..."
            className="w-full pl-9 pr-4 py-2.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white shadow-[2px_2px_0px_0px_#09090B]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
        >
          <option value="ALL">Tất cả trạng thái đánh giá</option>
          <option value="passed">✓ Đạt chuẩn (Passed)</option>
          <option value="review_needed">⚠ Cần review</option>
          <option value="invalid">✕ Không hợp lệ</option>
        </select>
      </div>

      {/* Table List of ChatML Samples */}
      <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="bg-[#09090B] text-white">
              {['#Sample', 'Endpoint', 'User Query (Input)', 'Assistant Output', 'Quality Score', 'Trạng thái', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-black uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSamples.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-zinc-400 italic">
                  Không tìm thấy sample nào khớp với tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredSamples.map((sample, i) => {
                const userMsg = sample.messages.find((m) => m.role === 'user')?.content ?? '—';
                const assistantMsg = sample.messages.find((m) => m.role === 'assistant')?.content ?? '—';
                const endpoint = sample.metadata?.endpoint ?? 'custom';

                return (
                  <tr
                    key={sample.id}
                    className={`border-t-2 border-[#09090B] ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} hover:bg-amber-50/50 transition-colors`}
                  >
                    <td className="px-4 py-3 font-black text-[#F97316]">#{sample.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 border border-[#09090B] bg-[#09090B] text-white text-[10px] font-black uppercase">
                        {endpoint}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-56">
                      <span className="line-clamp-2 text-[#09090B] font-semibold">{userMsg}</span>
                    </td>
                    <td className="px-4 py-3 max-w-64">
                      <span className="line-clamp-2 text-zinc-500 font-mono text-[10px]">{assistantMsg}</span>
                    </td>
                    <td className="px-4 py-3 font-black">
                      <span className={`px-2 py-0.5 border text-[10px] ${sample.score >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : sample.score >= 50 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                        {sample.score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sample.status === 'passed' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle size={10} /> PASSED
                        </span>
                      ) : sample.status === 'review_needed' ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-black text-[10px] flex items-center gap-1 w-fit">
                          <AlertTriangle size={10} /> REVIEW
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black text-[10px] flex items-center gap-1 w-fit">
                          <XCircle size={10} /> INVALID
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectSample(sample)}
                          title="Xem chi tiết & Đánh giá"
                          className="p-1.5 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteSample(sample.id)}
                          title="Xóa sample này"
                          className="p-1.5 border-2 border-[#09090B] bg-rose-400 text-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
