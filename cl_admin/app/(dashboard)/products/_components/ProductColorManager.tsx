'use client';

import { useState } from 'react';
import { ProductColor } from '@/types/entities/product';
import { Plus, Trash2, Palette, Sparkles, Check } from 'lucide-react';

interface ProductColorManagerProps {
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}

const COLOR_PRESETS = [
  { name: 'Đen Tuyền', hex: '#18181B' },
  { name: 'Trắng Sữa', hex: '#FFFFFF' },
  { name: 'Cam CSmart', hex: '#F97316' },
  { name: 'Xanh Navy', hex: '#1E3A8A' },
  { name: 'Xám Titan', hex: '#64748B' },
  { name: 'Đỏ Ruby', hex: '#DC2626' },
];

export default function ProductColorManager({
  colors = [],
  onChange,
}: ProductColorManagerProps) {
  const [colorName, setColorName] = useState('');
  const [hexColor, setHexColor] = useState('#F97316');
  const [inStock, setInStock] = useState(true);

  const handleAddColor = () => {
    if (!colorName.trim()) {
      return;
    }

    const newColor: ProductColor = {
      name: colorName.trim(),
      hex: hexColor,
      in_stock: inStock,
    };

    onChange([...colors, newColor]);
    setColorName('');
    setHexColor('#F97316');
    setInStock(true);
  };

  const handlePresetSelect = (preset: { name: string; hex: string }) => {
    setColorName(preset.name);
    setHexColor(preset.hex);
  };

  const handleUpdateColor = (indexToUpdate: number, patch: Partial<ProductColor>) => {
    onChange(
      colors.map((c, idx) =>
        idx === indexToUpdate ? { ...c, ...patch } : c
      )
    );
  };

  const handleRemoveColor = (indexToRemove: number) => {
    onChange(colors.filter((_, idx) => idx !== indexToRemove));
  };

  const handleToggleStock = (indexToToggle: number) => {
    onChange(
      colors.map((c, idx) =>
        idx === indexToToggle ? { ...c, in_stock: !c.in_stock } : c
      )
    );
  };

  return (
    <div className="border-2 border-zinc-900 bg-white p-5 space-y-4 shadow-[3px_3px_0px_0px_#09090B]">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-orange-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 font-sans">
            Màu Sắc & Biến Thể
          </h3>
        </div>
        <span className="text-[11px] font-mono bg-zinc-100 text-zinc-800 px-2.5 py-0.5 rounded border border-zinc-300 font-bold">
          {colors.length} màu cấu hình
        </span>
      </div>

      {/* Quick Color Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mr-1">
          <Sparkles size={12} className="text-orange-500" /> Chọn nhanh:
        </span>
        {COLOR_PRESETS.map((p) => (
          <button
            key={p.hex}
            type="button"
            onClick={() => handlePresetSelect(p)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 hover:bg-orange-50 text-zinc-700 hover:text-orange-700 border border-zinc-200 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-zinc-300 shrink-0"
              style={{ backgroundColor: p.hex }}
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Add Color Form */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-zinc-50/80 p-3.5 border-2 border-zinc-900 items-end">
        {/* Name input */}
        <div className="sm:col-span-5">
          <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
            Tên màu sắc *
          </label>
          <input
            type="text"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Ví dụ: Đen nhám, Xanh rêu..."
            className="w-full px-3 py-2 border-2 border-zinc-900 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddColor();
              }
            }}
          />
        </div>

        {/* Swatch & Hex input */}
        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
            Mã màu Hex
          </label>
          <div className="flex items-center gap-1.5">
            <div className="relative w-9 h-9 shrink-0 rounded border-2 border-zinc-900 overflow-hidden shadow-xs">
              <input
                type="color"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-none p-0 bg-transparent"
                title="Chọn mã màu trực quan"
              />
            </div>
            <input
              type="text"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              placeholder="#000000"
              className="w-full px-2 py-2 border-2 border-zinc-900 font-mono text-xs text-zinc-800 uppercase bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* In-Stock & Add CTA */}
        <div className="sm:col-span-4 flex items-center justify-between gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-zinc-800 select-none">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="accent-orange-600 w-4 h-4 border-2 border-zinc-900 rounded cursor-pointer"
            />
            <span>Còn hàng</span>
          </label>

          <button
            type="button"
            onClick={handleAddColor}
            disabled={!colorName.trim()}
            className="px-4 py-2 border-2 border-zinc-900 bg-zinc-900 text-white text-xs font-black uppercase tracking-wider hover:bg-zinc-800 disabled:bg-zinc-200 disabled:border-zinc-300 disabled:text-zinc-400 shadow-[2px_2px_0px_0px_#F97316] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            <Plus size={14} />
            <span>Thêm</span>
          </button>
        </div>
      </div>

      {/* Colors List */}
      <div className="space-y-2 pt-1">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-2.5 border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_0px_#09090B] transition-all hover:border-orange-500 ${
              !color.in_stock ? 'bg-rose-50/40' : ''
            }`}
          >
            {/* Swatch & Hex */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-7 h-7 rounded border-2 border-zinc-900 shrink-0 shadow-xs"
                style={{ backgroundColor: color.hex || '#000000' }}
                title={color.hex}
              />
              <input
                type="text"
                value={color.hex || '#000000'}
                onChange={(e) => handleUpdateColor(idx, { hex: e.target.value })}
                className="w-20 px-1.5 py-1 border border-zinc-300 font-mono text-[11px] text-zinc-700 uppercase bg-zinc-50 rounded"
                title="Mã Hex"
              />
            </div>

            {/* Name Input */}
            <input
              type="text"
              value={color.name}
              onChange={(e) => handleUpdateColor(idx, { name: e.target.value })}
              placeholder="Tên màu..."
              className="flex-1 min-w-36 px-2.5 py-1.5 border border-zinc-300 font-bold text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 bg-white rounded"
            />

            {/* Stock Toggle Badge */}
            <button
              type="button"
              onClick={() => handleToggleStock(idx)}
              className={`px-3 py-1.5 text-[11px] font-bold border rounded uppercase cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${
                color.in_stock
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
              title="Nhấp để đổi trạng thái tồn kho"
            >
              {color.in_stock ? (
                <>
                  <Check size={12} className="text-emerald-600 stroke-3" />
                  <span>Có sẵn</span>
                </>
              ) : (
                <span>Hết hàng</span>
              )}
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => handleRemoveColor(idx)}
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded cursor-pointer shrink-0 transition-colors"
              title="Xóa màu này"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {colors.length === 0 && (
          <div className="text-xs text-zinc-400 py-6 text-center border-2 border-dashed border-zinc-200 bg-zinc-50/50 rounded">
            Chưa có màu sắc nào được thiết lập. Hãy thêm màu sắc ở trên.
          </div>
        )}
      </div>
    </div>
  );
}
