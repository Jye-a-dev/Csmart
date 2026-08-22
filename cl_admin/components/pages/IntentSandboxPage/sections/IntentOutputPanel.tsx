'use client';

import { useState } from 'react';
import {
  Tag,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Code,
  Clock,
  Target,
  RefreshCw,
} from 'lucide-react';
import { IntentEntitiesTable } from './IntentEntitiesTable';

export interface IntentResponse {
  success?: boolean;
  status?: string;
  query?: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence_score: number;
  flag_for_review: boolean;
  execution_time_ms?: number;
  message?: string;
}

interface IntentOutputPanelProps {
  result: IntentResponse | null;
  loading: boolean;
  error: string | null;
}

export function IntentOutputPanel({ result, loading, error }: IntentOutputPanelProps) {
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const getIntentBadgeStyle = (intent: string) => {
    switch (intent?.toUpperCase()) {
      case 'SEARCH_PRODUCT':
        return 'bg-emerald-400 text-[#09090B] border-[#09090B]';
      case 'CANCEL_ORDER':
        return 'bg-amber-400 text-[#09090B] border-[#09090B]';
      case 'ASK_FAQ':
        return 'bg-sky-400 text-[#09090B] border-[#09090B]';
      case 'UNKNOWN':
      default:
        return 'bg-rose-400 text-white border-[#09090B]';
    }
  };

  if (error) {
    return (
      <div className="border-2 border-[#09090B] bg-rose-400 p-4 text-white font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] flex items-center gap-3">
        <AlertTriangle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-2 border-[#09090B] bg-white p-12 text-center shadow-[4px_4px_0px_0px_#09090B] font-mono space-y-3">
        <RefreshCw size={32} className="mx-auto text-[#F97316] animate-spin" />
        <p className="text-xs font-black uppercase text-[#09090B]">Đang gọi AI Pipeline và phân tích Intent...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="border-2 border-[#09090B] bg-white p-12 text-center shadow-[4px_4px_0px_0px_#09090B] font-mono">
        <Target size={40} className="mx-auto text-zinc-300 mb-3" />
        <p className="text-sm font-bold text-zinc-500">
          Nhập câu thoại bên trái và bấm "Phân Loại Intent" để nhận kết quả đánh giá.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Intent Card */}
      <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#09090B]">
          <div>
            <span className="font-mono text-[10px] font-black uppercase text-zinc-500 block mb-1">
              CLASSIFIED INTENT
            </span>
            <span
              className={`inline-flex items-center gap-2 font-mono text-base font-black px-4 py-2 border-2 shadow-[2px_2px_0px_0px_#09090B] uppercase ${getIntentBadgeStyle(
                result.intent
              )}`}
            >
              <Tag size={16} />
              {result.intent || 'UNKNOWN'}
            </span>
          </div>

          <div className="text-right">
            <span className="font-mono text-[10px] font-black uppercase text-zinc-500 block mb-1">
              REVIEW FLAG STATUS
            </span>
            {result.flag_for_review ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black px-3 py-1.5 bg-rose-400 text-white border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B]">
                <AlertTriangle size={14} />
                FLAGGED FOR HITL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black px-3 py-1.5 bg-emerald-400 text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B]">
                <CheckCircle2 size={14} />
                HIGH CONFIDENCE
              </span>
            )}
          </div>
        </div>

        {/* Confidence Score Bar */}
        <div className="space-y-2">
          <div className="flex justify-between font-mono text-xs font-black">
            <span className="text-[#09090B] uppercase flex items-center gap-1.5">
              <Zap size={14} className="text-[#F97316]" />
              Confidence Score
            </span>
            <span className="text-[#F97316]">
              {((result.confidence_score ?? 0) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-4 border-2 border-[#09090B] bg-zinc-100 p-0.5 shadow-[2px_2px_0px_0px_#09090B]">
            <div
              className={`h-full border-r-2 border-[#09090B] transition-all duration-500 ${
                (result.confidence_score ?? 0) >= 0.75
                  ? 'bg-emerald-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (result.confidence_score ?? 0) * 100))}%` }}
            />
          </div>
        </div>

        {/* Execution Time */}
        <div className="flex items-center justify-between font-mono text-xs bg-[#FAFAFA] border-2 border-[#09090B] p-3">
          <span className="font-bold text-zinc-600 flex items-center gap-1.5">
            <Clock size={14} />
            Thời gian xử lý:
          </span>
          <span className="font-black text-[#09090B]">
            {result.execution_time_ms ?? 0} ms
          </span>
        </div>
      </div>

      {/* Entities Table */}
      <IntentEntitiesTable entities={result.entities} />

      {/* Raw JSON Inspector */}
      <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B]">
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="flex items-center justify-between w-full font-mono text-xs font-black uppercase text-[#09090B]"
        >
          <span className="flex items-center gap-2">
            <Code size={14} className="text-[#F97316]" />
            RAW JSON PAYLOAD INSPECTOR
          </span>
          <span className="px-2 py-0.5 border border-[#09090B] bg-zinc-100 text-[10px]">
            {showRawJson ? 'ẨN JSON' : 'XEM JSON'}
          </span>
        </button>

        {showRawJson && (
          <pre className="mt-4 p-4 font-mono text-xs bg-zinc-950 text-emerald-400 border-2 border-[#09090B] overflow-x-auto max-h-72">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
