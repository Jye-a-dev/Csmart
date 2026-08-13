'use client';

import { Sliders } from 'lucide-react';

interface ConfidenceThresholdSectionProps {
  confidenceThreshold: number;
  onChange: (val: number) => void;
}

export function ConfidenceThresholdSection({ confidenceThreshold, onChange }: ConfidenceThresholdSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center gap-2">
        <Sliders size={14} className="text-[#F97316]" />
        Ngưỡng Tin cậy AI (Confidence Threshold)
      </div>
      <div className="p-5 space-y-4">
        <p className="font-mono text-xs text-zinc-500">
          Các AI request có confidence score thấp hơn ngưỡng này sẽ tự động được gắn cờ <code className="bg-zinc-100 px-1 font-black">flag_for_review: true</code> và đưa vào hàng chờ HITL.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={confidenceThreshold}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 accent-[#F97316] h-2"
          />
          <div className="border-2 border-[#09090B] px-4 py-2 font-mono font-black text-lg text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] min-w-20 text-center">
            {(confidenceThreshold * 100).toFixed(0)}%
          </div>
        </div>
        <div className="flex justify-between font-mono text-[10px] text-zinc-400">
          <span>0% — Không lọc</span>
          <span className="text-amber-600 font-black">Hiện tại: {(confidenceThreshold * 100).toFixed(0)}%</span>
          <span>100% — Lọc rất nghiêm</span>
        </div>
        {/* Visual hint */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { range: '0–50%', label: 'Rủi ro cao', cls: 'bg-rose-100 border-rose-300 text-rose-700' },
            { range: '50–80%', label: 'Cần review', cls: 'bg-amber-100 border-amber-300 text-amber-700' },
            { range: '80–100%', label: 'Tin cậy cao', cls: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
          ].map((zone) => (
            <div key={zone.range} className={`p-2 border rounded font-mono text-[10px] font-black ${zone.cls}`}>
              <div>{zone.range}</div>
              <div>{zone.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
