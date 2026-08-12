'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProducts, useCategories } from '@/hooks';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';
import { Product } from '@/types/entities/product';
import { FolderTree, Plus, RefreshCw, Search, ArrowLeft } from 'lucide-react';
import { CategoryCard, CategoryModal, ConfirmDeleteModal } from '@/components/pages/ProductsPage/sections';

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

  const activeParent = activeParentId ? categories.find((c) => c.id === activeParentId) : null;

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
      {/* Header */}
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
              : `${rootCount} danh mục cha · ${subCount} danh mục con · ${products.length} sản phẩm`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {activeParentId && (
            <button
              onClick={() => setActiveParentId(null)}
              className="px-4 py-3 border-2 border-[#09090B] bg-white font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Danh mục cha
            </button>
          )}
          <button
            onClick={load}
            className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <RefreshCw size={15} className={overallLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { setSelectedCategory(null); setIsCategoryOpen(true); }}
            className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 text-xs"
          >
            <Plus size={15} /> Thêm Danh Mục
          </button>
        </div>
      </div>

      {/* Breadcrumb Banner */}
      {activeParent && (
        <div className="flex items-center justify-between p-3 border-2 border-[#09090B] bg-[#FAFAFA] font-mono text-xs font-bold">
          <div className="flex items-center gap-2">
            <FolderTree size={14} className="text-[#F97316]" />
            <span>DANH MỤC CON THUỘC: <strong className="uppercase underline">{activeParent.name}</strong></span>
          </div>
          <button onClick={() => setActiveParentId(null)} className="text-rose-600 underline hover:text-rose-800 cursor-pointer text-xs">
            ← Tất cả cha
          </button>
        </div>
      )}

      {/* Stats Bar */}
      {!activeParentId && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Danh mục cha', value: rootCount, color: 'bg-blue-400' },
            { label: 'Danh mục con', value: subCount, color: 'bg-purple-400' },
            { label: 'Sản phẩm', value: products.length, color: 'bg-emerald-400' },
          ].map((s) => (
            <div key={s.label} className="border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] bg-white p-4 flex items-center gap-3">
              <div className={`w-3 h-10 border-2 border-[#09090B] ${s.color}`} />
              <div>
                <div className="font-mono text-xl font-black text-[#09090B]">{s.value}</div>
                <div className="font-mono text-[10px] text-zinc-500 uppercase">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
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
