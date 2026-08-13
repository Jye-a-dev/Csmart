'use client';

import { useState, useRef } from 'react';
import { AiRequestLog, CreateAiRequestLogDto, UpdateAiRequestLogDto } from '@/types/ai/log';
import { X, Save, Loader2, Code } from 'lucide-react';

const ENDPOINT_OPTIONS = [
  'classify-intent',
  'extract-ner',
  'text-to-sql',
  'search/hybrid',
  'ocr',
  'ask-faq',
];

interface AiLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AiRequestLog | null;
  onSubmit: (id?: string, data?: CreateAiRequestLogDto | UpdateAiRequestLogDto) => Promise<void>;
}

export function AiLogModal({ isOpen, onClose, log, onSubmit }: AiLogModalProps) {
  const [endpoint, setEndpoint] = useState('classify-intent');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputJsonStr, setOutputJsonStr] = useState('{}');
  const [correctedJsonStr, setCorrectedJsonStr] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0.9);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(150);
  const [flagForReview, setFlagForReview] = useState(false);

  const [saving, setSaving] = useState(false);
  const isSubmittingRef = useRef(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Synchronize props to form state
  const [prevLog, setPrevLog] = useState<AiRequestLog | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (log !== prevLog || isOpen !== prevIsOpen) {
    setPrevLog(log);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (log) {
        if (ENDPOINT_OPTIONS.includes(log.endpoint)) {
          setEndpoint(log.endpoint);
          setCustomEndpoint('');
        } else {
          setEndpoint('CUSTOM');
          setCustomEndpoint(log.endpoint);
        }
        setInputText(log.input_text ?? '');
        setOutputJsonStr(
          typeof log.output_json === 'object'
            ? JSON.stringify(log.output_json, null, 2)
            : String(log.output_json ?? '{}')
        );
        setCorrectedJsonStr(
          log.corrected_output
            ? (typeof log.corrected_output === 'object'
                ? JSON.stringify(log.corrected_output, null, 2)
                : String(log.corrected_output))
            : ''
        );
        setConfidenceScore(log.confidence_score ?? 0.9);
        setExecutionTimeMs(log.execution_time_ms ?? 150);
        setFlagForReview(log.flag_for_review ?? false);
      } else {
        setEndpoint('classify-intent');
        setCustomEndpoint('');
        setInputText('');
        setOutputJsonStr('{\n  "intent": "search_products",\n  "confidence": 0.95\n}');
        setCorrectedJsonStr('');
        setConfidenceScore(0.95);
        setExecutionTimeMs(150);
        setFlagForReview(false);
      }
      setJsonError(null);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);
    if (isSubmittingRef.current || saving) return;
    isSubmittingRef.current = true;

    let parsedOutput: Record<string, unknown> = {};
    if (outputJsonStr.trim()) {
      try {
        parsedOutput = JSON.parse(outputJsonStr);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setJsonError(`Output JSON Syntax Error: ${msg}`);
        isSubmittingRef.current = false;
        return;
      }
    }

    let parsedCorrected: Record<string, unknown> | undefined = undefined;
    if (correctedJsonStr.trim()) {
      try {
        parsedCorrected = JSON.parse(correctedJsonStr);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setJsonError(`Corrected JSON Syntax Error: ${msg}`);
        isSubmittingRef.current = false;
        return;
      }
    }

    const finalEndpoint = endpoint === 'CUSTOM' ? customEndpoint.trim() : endpoint;
    if (!finalEndpoint) {
      alert('Vui lòng chọn hoặc nhập Endpoint!');
      isSubmittingRef.current = false;
      return;
    }

    setSaving(true);
    try {
      const payload: CreateAiRequestLogDto = {
        endpoint: finalEndpoint,
        input_text: inputText.trim() || undefined,
        output_json: parsedOutput,
        corrected_output: parsedCorrected,
        confidence_score: confidenceScore,
        execution_time_ms: executionTimeMs,
        flag_for_review: flagForReview,
      };

      await onSubmit(log?.id, payload);
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090B]/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-[#09090B] text-white px-5 py-3 flex items-center justify-between font-mono font-black uppercase text-sm">
          <span className="flex items-center gap-2">
            <Code size={16} className="text-[#F97316]" />
            {log ? `Chỉnh sửa Log #${String(log.id).slice(0, 8)}...` : 'Tạo AI Request Log Mới'}
          </span>
          <button onClick={onClose} className="hover:text-[#F97316] cursor-pointer"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs">
          {/* Endpoint */}
          <div>
            <label className="font-black uppercase text-[#09090B] block mb-1">Endpoint *</label>
            <div className="flex gap-2">
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 border-2 border-[#09090B] px-3 py-2 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
              >
                {ENDPOINT_OPTIONS.map((ep) => (
                  <option key={ep} value={ep}>{ep}</option>
                ))}
                <option value="CUSTOM">Khác (Nhập tùy chỉnh)...</option>
              </select>
              {endpoint === 'CUSTOM' && (
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="VD: custom/pipeline"
                  required
                  className="flex-1 border-2 border-[#09090B] px-3 py-2 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
                />
              )}
            </div>
          </div>

          {/* Input Text */}
          <div>
            <label className="font-black uppercase text-[#09090B] block mb-1">Input Text (Query từ khách hàng)</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              placeholder="VD: Tìm giúp tôi áo sơ mi trắng size L..."
              className="w-full border-2 border-[#09090B] p-3 focus:outline-none shadow-[2px_2px_0px_0px_#09090B] resize-y"
            />
          </div>

          {/* Output JSON */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-black uppercase text-[#09090B]">Output JSON (Kết quả AI ban đầu)</label>
              {jsonError && <span className="text-rose-600 font-bold text-[10px]">{jsonError}</span>}
            </div>
            <textarea
              value={outputJsonStr}
              onChange={(e) => {
                setOutputJsonStr(e.target.value);
                setJsonError(null);
              }}
              rows={5}
              placeholder='{\n  "status": "success"\n}'
              className="w-full border-2 border-[#09090B] p-3 font-mono text-xs bg-[#09090B] text-emerald-400 focus:outline-none resize-y"
            />
          </div>

          {/* Corrected JSON Output (Fine-Tune Output) */}
          <div className="bg-amber-50 border-2 border-[#09090B] p-3 shadow-[2px_2px_0px_0px_#09090B]">
            <div className="flex items-center justify-between mb-1">
              <label className="font-black uppercase text-[#09090B] flex items-center gap-1.5">
                ✨ Corrected Output JSON (JSON Chuẩn Đưa Vào Fine-Tune)
              </label>
              <span className="text-[10px] font-bold text-amber-800">Dành cho AI Học Cái Sai</span>
            </div>
            <textarea
              value={correctedJsonStr}
              onChange={(e) => {
                setCorrectedJsonStr(e.target.value);
                setJsonError(null);
              }}
              rows={5}
              placeholder='{\n  "intent": "search_products",\n  "corrected_result": true\n}'
              className="w-full border-2 border-[#09090B] p-3 font-mono text-xs bg-white text-[#09090B] focus:outline-none resize-y"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Nhập JSON chuẩn xác để khi xuất Dataset Fine-Tune (ChatML), hệ thống sẽ dùng JSON này làm câu trả lời chuẩn cho AI học.
            </p>
          </div>

          {/* Metrics: Confidence Score & Latency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="font-black uppercase text-[#09090B] block mb-1">
                Confidence Score ({(confidenceScore * 100).toFixed(0)}%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={confidenceScore}
                  onChange={(e) => setConfidenceScore(Number(e.target.value))}
                  className="flex-1 accent-[#F97316]"
                />
                <span className="font-black text-[#09090B] border-2 border-[#09090B] px-2 py-1 shadow-[2px_2px_0px_0px_#09090B]">
                  {(confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <label className="font-black uppercase text-[#09090B] block mb-1">Execution Time (ms)</label>
              <input
                type="number"
                min={0}
                value={executionTimeMs}
                onChange={(e) => setExecutionTimeMs(Number(e.target.value))}
                placeholder="150"
                className="w-full border-2 border-[#09090B] px-3 py-2 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
              />
            </div>
          </div>

          {/* Flag For Review */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="flag_for_review"
              checked={flagForReview}
              onChange={(e) => setFlagForReview(e.target.checked)}
              className="w-4 h-4 accent-[#F97316] border-2 border-[#09090B]"
            />
            <label htmlFor="flag_for_review" className="font-black text-[#09090B] cursor-pointer">
              Gắn cờ kiểm duyệt thủ công (flag_for_review = true)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-[#09090B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border-2 border-[#09090B] font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {log ? 'Lưu Thay Đổi' : 'Tạo AI Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
