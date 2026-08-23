'use client';

import { CreateProductDto } from '@/types/entities/product';

interface DescriptionSectionProps {
  form: CreateProductDto;
  set: <K extends keyof CreateProductDto>(key: K, value: CreateProductDto[K]) => void;
}

export function DescriptionSection({ form, set }: DescriptionSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Mô tả sản phẩm</div>
      <div className="p-5 space-y-4">
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Mô tả ngắn</label>
          <textarea value={form.short_description ?? ''} onChange={(e) => set('short_description', e.target.value)} rows={3} placeholder="Mô tả 1-2 câu hiển thị ngoài danh sách sản phẩm..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white resize-none" />
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Mô tả chi tiết</label>
          <textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={6} placeholder="Mô tả đầy đủ, nội dung HTML được hỗ trợ..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white resize-none" />
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Thông số kỹ thuật</label>
          <textarea value={form.specifications ?? ''} onChange={(e) => set('specifications', e.target.value)} rows={4} placeholder="Trọng lượng: 200g&#10;Chất liệu: 100% Cotton&#10;Kích thước: S / M / L / XL" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white resize-none" />
        </div>
      </div>
    </section>
  );
}
