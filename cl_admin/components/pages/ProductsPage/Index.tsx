'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProducts, useCategories } from '@/hooks';
import { Product } from '@/types/entities/product';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';
import { Plus, RefreshCw, Search, ArrowLeft, FolderTree } from 'lucide-react';
import { CategoryCard, CategoryModal, ConfirmDeleteModal } from './sections';

export default function ProductsPage() {
  const {
    loading: productsLoading,
    findAllProducts
  } = useProducts();

  const {
    loading: categoriesLoading,
    createCategory,
    findAllCategories,
    updateCategory,
    removeCategory
  } = useCategories();

  // Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Parent Navigation State
  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  // Search/Filters State
  const [categorySearch, setCategorySearch] = useState('');

  // Modals Visibility
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Delete Confirm Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const catsData = await findAllCategories({ limit: 100 });
      setCategories(catsData || []);
      const prodsData = await findAllProducts({ limit: 150 });
      setProducts(prodsData || []);
    } catch (err) {
      console.error('Failed to load page data:', err);
    }
  }, [findAllProducts, findAllCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Category CRUD Handlers
  const handleCategorySubmit = async (id?: string, payload?: CreateCategoryDto | UpdateCategoryDto) => {
    if (!payload) return;
    if (id) {
      await updateCategory(id, payload as UpdateCategoryDto);
    } else {
      await createCategory(payload as CreateCategoryDto);
    }
    void loadData();
  };

  const handleCategoryDeleteClick = (id: string) => {
    setDeleteCategoryId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmCategoryDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await removeCategory(deleteCategoryId);
      void loadData();
    } catch (err) {
      console.error(err);
      alert('Không thể xóa danh mục.');
    } finally {
      setDeleteCategoryId(null);
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryOpen(true);
  };

  const handleCategoryCreate = () => {
    setSelectedCategory(null);
    setIsCategoryOpen(true);
  };

  const activeParentCategory = activeParentId
    ? categories.find((c) => c.id === activeParentId)
    : null;

  // Render ONLY root parent categories (or categories without parent), OR subcategories if drill-down active
  const filteredCategories = categories.filter((c) => {
    if (categorySearch.trim() !== '') {
      return (
        c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(categorySearch.toLowerCase()))
      );
    }

    if (activeParentId) {
      return c.parent_id === activeParentId;
    }

    // Default: Only root categories (no parent)
    return !c.parent_id || String(c.parent_id).trim() === '';
  });

  const overallLoading = productsLoading || categoriesLoading;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
            {activeParentCategory ? `Danh mục con: ${activeParentCategory.name}` : 'Quản Lý Danh Mục'}
          </h1>
          <p className="text-zinc-500 font-mono text-xs mt-1">
            {activeParentCategory
              ? `Đang xem các danh mục con thuộc nhóm "${activeParentCategory.name}"`
              : 'Hiển thị các danh mục chính (Danh mục cha). Nhấn "Xem danh mục con" để mở chi tiết.'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {activeParentId && (
            <button
              onClick={() => setActiveParentId(null)}
              className="px-4 py-3 border-2 border-[#09090B] bg-white text-[#09090B] font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ArrowLeft size={16} />
              Quay lại danh mục chính
            </button>
          )}

          <button
            onClick={loadData}
            className="p-3 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Đồng bộ dữ liệu"
          >
            <RefreshCw size={16} className={overallLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleCategoryCreate}
            className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus size={16} />
            Thêm Danh Mục
          </button>
        </div>
      </div>

      {/* Active Sub-category Breadcrumb Banner */}
      {activeParentCategory && (
        <div className="flex items-center justify-between p-3 border-2 border-[#09090B] bg-[#FAFAFA] font-mono text-xs font-bold text-[#09090B]">
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-[#F97316]" />
            <span>ĐANG XEM DANH MỤC CON THUỘC: <strong className="uppercase underline">{activeParentCategory.name}</strong></span>
          </div>
          <button
            onClick={() => setActiveParentId(null)}
            className="text-xs text-rose-600 underline hover:text-rose-800 cursor-pointer"
          >
            Tất cả danh mục cha ➔
          </button>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          placeholder="Tìm theo tên danh mục, slug, mô tả..."
          className="w-full pl-10 pr-4 py-3 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-sm bg-white shadow-[3px_3px_0px_0px_#09090B]"
        />
      </div>

      {/* Category Cards Grid */}
      {overallLoading && filteredCategories.length === 0 ? (
        <div className="text-center font-mono text-zinc-500 py-12 italic">
          Đang tải dữ liệu danh mục...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center font-mono text-zinc-500 py-12 border-4 border-dashed border-[#09090B]/10">
          Chưa có danh mục nào. Tạo danh mục mới để bắt đầu.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              categories={categories}
              products={products}
              onEdit={handleCategoryEdit}
              onDelete={handleCategoryDeleteClick}
              onViewChildren={(cat) => setActiveParentId(cat.id)}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      <CategoryModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        category={selectedCategory}
        categories={categories}
        onSubmit={handleCategorySubmit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteCategoryId(null);
        }}
        onConfirm={handleConfirmCategoryDelete}
        title="XÁC NHẬN XÓA DANH MỤC"
        message="Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục này sẽ mất phân loại."
      />
    </div>
  );
}
