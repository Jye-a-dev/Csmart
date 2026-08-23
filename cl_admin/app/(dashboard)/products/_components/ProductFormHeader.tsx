'use client';

import { useRouter } from 'next/navigation';
import { Package, Save, ArrowLeft, Loader2 } from 'lucide-react';

interface ProductFormHeaderProps {
  mode: 'create' | 'edit';
  productId?: string;
  saving: boolean;
  isLoading: boolean;
}

export function ProductFormHeader({ mode, productId, saving, isLoading }: ProductFormHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="p-2 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="p-2 bg-[#09090B] text-[#F97316]"><Package size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
            {mode === 'create' ? 'Tạo Sản Phẩm' : 'Chỉnh Sửa Sản Phẩm'}
          </h1>
        </div>
        {mode === 'edit' && productId && (
          <p className="font-mono text-xs text-zinc-500 ml-24">ID: #{productId}</p>
        )}
      </div>
      <button
        form="product-form"
        type="submit"
        disabled={saving || isLoading}
        className="px-6 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {mode === 'create' ? 'Tạo Sản Phẩm' : 'Lưu Thay Đổi'}
      </button>
    </div>
  );
}
