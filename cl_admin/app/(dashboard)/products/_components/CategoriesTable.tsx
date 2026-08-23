'use client';

import { Category } from '@/types/entities/category';
import { Search, Edit, Trash2 } from 'lucide-react';

interface CategoriesTableProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onSelectCategory: (id: string) => void;
}

export default function CategoriesTable({
  categories,
  loading,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm,
  onSelectCategory
}: CategoriesTableProps) {

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return 'Không có';
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : `#${parentId}`;
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Tên danh mục, slug, mô tả..."
          className="w-full pl-10 pr-4 py-3 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-sm bg-white shadow-[3px_3px_0px_0px_#09090B]"
        />
      </div>

      {/* Table */}
      <div className="border-4 border-[#09090B] bg-white p-6 shadow-[6px_6px_0px_0px_#09090B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#09090B] font-mono text-xs uppercase text-zinc-500">
                <th className="py-3.5 pr-4">ID</th>
                <th className="py-3.5 px-4">Tên Danh Mục</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Mô Tả</th>
                <th className="py-3.5 px-4">Danh Mục Cha</th>
                <th className="py-3.5 pl-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {loading && filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono text-xs italic">
                    Đang tải dữ liệu danh mục...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono text-xs italic">
                    Không tìm thấy danh mục nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 pr-4 font-mono font-bold text-[#09090B]">
                      #{c.id}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#09090B]">
                      <button
                        onClick={() => onSelectCategory(c.id)}
                        className="font-bold text-[#09090B] hover:text-[#F97316] hover:underline transition-colors text-left focus:outline-none"
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-zinc-600">
                      {c.slug}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 max-w-xs truncate" title={c.description}>
                      {c.description || <span className="italic text-zinc-300">Không có mô tả</span>}
                    </td>
                    <td className="py-4 px-4 text-zinc-700 font-mono text-xs">
                      {getParentName(c.parent_id)}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(c)}
                          className="p-1.5 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                          title="Sửa danh mục"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="p-1.5 border-2 border-rose-300 bg-rose-50 text-rose-700 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                          title="Xóa danh mục"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
