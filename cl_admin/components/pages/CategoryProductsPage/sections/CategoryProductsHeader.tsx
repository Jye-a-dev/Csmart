'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, RefreshCw, Package } from 'lucide-react';

interface CategoryProductsHeaderProps {
  currentCategoryName: string;
  currentCategoryDescription: string;
  overallLoading: boolean;
  onLoadData: () => void;
  onProductCreate: () => void;
}

export default function CategoryProductsHeader({
  currentCategoryName,
  currentCategoryDescription,
  overallLoading,
  onLoadData,
  onProductCreate
}: CategoryProductsHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <button
          onClick={() => router.push('/products')}
          className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          Quay lại danh mục
        </button>
        
        <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B] flex items-center gap-3">
          <Package className="text-[#F97316]" size={28} />
          {currentCategoryName}
        </h1>
        <p className="text-zinc-500 font-mono text-xs mt-1">
          {currentCategoryDescription}
        </p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onLoadData}
          className="p-3 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
          title="Đồng bộ dữ liệu"
        >
          <RefreshCw size={16} className={overallLoading ? 'animate-spin' : ''} />
        </button>
        
        <button
          onClick={onProductCreate}
          className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm sản phẩm mới
        </button>
      </div>
    </div>
  );
}
