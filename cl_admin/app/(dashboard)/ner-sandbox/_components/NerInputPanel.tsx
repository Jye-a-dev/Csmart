'use client';

import { Send, Sparkles, RefreshCw } from 'lucide-react';

interface NerInputPanelProps {
  text: string;
  setText: (val: string) => void;
  loading: boolean;
  onExtractNer: (txt?: string) => void;
  sampleInputs: string[];
}

export function NerInputPanel({
  text,
  setText,
  loading,
  onExtractNer,
  sampleInputs,
}: NerInputPanelProps) {
  return (
    <div className="space-y-6">
      <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B]">
        <h2 className="font-mono text-sm font-black uppercase tracking-wider text-[#09090B] mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#F97316]" />
          INPUT ORDER MESSAGE
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập câu yêu cầu xử lý đơn hàng của khách..."
          rows={5}
          className="w-full p-4 font-mono text-xs border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B] resize-none"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => onExtractNer()}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 font-mono text-xs font-black uppercase px-5 py-2.5 bg-[#F97316] text-white border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            Trích Xuất Entity (NER)
          </button>
        </div>
      </div>

      <div className="border-2 border-t-4 border-[#09090B] bg-[#FAFAFA] p-6 shadow-[4px_4px_0px_0px_#09090B]">
        <h3 className="font-mono text-xs font-black uppercase tracking-wider text-[#09090B] mb-3">
          CÂU THOẠI TEST CÓ SẴN
        </h3>
        <div className="space-y-2">
          {sampleInputs.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(sample);
                onExtractNer(sample);
              }}
              className="w-full text-left font-mono text-xs p-3 border-2 border-[#09090B] bg-white text-[#09090B] hover:bg-sky-100 shadow-[2px_2px_0px_0px_#09090B] transition-all hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer line-clamp-2"
            >
              {`"${sample}"`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
