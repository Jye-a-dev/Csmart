'use client';

import { Package, Layers } from 'lucide-react';

interface ProductsTabsProps {
  activeTab: 'products' | 'categories';
  setActiveTab: (tab: 'products' | 'categories') => void;
  productsCount: number;
  categoriesCount: number;
}

export default function ProductsTabs({
  activeTab,
  setActiveTab,
  productsCount,
  categoriesCount
}: ProductsTabsProps) {
  return (
    <div className="flex border-4 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] overflow-hidden">
      <button
        onClick={() => setActiveTab('products')}
        className={`flex-1 py-4 font-mono font-bold uppercase transition-colors flex items-center justify-center gap-2 border-r-4 border-[#09090B] ${
          activeTab === 'products' ? 'bg-[#F97316] text-[#FAFAFA]' : 'hover:bg-zinc-100 text-[#09090B]'
        }`}
      >
        <Package size={18} />
        Danh sách Sản Phẩm ({productsCount})
      </button>
      <button
        onClick={() => setActiveTab('categories')}
        className={`flex-1 py-4 font-mono font-bold uppercase transition-colors flex items-center justify-center gap-2 ${
          activeTab === 'categories' ? 'bg-[#F97316] text-[#FAFAFA]' : 'hover:bg-zinc-100 text-[#09090B]'
        }`}
      >
        <Layers size={18} />
        Quản Lý Danh Mục ({categoriesCount})
      </button>
    </div>
  );
}
