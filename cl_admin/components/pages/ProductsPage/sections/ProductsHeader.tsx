'use client';

import { Plus, RefreshCw } from 'lucide-react';

interface ProductsHeaderProps {
  activeTab: 'products' | 'categories';
  overallLoading: boolean;
  onLoadData: () => void;
  onProductCreate: () => void;
  onCategoryCreate: () => void;
}

export default function ProductsHeader({
  activeTab,
  overallLoading,
  onLoadData,
  onProductCreate,
  onCategoryCreate
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
          Quản Lý Sản Phẩm & Danh Mục
        </h1>
        <p className="text-zinc-500 font-mono text-xs mt-1">
          Thiết lập danh mục sản phẩm, cập nhật tồn kho, thay đổi trạng thái bán và giá cả.
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
        
        {activeTab === 'products' ? (
          <button
            onClick={onProductCreate}
            className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            Thêm Sản Phẩm
          </button>
        ) : (
          <button
            onClick={onCategoryCreate}
            className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            Thêm Danh Mục
          </button>
        )}
      </div>
    </div>
  );
}
