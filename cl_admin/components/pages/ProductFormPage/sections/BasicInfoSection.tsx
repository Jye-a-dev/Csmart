'use client';

import { CreateProductDto, ProductStatus } from '@/types/entities/product';
import { Category } from '@/types/entities/category';

export const STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.IN_STOCK]: 'Còn hàng',
  [ProductStatus.OUT_OF_STOCK]: 'Hết hàng',
  [ProductStatus.PRE_ORDER]: 'Đặt trước',
  [ProductStatus.DISCONTINUED]: 'Ngừng bán',
};

interface BasicInfoSectionProps {
  form: CreateProductDto;
  categories: Category[];
  mode: 'create' | 'edit';
  set: <K extends keyof CreateProductDto>(key: K, value: CreateProductDto[K]) => void;
  onNameChange: (name: string) => void;
}

export function BasicInfoSection({ form, categories, onNameChange, set }: BasicInfoSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Thông tin cơ bản</div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">SKU *</label>
          <input value={form.sku} onChange={(e) => set('sku', e.target.value)} required placeholder="SP-001" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Tên sản phẩm *</label>
          <input value={form.name} onChange={(e) => onNameChange(e.target.value)} required placeholder="Áo thun nam Polo..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Slug *</label>
          <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="ao-thun-nam-polo" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-xs focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-zinc-50 text-zinc-600" />
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Danh mục</label>
          <select value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || undefined)} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white">
            <option value="">— Không chọn —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Trạng thái</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value as ProductStatus)} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white">
            {Object.values(ProductStatus).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <input type="checkbox" id="is_published" checked={form.is_published ?? false} onChange={(e) => set('is_published', e.target.checked)} className="w-4 h-4 accent-[#F97316] border-2 border-[#09090B]" />
          <label htmlFor="is_published" className="font-mono text-xs font-black text-[#09090B] cursor-pointer">Hiển thị công khai (Publish)</label>
        </div>
      </div>
    </section>
  );
}
