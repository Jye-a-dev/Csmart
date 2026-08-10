'use client';

import { Product, ProductStatus } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { Search, ChevronDown, Edit, Trash2 } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
}

export default function ProductsTable({
  products,
  categories,
  loading,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory
}: ProductsTableProps) {

  const getStatusStyle = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.IN_STOCK:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case ProductStatus.OUT_OF_STOCK:
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      case ProductStatus.PRE_ORDER:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case ProductStatus.DISCONTINUED:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const getCategoryName = (id?: string) => {
    if (!id) return 'Không danh mục';
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : `Danh mục (${id.slice(0,8)}...)`;
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || String(p.category_id) === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên sản phẩm, SKU..."
            className="w-full pl-10 pr-4 py-3 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-sm bg-white shadow-[3px_3px_0px_0px_#09090B]"
          />
        </div>
        
        <div className="md:col-span-4 relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#09090B] focus:outline-none font-mono text-sm bg-white shadow-[3px_3px_0px_0px_#09090B] appearance-none cursor-pointer"
          >
            <option value="ALL">TẤT CẢ DANH MỤC</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-600">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-4 border-[#09090B] bg-white p-6 shadow-[6px_6px_0px_0px_#09090B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#09090B] font-mono text-xs uppercase text-zinc-500">
                <th className="py-3.5 pr-4">SKU</th>
                <th className="py-3.5 px-4">Tên Sản Phẩm</th>
                <th className="py-3.5 px-4">Danh Mục</th>
                <th className="py-3.5 px-4 text-right">Đơn Giá</th>
                <th className="py-3.5 px-4 text-center">Tồn Kho</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 pl-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {loading && filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs italic">
                    Đang tải dữ liệu sản phẩm...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs italic">
                    Không tìm thấy sản phẩm nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 pr-4 font-mono font-bold text-[#09090B]">
                      {p.sku}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#09090B] max-w-xs truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-mono text-xs">
                      {getCategoryName(p.category_id)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-[#09090B]">
                      {Number(p.base_price).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-[#09090B]">
                      {p.stock_quantity}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 border-2 border-[#09090B] shadow-[1px_1px_0px_0px_#09090B] uppercase ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                          title="Sửa sản phẩm"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="p-1.5 border-2 border-rose-300 bg-rose-50 text-rose-700 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                          title="Xóa sản phẩm"
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
