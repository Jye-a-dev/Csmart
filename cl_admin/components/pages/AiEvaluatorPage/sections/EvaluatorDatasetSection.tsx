'use client';

import { Download } from 'lucide-react';

interface EvaluatorDatasetSectionProps {
  flaggedCount: number;
  totalLogs: number;
  onExportJsonl: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showRawInput: boolean;
  setShowRawInput: (v: boolean) => void;
  rawJsonInput: string;
  setRawJsonInput: (v: string) => void;
  onImportTextJson: () => void;
}

export function EvaluatorDatasetSection({
  flaggedCount,
  totalLogs,
  onExportJsonl,
  onImportFile,
  showRawInput,
  setShowRawInput,
  rawJsonInput,
  setRawJsonInput,
  onImportTextJson,
}: EvaluatorDatasetSectionProps) {
  return (
    <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Download size={18} className="text-[#F97316]" />
        <h2 className="font-mono font-black text-sm uppercase text-[#09090B]">Fine-Tune Dataset Manager</h2>
      </div>
      <p className="font-mono text-xs text-zinc-500">
        Xuất dữ liệu <span className="font-black text-amber-600">{flaggedCount} flagged</span> / <span className="font-black text-[#09090B]">{totalLogs} tổng logs</span> dạng ChatML <code className="bg-zinc-100 px-1">.jsonl</code> để fine-tune Qwen2.5 local, hoặc import dataset bên ngoài.
      </p>

      <div className="p-3 border-2 border-dashed border-zinc-300 font-mono text-[10px] text-zinc-400 bg-zinc-50">
        <div>{'{ "messages": ['}</div>
        <div className="pl-4">{'{ "role": "system", "content": "..." },'}</div>
        <div className="pl-4">{'{ "role": "user", "content": "input_text" },'}</div>
        <div className="pl-4">{'{ "role": "assistant", "content": "output_json" }'}</div>
        <div>{'] }  // ChatML format'}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onExportJsonl}
          disabled={totalLogs === 0}
          className="py-3 border-2 border-[#09090B] bg-[#09090B] text-white font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Export Dataset (.jsonl)
        </button>

        <label className="py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 text-center">
          <Download size={14} className="rotate-180" />
          Import File (.jsonl)
          <input
            type="file"
            accept=".jsonl,.json"
            className="hidden"
            onChange={onImportFile}
          />
        </label>
      </div>

      {/* Raw Text JSON/JSONL Direct Input */}
      <div className="pt-2">
        <button
          onClick={() => setShowRawInput(!showRawInput)}
          className="font-mono text-xs font-black uppercase text-[#F97316] hover:underline cursor-pointer flex items-center gap-1"
        >
          {showRawInput ? '▲ Ẩn Nhập Text JSON' : '▼ Nhập Trực Tiếp Text JSON / JSONL'}
        </button>

        {showRawInput && (
          <div className="mt-3 space-y-3 p-3 border-2 border-[#09090B] bg-zinc-50 shadow-[2px_2px_0px_0px_#09090B]">
            <textarea
              value={rawJsonInput}
              onChange={(e) => setRawJsonInput(e.target.value)}
              placeholder={`Dán chuỗi JSON/JSONL ChatML vào đây...\nVí dụ:\n{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}`}
              rows={5}
              className="w-full p-3 font-mono text-xs bg-white border-2 border-[#09090B] focus:outline-none resize-y"
            />
            <button
              onClick={onImportTextJson}
              className="w-full py-2 bg-[#09090B] text-white font-mono font-black text-xs uppercase border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#F97316] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              Validate & Import Text JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
