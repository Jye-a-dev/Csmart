'use client';

import { Sliders, Trash2 } from 'lucide-react';

interface CopilotTuningPanelProps {
  temperature: number;
  setTemperature: (val: number) => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  onClearChat: () => void;
}

export function CopilotTuningPanel({
  temperature,
  setTemperature,
  confidenceThreshold,
  setConfidenceThreshold,
  onClearChat,
}: CopilotTuningPanelProps) {
  return (
    <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B] space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#09090B] pb-3">
        <h2 className="font-mono text-xs font-black uppercase tracking-wider text-[#09090B] flex items-center gap-2">
          <Sliders size={16} className="text-[#F97316]" />
          PARAMETER TUNING CONTROLS
        </h2>
        <button
          onClick={onClearChat}
          className="font-mono text-xs font-bold px-3 py-1 bg-zinc-100 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 size={12} /> Xóa Chat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature Slider */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-xs font-black">
            <span>Temperature</span>
            <span className="text-[#F97316]">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-[#F97316] cursor-pointer"
          />
          <span className="font-mono text-[10px] text-zinc-500 block">
            (0.0 = Sáng tạo thấp/Bảo thủ, 1.0 = Sáng tạo cao)
          </span>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-xs font-black">
            <span>Confidence Threshold</span>
            <span className="text-[#F97316]">{confidenceThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full accent-[#F97316] cursor-pointer"
          />
          <span className="font-mono text-[10px] text-zinc-500 block">
            (Ngưỡng đẩy vào hàng chờ duyệt HITL)
          </span>
        </div>
      </div>
    </div>
  );
}
