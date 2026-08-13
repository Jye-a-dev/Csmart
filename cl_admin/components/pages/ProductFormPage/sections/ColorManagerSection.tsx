'use client';

import { ProductColor } from '@/types/entities/product';
import { Plus, Trash2 } from 'lucide-react';

interface ColorManagerSectionProps {
  colors: ProductColor[];
  onAddColor: () => void;
  onUpdateColor: (i: number, patch: Partial<ProductColor>) => void;
  onRemoveColor: (i: number) => void;
}

export function ColorManagerSection({ colors, onAddColor, onUpdateColor, onRemoveColor }: ColorManagerSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center justify-between">
        <span>Màu sắc ({colors.length})</span>
        <button type="button" onClick={onAddColor} className="flex items-center gap-1 text-[#F97316] hover:text-amber-400 cursor-pointer font-mono text-xs">
          <Plus size={13} /> Thêm màu
        </button>
      </div>
      <div className="p-5 space-y-3">
        {colors.length === 0 ? (
          <p className="font-mono text-xs text-zinc-400 italic">Chưa có màu nào. Nhấn &quot;Thêm màu&quot; để thêm.</p>
        ) : colors.map((color, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border-2 border-[#09090B]">
            <input type="color" value={color.hex ?? '#000000'} onChange={(e) => onUpdateColor(i, { hex: e.target.value })} className="w-10 h-10 border-2 border-[#09090B] cursor-pointer p-0.5 bg-white" />
            <input value={color.name} onChange={(e) => onUpdateColor(i, { name: e.target.value })} placeholder="Tên màu (VD: Đỏ đậm)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
            <label className="flex items-center gap-1.5 font-mono text-xs cursor-pointer">
              <input type="checkbox" checked={color.in_stock} onChange={(e) => onUpdateColor(i, { in_stock: e.target.checked })} className="accent-[#F97316]" />
              Còn hàng
            </label>
            <button type="button" onClick={() => onRemoveColor(i)} className="p-1.5 border-2 border-[#09090B] bg-rose-400 text-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
