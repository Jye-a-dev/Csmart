'use client';

import { useState } from 'react';
import { ProductColor } from '@/types/entities/product';
import { Plus, Trash2, Palette } from 'lucide-react';

interface ProductColorManagerProps {
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}

export default function ProductColorManager({
  colors = [],
  onChange,
}: ProductColorManagerProps) {
  const [colorName, setColorName] = useState('');
  const [hexColor, setHexColor] = useState('#000000');
  const [inStock, setInStock] = useState(true);

  const handleAddColor = () => {
    if (!colorName.trim()) {
      alert('Vui lòng nhập tên màu sắc.');
      return;
    }

    const newColor: ProductColor = {
      name: colorName.trim(),
      hex: hexColor,
      in_stock: inStock,
    };

    onChange([...colors, newColor]);
    setColorName('');
    setHexColor('#000000');
    setInStock(true);
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
    <div className="border-2 border-[#09090B] p-4 bg-zinc-50 space-y-4 font-mono">
      <div className="flex items-center gap-2 border-b-2 border-[#09090B] pb-2">
        <Palette size={16} className="text-[#F97316]" />
        <label className="text-xs font-bold uppercase text-[#09090B]">
          🎨 Màu Sắc Sản Phẩm ({colors.length} màu)
        </label>
      </div>

      {/* Add color form */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 border-2 border-[#09090B] items-end">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-[#09090B] mb-1">Thêm tên màu *</label>
          <input
            type="text"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Ví dụ: Đỏ cờ, Vàng sao"
            className="w-full px-2.5 py-1.5 border border-[#09090B] text-xs focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddColor();
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div>
            <label className="block text-[10px] font-bold text-[#09090B] mb-1">Mã màu</label>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                className="w-8 h-7 border border-[#09090B] cursor-pointer p-0 bg-transparent"
              />
              <span className="text-[10px] text-zinc-500 font-mono">{hexColor}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="accent-[#F97316] w-4 h-4 border border-[#09090B]"
            />
            Có sẵn
          </label>

          <button
            type="button"
            onClick={handleAddColor}
            className="px-3 py-1.5 border-2 border-[#09090B] bg-[#09090B] text-white text-xs font-bold uppercase hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#F97316] flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            Thêm
          </button>
        </div>
      </div>

      {/* Editable Colors List */}
      <div className="space-y-2 pt-1">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] ${
              !color.in_stock ? 'bg-rose-50/50' : ''
            }`}
          >
            {/* Direct color picker & Hex input */}
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="color"
                value={color.hex || '#000000'}
                onChange={(e) => handleUpdateColor(idx, { hex: e.target.value })}
                className="w-8 h-8 border-2 border-[#09090B] cursor-pointer p-0.5 bg-white shrink-0"
                title="Chọn lại mã màu"
              />
              <input
                type="text"
                value={color.hex || '#000000'}
                onChange={(e) => handleUpdateColor(idx, { hex: e.target.value })}
                className="w-20 px-1.5 py-1 border border-[#09090B] font-mono text-xs text-zinc-700 uppercase"
                title="Nhập mã hex"
                placeholder="#000000"
              />
            </div>

            {/* Direct name editor */}
            <input
              type="text"
              value={color.name}
              onChange={(e) => handleUpdateColor(idx, { name: e.target.value })}
              placeholder="Tên màu sắc..."
              className="flex-1 min-w-30 px-2.5 py-1.5 border border-[#09090B] font-bold text-xs text-[#09090B] focus:outline-none bg-white"
            />

            {/* Toggle stock button */}
            <button
              type="button"
              onClick={() => handleToggleStock(idx)}
              className={`px-2.5 py-1.5 text-[10px] font-bold border-2 border-[#09090B] uppercase cursor-pointer shrink-0 transition-all ${
                color.in_stock
                  ? 'bg-emerald-100 text-emerald-900 shadow-[1px_1px_0px_0px_#09090B]'
                  : 'bg-rose-100 text-rose-900 shadow-[1px_1px_0px_0px_#09090B]'
              }`}
              title="Nhấp để đổi trạng thái tồn kho"
            >
              {color.in_stock ? 'Có sẵn' : 'Hết hàng'}
            </button>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemoveColor(idx)}
              className="p-1.5 text-rose-600 hover:bg-rose-100 border-2 border-[#09090B] cursor-pointer shrink-0 bg-white shadow-[1px_1px_0px_0px_#09090B]"
              title="Xóa màu"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {colors.length === 0 && (
          <div className="text-xs italic text-zinc-400 py-2">
            Chưa thiết lập màu sắc cho sản phẩm này.
          </div>
        )}
      </div>
    </div>
  );
}
