'use client';

import { useState } from 'react';
import { Product, ProductStatus } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { Search, Edit, Trash2, Filter, Sparkles, PackageSearch, X } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (val: string) => void;
}

export default function ProductsTable({
  products,
  categories,
  loading,
  onEdit,
  onDelete,
  searchTerm,
  setSearchTerm,
  selectedCategory = 'ALL',
}: ProductsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.IN_STOCK:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Còn hàng</span>
          </span>
        );
      case ProductStatus.OUT_OF_STOCK:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>Hết hàng</span>
          </span>
        );
      case ProductStatus.PRE_ORDER:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Đặt trước</span>
          </span>
        );
      case ProductStatus.DISCONTINUED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
            <span>Ngừng kinh doanh</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  const getCategoryName = (id?: string) => {
    if (!id) return 'Chưa phân loại';
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : `Danh mục (${String(id).slice(0, 6)}...)`;
  };

  // Recursively collect parent and all child category IDs
  const getAllCategoryIdsInTree = (catId: string, allCats: Category[]): string[] => {
    const directChildren = allCats.filter((c) => c.parent_id === catId);
    let ids: string[] = [catId];
    for (const child of directChildren) {
      ids = [...ids, ...getAllCategoryIdsInTree(child.id, allCats)];
    }
    return ids;
  };

  const targetCategoryIds =
    !selectedCategory || selectedCategory === 'ALL'
      ? []
      : getAllCategoryIdsInTree(selectedCategory, categories);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      !selectedCategory ||
      selectedCategory === 'ALL' ||
      targetCategoryIds.includes(String(p.category_id)) ||
      String(p.category_id) === selectedCategory;

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Field */}
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã SKU..."
            className="w-full pl-10 pr-9 py-2.5 border-2 border-zinc-900 bg-white font-sans text-sm text-zinc-900 shadow-[3px_3px_0px_0px_#09090B] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-zinc-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="md:col-span-4 relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-4 pr-9 py-2.5 border-2 border-zinc-900 font-sans text-xs font-bold uppercase bg-white shadow-[3px_3px_0px_0px_#09090B] appearance-none cursor-pointer text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value={ProductStatus.IN_STOCK}>Còn hàng</option>
            <option value={ProductStatus.OUT_OF_STOCK}>Hết hàng</option>
            <option value={ProductStatus.PRE_ORDER}>Đặt trước</option>
            <option value={ProductStatus.DISCONTINUED}>Ngừng bán</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-600">
            <Filter size={15} />
          </div>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="border-2 border-zinc-900 bg-white shadow-[4px_4px_0px_0px_#09090B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 bg-zinc-50/80 text-xs font-bold uppercase tracking-wider text-zinc-600">
                <th className="py-3 px-4 font-mono">Mã SKU</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4 text-right">Đơn Giá</th>
                <th className="py-3 px-4 text-center">Tồn Kho</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {/* Skeleton Loading State */}
              {loading && filteredProducts.length === 0 && (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-zinc-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-200 rounded shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 w-40 bg-zinc-200 rounded" />
                          <div className="h-3 w-20 bg-zinc-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-zinc-200 rounded" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-4 w-20 bg-zinc-200 rounded ml-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-10 bg-zinc-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 w-24 bg-zinc-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 w-16 bg-zinc-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              )}

              {/* Empty State */}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                        <PackageSearch size={24} />
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900">
                        Không tìm thấy sản phẩm
                      </h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Không có kết quả nào phù hợp với từ khóa hoặc bộ lọc đã chọn. Vui lòng thử lại.
                      </p>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                        >
                          Xóa từ khóa tìm kiếm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!loading && filteredProducts.length > 0 && (
                filteredProducts.map((p) => {
                  const hasOcrTag =
                    p.tags?.includes('OCR_SCAN') ||
                    p.tags?.includes('OCR_EXTRACTED') ||
                    p.tags?.includes('PRODUCT_LABEL') ||
                    (p.attributes as { source?: string })?.source === 'OCR';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* SKU (Mono) */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-zinc-900">
                        {p.sku}
                      </td>

                      {/* Name & Thumb (Sans) */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          {p.images && p.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded border border-zinc-200 shrink-0 bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 border border-dashed border-zinc-300 bg-zinc-50 rounded shrink-0 flex items-center justify-center text-[10px] font-mono text-zinc-400">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-zinc-900 line-clamp-1 group-hover:text-orange-600 transition-colors text-xs sm:text-sm">
                              {p.name}
                            </span>
                            {hasOcrTag && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 rounded px-1.5 py-0.2 text-[10px] font-semibold mt-1">
                                <Sparkles size={10} className="text-amber-600" /> AI OCR
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs font-medium text-zinc-600">
                        {getCategoryName(p.category_id)}
                      </td>

                      {/* Price (Mono) */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs sm:text-sm">
                        {p.discount_price !== undefined &&
                        p.discount_price !== null &&
                        Number(p.discount_price) > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-orange-600 font-extrabold">
                              {Number(p.discount_price).toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-zinc-400 text-[11px] line-through font-normal">
                              {Number(p.base_price).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-900">
                            {Number(p.base_price).toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-zinc-800">
                        {p.stock_quantity}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(p.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="p-1.5 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 transition-all shadow-xs cursor-pointer"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(p.id)}
                            className="p-1.5 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition-all shadow-xs cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
