'use client';

import React from 'react';
import {
  Tag,
  Boxes,
  FileText,
  DollarSign,
  Layers,
  Palette,
  MapPin,
} from 'lucide-react';
import { Category } from '@/types/entities/category';

interface OcrQuickCreateFormFieldsProps {
  name: string;
  sku: string;
  slug: string;
  categoryId: string;
  basePrice: number;
  stockQuantity: number;
  colorName: string;
  origin: string;
  description: string;
  isPublished: boolean;
  categories: Category[];
  onNameChange: (val: string) => void;
  onSkuChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onCategoryIdChange: (val: string) => void;
  onBasePriceChange: (val: number) => void;
  onStockQuantityChange: (val: number) => void;
  onColorNameChange: (val: string) => void;
  onOriginChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onIsPublishedChange: (val: boolean) => void;
}

export function OcrQuickCreateFormFields({
  name,
  sku,
  slug,
  categoryId,
  basePrice,
  stockQuantity,
  colorName,
  origin,
  description,
  isPublished,
  categories,
  onNameChange,
  onSkuChange,
  onSlugChange,
  onCategoryIdChange,
  onBasePriceChange,
  onStockQuantityChange,
  onColorNameChange,
  onOriginChange,
  onDescriptionChange,
  onIsPublishedChange,
}: OcrQuickCreateFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Field 1: Name */}
      <div className="md:col-span-2 space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <Tag size={14} className="text-blue-600" />
          <span>TÊN SẢN PHẨM *</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="VD: Áo Thun Thể Thao Nam..."
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
          required
        />
      </div>

      {/* Field 2: SKU */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <Boxes size={14} className="text-[#F97316]" />
          <span>MÃ SKU / BARCODE *</span>
        </label>
        <input
          type="text"
          value={sku}
          onChange={(e) => onSkuChange(e.target.value.toUpperCase())}
          placeholder="VD: PUMA-TSHIRT-01"
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
          required
        />
      </div>

      {/* Field 3: Slug */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <FileText size={14} className="text-zinc-600" />
          <span>SLUG URL *</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="ao-thun-the-thao-nam"
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
          required
        />
      </div>

      {/* Field 4: Price */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <DollarSign size={14} className="text-emerald-600" />
          <span>ĐƠN GIÁ NIÊM YẾT (VNĐ) *</span>
        </label>
        <input
          type="number"
          min="0"
          step="1000"
          value={basePrice}
          onChange={(e) => onBasePriceChange(Number(e.target.value))}
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs font-black text-[#F97316] focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
          required
        />
      </div>

      {/* Field 5: Stock */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <Boxes size={14} className="text-purple-600" />
          <span>SỐ LƯỢNG TỒN KHO *</span>
        </label>
        <input
          type="number"
          min="0"
          value={stockQuantity}
          onChange={(e) => onStockQuantityChange(Number(e.target.value))}
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
          required
        />
      </div>

      {/* Field 6: Category */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <Layers size={14} className="text-indigo-600" />
          <span>DANH MỤC SẢN PHẨM</span>
        </label>
        <select
          value={categoryId}
          onChange={(e) => onCategoryIdChange(e.target.value)}
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
        >
          <option value="">-- Chưa gán danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.slug})
            </option>
          ))}
        </select>
      </div>

      {/* Field 7: Color */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <Palette size={14} className="text-pink-600" />
          <span>MÀU SẮC</span>
        </label>
        <input
          type="text"
          value={colorName}
          onChange={(e) => onColorNameChange(e.target.value)}
          placeholder="VD: Đen, Trắng, Xanh..."
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
        />
      </div>

      {/* Field 8: Origin */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <MapPin size={14} className="text-teal-600" />
          <span>XUẤT XỨ / NGUỒN GỐC</span>
        </label>
        <input
          type="text"
          value={origin}
          onChange={(e) => onOriginChange(e.target.value)}
          placeholder="VD: Việt Nam, Nhật Bản..."
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
        />
      </div>

      {/* Field 9: Published Checkbox */}
      <div className="flex items-center gap-2 pt-6">
        <input
          type="checkbox"
          id="is-published"
          checked={isPublished}
          onChange={(e) => onIsPublishedChange(e.target.checked)}
          className="w-4 h-4 accent-emerald-600 border-2 border-[#09090B]"
        />
        <label
          htmlFor="is-published"
          className="font-mono text-xs font-bold text-[#09090B] uppercase cursor-pointer"
        >
          CÔNG KHAI SẢN PHẨM TRÊN GIAO DIỆN BÁN HÀNG
        </label>
      </div>

      {/* Field 10: Description */}
      <div className="md:col-span-2 space-y-1">
        <label className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#09090B] uppercase">
          <FileText size={14} className="text-zinc-600" />
          <span>MÔ TẢ CHI TIẾT</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full bg-[#FAFAFA] border-2 border-[#09090B] p-2.5 font-mono text-xs focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#09090B]"
        />
      </div>
    </div>
  );
}

