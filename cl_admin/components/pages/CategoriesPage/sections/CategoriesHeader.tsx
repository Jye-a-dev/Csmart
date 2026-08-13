'use client';

import { FolderTree, Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { Category } from '@/types/entities/category';

interface CategoriesHeaderProps {
  activeParent: Category | null;
  rootCount: number;
  subCount: number;
  productsCount: number;
  overallLoading: boolean;
  onBackToParent: () => void;
  onRefresh: () => void;
  onOpenCreate: () => void;
}

export function CategoriesHeader({
  activeParent,
  rootCount,
  subCount,
  productsCount,
  overallLoading,
  onBackToParent,
  onRefresh,
  onOpenCreate,
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#09090B] text-[#F97316]"><FolderTree size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
            {activeParent ? `Danh mục con: ${activeParent.name}` : 'Quản Lý Danh Mục'}
          </h1>
        </div>
        <p className="font-mono text-xs text-zinc-500">
          {activeParent
            ? `Các danh mục con thuộc "${activeParent.name}"`
            : `${rootCount} danh mục cha · ${subCount} danh mục con · ${productsCount} sản phẩm`}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {activeParent && (
          <button
            onClick={onBackToParent}
            className="px-4 py-3 border-2 border-[#09090B] bg-white font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Danh mục cha
          </button>
        )}
        <button
          onClick={onRefresh}
          className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <RefreshCw size={15} className={overallLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={onOpenCreate}
          className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 text-xs"
        >
          <Plus size={15} /> Thêm Danh Mục
        </button>
      </div>
    </div>
  );
}
