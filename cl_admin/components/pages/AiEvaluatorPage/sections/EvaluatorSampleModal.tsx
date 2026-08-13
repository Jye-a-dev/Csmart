'use client';

import { X, CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

export interface ChatMLMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatMLSample {
  id: string;
  messages: ChatMLMessage[];
  metadata?: {
    log_id?: string | number;
    endpoint?: string;
    confidence_score?: number;
    execution_time_ms?: number;
    created_at?: string;
  };
  score: number;
  is_valid: boolean;
  status: 'passed' | 'review_needed' | 'invalid';
  notes?: string;
}

interface EvaluatorSampleModalProps {
  sample: ChatMLSample | null;
  onClose: () => void;
  onUpdateSample?: (updated: ChatMLSample) => void;
  onDeleteSample?: (id: string) => void;
}

export function EvaluatorSampleModal({
  sample,
  onClose,
  onDeleteSample,
}: EvaluatorSampleModalProps) {
  if (!sample) return null;

  const systemMsg = sample.messages.find((m) => m.role === 'system')?.content;
  const userMsg = sample.messages.find((m) => m.role === 'user')?.content;
  const assistantMsg = sample.messages.find((m) => m.role === 'assistant')?.content;

  const getStatusBadge = (status: ChatMLSample['status']) => {
    switch (status) {
      case 'passed':
        return { label: 'ĐẠT KHUẨN (PASSED)', cls: 'bg-emerald-100 text-emerald-800 border-emerald-400', icon: CheckCircle };
      case 'review_needed':
        return { label: 'CẦN REVIEW', cls: 'bg-amber-100 text-amber-800 border-amber-400', icon: AlertTriangle };
      case 'invalid':
        return { label: 'KHÔNG HỢP LỆ', cls: 'bg-rose-100 text-rose-800 border-rose-400', icon: XCircle };
    }
  };

  const badge = getStatusBadge(sample.status);
  const BadgeIcon = badge.icon;

  return (
    <div className="fixed inset-0 bg-[#09090B]/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#09090B] bg-[#09090B] text-white">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-sm uppercase text-[#F97316]">Sample #{sample.id}</span>
            <div className={`px-2 py-0.5 border font-mono text-[10px] font-black flex items-center gap-1 ${badge.cls}`}>
              <BadgeIcon size={10} /> {badge.label} ({sample.score} điểm)
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs flex-1">
          {/* Metadata if available */}
          {sample.metadata && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-zinc-50 border-2 border-[#09090B] text-[11px]">
              <div><span className="text-zinc-500">Log ID:</span> <strong className="text-[#09090B]">#{sample.metadata.log_id ?? 'N/A'}</strong></div>
              <div><span className="text-zinc-500">Endpoint:</span> <strong className="text-[#09090B]">{sample.metadata.endpoint ?? 'N/A'}</strong></div>
              <div><span className="text-zinc-500">Confidence:</span> <strong className="text-emerald-700">{sample.metadata.confidence_score != null ? `${(sample.metadata.confidence_score * 100).toFixed(0)}%` : 'N/A'}</strong></div>
              <div><span className="text-zinc-500">Latency:</span> <strong>{sample.metadata.execution_time_ms ? `${sample.metadata.execution_time_ms}ms` : 'N/A'}</strong></div>
            </div>
          )}

          {/* System Prompt */}
          <div>
            <span className="font-black text-[#09090B] uppercase block mb-1">1. System Prompt:</span>
            <div className="p-3 bg-zinc-100 border border-zinc-300 text-zinc-700 font-mono whitespace-pre-wrap">
              {systemMsg || '<Không có System Prompt>'}
            </div>
          </div>

          {/* User Query */}
          <div>
            <span className="font-black text-[#09090B] uppercase block mb-1">2. User Query (Input):</span>
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 font-mono font-bold whitespace-pre-wrap">
              {userMsg || '<Không có User Input>'}
            </div>
          </div>

          {/* Assistant Response */}
          <div>
            <span className="font-black text-[#09090B] uppercase block mb-1">3. Assistant Response (Output Target):</span>
            <pre className="p-3 bg-[#09090B] text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-60 border-2 border-[#09090B]">
              {assistantMsg || '<Không có Assistant Response>'}
            </pre>
          </div>

          {/* Automatic Quality Evaluation Notes */}
          <div className="p-3 bg-amber-50 border-2 border-amber-300 font-mono text-xs">
            <span className="font-black text-amber-800 uppercase block mb-1">Đánh giá tự động chất lượng ChatML:</span>
            <p className="text-amber-900">{sample.notes || 'Cấu trúc thông điệp chuẩn xác.'}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-[#09090B] bg-zinc-50 flex items-center justify-between">
          {onDeleteSample && (
            <button
              onClick={() => {
                onDeleteSample(sample.id);
                onClose();
              }}
              className="px-3 py-2 border-2 border-[#09090B] bg-rose-400 text-white font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={13} /> Xóa Sample
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 border-2 border-[#09090B] bg-[#09090B] text-white font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer ml-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
