'use client';

import { useState } from 'react';
import { apiClient } from '@/libs/api-client';
import { AlertTriangle, Braces, Code, RefreshCw } from 'lucide-react';
import {
  NerSandboxHeader,
  NerInputPanel,
  NerSlotVisualizer,
  NerFeedbackTool,
  NerSlots,
} from './sections';

interface NerResponse {
  status?: string;
  intent?: string;
  slots: NerSlots;
  confidence_score: number;
  flag_for_review: boolean;
  execution_time_ms?: number;
}

const SAMPLE_NER_INPUTS = [
  'Hủy giúp tôi đơn 101 và đơn 102 nhé',
  'Đổi địa chỉ giao hàng đơn 105 sang 123 Đường 3/2, Quận 10, TP.HCM',
  'Tôi muốn cập nhật địa chỉ nhận đơn #992 thành số 45 Lê Duẩn, Hà Nội và hủy đơn #993',
  'Vui lòng hủy đơn số 4091',
];

export default function NerSandboxPage() {
  const [text, setText] = useState<string>(SAMPLE_NER_INPUTS[1]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<NerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  // Editable fields for Feedback Tool
  const [editOrderIds, setEditOrderIds] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [submittingHitl, setSubmittingHitl] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToastMessage = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExtractNer = async (inputText?: string) => {
    const textToExtract = inputText ?? text;
    if (!textToExtract.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const data = await apiClient<NerResponse>('/ai/ner', {
        method: 'POST',
        body: { text: textToExtract },
      });

      const fullResult = {
        ...data,
        execution_time_ms: data.execution_time_ms ?? Date.now() - startTime,
      };

      setResult(fullResult);

      const ids = fullResult.slots?.order_ids
        ? fullResult.slots.order_ids.join(', ')
        : fullResult.slots?.order_id
        ? String(fullResult.slots.order_id)
        : '';
      setEditOrderIds(ids);
      setEditAddress(fullResult.slots?.new_address || '');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối dịch vụ NER AI';
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!result) return;
    setSubmittingHitl(true);
    try {
      const parsedIds = editOrderIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const correctedSlots = {
        ...result.slots,
        order_ids: parsedIds.length > 0 ? parsedIds : null,
        new_address: editAddress.trim() || null,
      };

      await apiClient('/ai-logs', {
        method: 'POST',
        body: {
          endpoint: 'extract-ner-corrected',
          input_text: text,
          output_json: {
            ...result,
            slots: correctedSlots,
            corrected_by_admin: true,
          },
          confidence_score: 1.0,
          flag_for_review: true,
        },
      });

      showToastMessage('Đã đẩy kết quả hiệu chỉnh nhãn vào hàng chờ HITL thành công ✓');
    } catch {
      showToastMessage('Không thể gửi hiệu chỉnh HITL', 'err');
    } finally {
      setSubmittingHitl(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] transition-all ${
            toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <NerSandboxHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <NerInputPanel
            text={text}
            setText={setText}
            loading={loading}
            onExtractNer={handleExtractNer}
            sampleInputs={SAMPLE_NER_INPUTS}
          />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="border-2 border-[#09090B] bg-rose-400 p-4 text-white font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] flex items-center gap-3">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="border-2 border-[#09090B] bg-white p-12 text-center shadow-[4px_4px_0px_0px_#09090B] font-mono">
              <Braces size={40} className="mx-auto text-zinc-300 mb-3" />
              <p className="text-sm font-bold text-zinc-500">
                Nhập tin nhắn đơn hàng bên trái và bấm "Trích Xuất Entity (NER)" để xem Slots bóc tách.
              </p>
            </div>
          )}

          {loading && (
            <div className="border-2 border-[#09090B] bg-white p-12 text-center shadow-[4px_4px_0px_0px_#09090B] font-mono space-y-3">
              <RefreshCw size={32} className="mx-auto text-[#F97316] animate-spin" />
              <p className="text-xs font-black uppercase text-[#09090B]">Mô hình AI đang bóc tách Slots...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              <NerSlotVisualizer intent={result.intent} slots={result.slots} />

              <NerFeedbackTool
                editOrderIds={editOrderIds}
                setEditOrderIds={setEditOrderIds}
                editAddress={editAddress}
                setEditAddress={setEditAddress}
                onSubmitFeedback={handleSubmitFeedback}
                submittingHitl={submittingHitl}
              />

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
          )}
        </div>
      </div>
    </div>
  );
}
