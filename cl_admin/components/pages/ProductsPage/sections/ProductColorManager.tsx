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

      {/* Add color inline form */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 border-2 border-[#09090B] items-end">
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-[#09090B] mb-1">Tên màu sắc *</label>
          <input
            type="text"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Ví dụ: Đen nhám, Trắng ngọc"
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

      {/* Colors List Swatches */}
      <div className="flex flex-wrap gap-2 pt-1">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 p-2 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] ${
              color.in_stock ? 'bg-white' : 'bg-rose-50 border-rose-400'
            }`}
          >
            <span
              className="w-4 h-4 rounded-full border border-[#09090B] shrink-0"
              style={{ backgroundColor: color.hex || '#ccc' }}
            />
            <span className="text-xs font-bold text-[#09090B]">{color.name}</span>
            <button
              type="button"
              onClick={() => handleToggleStock(idx)}
              className={`px-1.5 py-0.5 text-[9px] font-bold border uppercase cursor-pointer ${
                color.in_stock
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
              title="Nhấp để đổi trạng thái còn hàng"
            >
              {color.in_stock ? 'Có sẵn' : 'Hết màu'}
            </button>
            <button
              type="button"
              onClick={() => handleRemoveColor(idx)}
              className="p-1 text-rose-600 hover:bg-rose-100 border border-transparent hover:border-[#09090B] cursor-pointer"
              title="Xóa màu"
            >
              <Trash2 size={12} />
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
