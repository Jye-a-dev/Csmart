'use client';

import { CreateProductDto } from '@/types/entities/product';

interface PricingStockSectionProps {
  form: CreateProductDto;
  set: <K extends keyof CreateProductDto>(key: K, value: CreateProductDto[K]) => void;
}

export function PricingStockSection({ form, set }: PricingStockSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Giá & Kho hàng</div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Giá gốc (₫) *</label>
          <input type="number" min={0} value={form.base_price} onChange={(e) => set('base_price', Number(e.target.value))} required className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Giá khuyến mãi (₫)</label>
          <input type="number" min={0} value={form.discount_price ?? ''} onChange={(e) => set('discount_price', e.target.value ? Number(e.target.value) : undefined)} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
        </div>
        <div>
          <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Số lượng tồn kho</label>
          <input type="number" min={0} value={form.stock_quantity ?? 0} onChange={(e) => set('stock_quantity', Number(e.target.value))} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
        </div>
      </div>
    </section>
  );
}
