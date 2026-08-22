'use client';

import { PackageCheck, Tag, MapPin } from 'lucide-react';

export interface NerSlots {
  order_id?: string | number | null;
  order_ids?: (string | number)[] | null;
  new_address?: string | null;
  [key: string]: unknown;
}

interface NerSlotVisualizerProps {
  intent?: string;
  slots?: NerSlots;
}

export function NerSlotVisualizer({ intent, slots }: NerSlotVisualizerProps) {
  return (
    <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B] space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-[#09090B]">
        <h2 className="font-mono text-sm font-black uppercase tracking-wider text-[#09090B] flex items-center gap-2">
          <PackageCheck size={16} className="text-[#F97316]" />
          SLOTS INSPECTION VISUALIZER
        </h2>
        <span className="font-mono text-xs font-black px-3 py-1 bg-amber-400 text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B]">
          INTENT: {intent || 'GENERAL'}
        </span>
      </div>

      {/* Extracted Order IDs Slot */}
      <div className="space-y-2">
        <span className="font-mono text-xs font-black uppercase text-zinc-600 flex items-center gap-1.5">
          <Tag size={14} className="text-[#F97316]" />
          Extracted Order IDs:
        </span>
        <div className="p-4 border-2 border-[#09090B] bg-[#FAFAFA] min-h-12 flex flex-wrap items-center gap-2">
          {slots?.order_ids && slots.order_ids.length > 0 ? (
            slots.order_ids.map((id, idx) => (
              <span
                key={idx}
                className="font-mono text-xs font-black px-3 py-1 bg-emerald-300 text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B]"
              >
                #{id}
              </span>
            ))
          ) : slots?.order_id ? (
            <span className="font-mono text-xs font-black px-3 py-1 bg-emerald-300 text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B]">
              #{slots.order_id}
            </span>
          ) : (
            <span className="font-mono text-xs text-zinc-400 font-bold italic">
              Không phát hiện mã đơn hàng
            </span>
          )}
        </div>
      </div>

      {/* Extracted New Address Slot */}
      <div className="space-y-2">
        <span className="font-mono text-xs font-black uppercase text-zinc-600 flex items-center gap-1.5">
          <MapPin size={14} className="text-[#F97316]" />
          Extracted New Address:
        </span>
        <div className="p-4 border-2 border-[#09090B] bg-[#FAFAFA] font-mono text-xs font-bold text-[#09090B]">
          {slots?.new_address ? (
            <span className="bg-amber-200 px-2 py-1 border border-[#09090B]">
              {slots.new_address}
            </span>
          ) : (
            <span className="text-zinc-400 italic">Không phát hiện địa chỉ mới</span>
          )}
        </div>
      </div>
    </div>
  );
}
