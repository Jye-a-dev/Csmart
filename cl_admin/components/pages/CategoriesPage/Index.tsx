'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProducts, useCategories } from '@/hooks';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';
import { Product } from '@/types/entities/product';
import { FolderTree, Search } from 'lucide-react';
import { CategoryCard, CategoryModal, ConfirmDeleteModal } from '@/components/pages/ProductsPage/sections';
import {
  CategoriesHeader,
  CategoriesBreadcrumb,
  CategoriesStats,
} from './sections';

export default function CategoriesPage() {
  const { loading: productsLoading, findAllProducts } = useProducts();
  const {
    loading: categoriesLoading,
    createCategory,
    findAllCategories,
    updateCategory,
    removeCategory,
  } = useCategories();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([
        findAllCategories({ limit: 200 }),
        findAllProducts({ limit: 200 }),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (err) {
      console.error('Failed to load categories data:', err);
    }
  }, [findAllCategories, findAllProducts]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const handleSubmit = async (id?: string, payload?: CreateCategoryDto | UpdateCategoryDto) => {
    if (!payload) return;
    if (id) {
      await updateCategory(id, payload as UpdateCategoryDto);
    } else {
      await createCategory(payload as CreateCategoryDto);
    }
    void load();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteCategoryId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await removeCategory(deleteCategoryId);
      void load();
    } catch {
      alert('Không thể xóa danh mục. Có thể còn sản phẩm thuộc danh mục này.');
    } finally {
      setDeleteCategoryId(null);
    }
  };

  const activeParent = activeParentId ? (categories.find((c) => c.id === activeParentId) ?? null) : null;

  const filtered = categories.filter((c) => {
    if (search.trim()) {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      );
    }
    if (activeParentId) return c.parent_id === activeParentId;
    return !c.parent_id || String(c.parent_id).trim() === '';
  });

  const overallLoading = productsLoading || categoriesLoading;
  const rootCount = categories.filter((c) => !c.parent_id).length;
  const subCount = categories.filter((c) => c.parent_id).length;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <CategoriesHeader
        activeParent={activeParent}
        rootCount={rootCount}
        subCount={subCount}
        productsCount={products.length}
        overallLoading={overallLoading}
        onBackToParent={() => setActiveParentId(null)}
        onRefresh={load}
        onOpenCreate={() => { setSelectedCategory(null); setIsCategoryOpen(true); }}
      />

      {/* Breadcrumb Section */}
      <CategoriesBreadcrumb
        activeParent={activeParent}
        onClearParent={() => setActiveParentId(null)}
      />

      {/* Stats Bar Section */}
      {!activeParentId && (
        <CategoriesStats
          rootCount={rootCount}
          subCount={subCount}
          productsCount={products.length}
        />
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
          <Search size={15} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, slug, mô tả..."
          className="w-full pl-10 pr-4 py-3 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white shadow-[3px_3px_0px_0px_#09090B]"
        />
      </div>

      {/* Grid */}
      {overallLoading && filtered.length === 0 ? (
        <div className="text-center font-mono text-zinc-500 py-16 italic">Đang tải danh mục...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-[#09090B]/15">
          <FolderTree size={40} className="mx-auto mb-3 text-zinc-300" />
          <p className="font-mono text-zinc-500 font-bold">Chưa có danh mục nào. Tạo danh mục đầu tiên!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              categories={categories}
              products={products}
              onEdit={(cat) => { setSelectedCategory(cat); setIsCategoryOpen(true); }}
              onDelete={handleDeleteClick}
              onViewChildren={(cat) => setActiveParentId(cat.id)}
            />
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        category={selectedCategory}
        categories={categories}
        defaultParentId={activeParentId ?? undefined}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteCategoryId(null); }}
        onConfirm={handleConfirmDelete}
        title="XÁC NHẬN XÓA DANH MỤC"
        message="Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục này sẽ mất phân loại."
      />
    </div>
  );
}
