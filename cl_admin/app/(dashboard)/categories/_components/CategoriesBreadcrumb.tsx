'use client';

import { FolderTree } from 'lucide-react';
import { Category } from '@/types/entities/category';

interface CategoriesBreadcrumbProps {
  activeParent: Category | null;
  onClearParent: () => void;
}

export function CategoriesBreadcrumb({ activeParent, onClearParent }: CategoriesBreadcrumbProps) {
  if (!activeParent) return null;

  return (
    <div className="flex items-center justify-between p-3 border-2 border-[#09090B] bg-[#FAFAFA] font-mono text-xs font-bold">
      <div className="flex items-center gap-2">
        <FolderTree size={14} className="text-[#F97316]" />
        <span>DANH MỤC CON THUỘC: <strong className="uppercase underline">{activeParent.name}</strong></span>
      </div>
      <button onClick={onClearParent} className="text-rose-600 underline hover:text-rose-800 cursor-pointer text-xs">
        ← Tất cả cha
      </button>
    </div>
  );
}
