'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProducts, useCategories, useLandingConfig } from '@/hooks';
import { Product } from '@/types/entities/product';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';
import {
  FolderTree,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Search,
  Package,
  Layers,
} from 'lucide-react';
import {
  CategoryCard,
  CategoryModal,
  ConfirmDeleteModal,
} from './_components';

export default function UnifiedProductsAndCategoriesPage() {
  const {
    loading: productsLoading,
    findAllProducts,
  } = useProducts();

  const {
    loading: categoriesLoading,
    findAllCategories,
    createCategory,
    updateCategory,
    removeCategory,
  } = useCategories();

  const { config: landingConfig, saveConfig: saveLandingConfig } = useLandingConfig();

  // Data lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Category drill-down & Search
  const [categorySearch, setCategorySearch] = useState('');
  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadData = useCallback(async () => {
    try {
      const [catsData, prodsData] = await Promise.all([
        findAllCategories({ limit: 200 }),
        findAllProducts({ limit: 200 }),
      ]);
      setCategories(catsData || []);
      setProducts(prodsData || []);
    } catch (err) {
      console.error('Failed to load products/categories data:', err);
    }
  }, [findAllCategories, findAllProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- Category Handlers ---
  const handleCategorySubmit = async (
    id?: string,
    payload?: CreateCategoryDto | UpdateCategoryDto,
  ) => {
    if (!payload) return;
    if (id) {
      await updateCategory(id, payload as UpdateCategoryDto);
      showToast('Đã cập nhật danh mục!');
    } else {
      await createCategory(payload as CreateCategoryDto);
      showToast('Đã tạo danh mục mới!');
    }
    void loadData();
  };

  const handleCategoryDeleteClick = (id: string) => {
    setDeleteCategoryId(id);
    setIsDeleteCategoryOpen(true);
  };

  const handleConfirmCategoryDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await removeCategory(deleteCategoryId);
      showToast('Đã xóa danh mục thành công!');
      void loadData();
    } catch {
      alert('Không thể xóa danh mục. Có thể còn sản phẩm thuộc danh mục này.');
    } finally {
      setIsDeleteCategoryOpen(false);
      setDeleteCategoryId(null);
    }
  };

  // Landing Page Category Visibility Toggle
  const isCategoryFeatured = (catId: string) => {
    if (!landingConfig.featuredCategoryIds) {
      const top4Ids = categories.slice(0, 4).map((c) => c.id);
      return top4Ids.includes(catId);
    }
    return landingConfig.featuredCategoryIds.includes(catId);
  };

  const handleToggleLanding = (category: Category, nextState: boolean) => {
    const currentFeatured = landingConfig.featuredCategoryIds
      ? [...landingConfig.featuredCategoryIds]
      : categories.slice(0, 4).map((c) => c.id);

    let updatedFeatured: string[];
    if (nextState) {
      updatedFeatured = Array.from(new Set([...currentFeatured, category.id]));
      showToast(`Đã BẬT "${category.name}" ở Landing Page`);
    } else {
      updatedFeatured = currentFeatured.filter((id) => id !== category.id);
      showToast(`Đã TẮT "${category.name}" ở Landing Page`);
    }

    void saveLandingConfig({
      ...landingConfig,
      featuredCategoryIds: updatedFeatured,
    });
  };

  const activeParentCategory = activeParentId
    ? categories.find((c) => c.id === activeParentId)
    : null;

  const filteredCategories = categories.filter((c) => {
    if (categorySearch.trim() !== '') {
      return (
        c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(categorySearch.toLowerCase()))
      );
    }
    if (activeParentId) return c.parent_id === activeParentId;
    return !c.parent_id || String(c.parent_id).trim() === '';
  });

  const overallLoading = productsLoading || categoriesLoading;
  const rootCount = categories.filter((c) => !c.parent_id).length;
  const subCount = categories.filter((c) => c.parent_id).length;
  const landingActiveCount = categories.filter((c) => isCategoryFeatured(c.id)).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] bg-emerald-400 text-[#09090B]">
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
            {activeParentCategory
              ? `Danh mục con: ${activeParentCategory.name}`
              : 'Quản Lý Sản Phẩm & Danh Mục'}
          </h1>
          <p className="text-zinc-500 font-mono text-xs mt-1">
            {activeParentCategory
              ? `Đang xem các danh mục con thuộc nhóm "${activeParentCategory.name}". Nhấn "Xem sản phẩm" để quản lý kho hàng.`
              : 'Cấu trúc cây danh mục và sản phẩm. Nhấn "Xem danh mục con" hoặc "Xem sản phẩm" trên từng thẻ danh mục.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeParentId && (
            <button
              type="button"
              onClick={() => setActiveParentId(null)}
              className="px-4 py-3 border-2 border-[#09090B] bg-white text-[#09090B] font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ArrowLeft size={16} />
              Quay lại danh mục chính
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            className="p-3 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Đồng bộ dữ liệu"
          >
            <RefreshCw size={16} className={overallLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setIsCategoryModalOpen(true);
            }}
            className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-white font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:bg-[#ea580c] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Plus size={16} />
            Thêm Danh Mục
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      {!activeParentId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="border-2 border-[#09090B] bg-white p-4 shadow-[3px_3px_0px_0px_#09090B]">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold">
              <FolderTree size={14} className="text-[#F97316]" />
              <span>Danh mục cha</span>
            </div>
            <div className="text-2xl font-black text-[#09090B] mt-1">{rootCount}</div>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-4 shadow-[3px_3px_0px_0px_#09090B]">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold">
              <Layers size={14} className="text-[#F97316]" />
              <span>Danh mục con</span>
            </div>
            <div className="text-2xl font-black text-[#09090B] mt-1">{subCount}</div>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-4 shadow-[3px_3px_0px_0px_#09090B]">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold">
              <Package size={14} className="text-[#F97316]" />
              <span>Tổng sản phẩm</span>
            </div>
            <div className="text-2xl font-black text-[#09090B] mt-1">{products.length}</div>
          </div>

          <div className="border-2 border-[#09090B] bg-white p-4 shadow-[3px_3px_0px_0px_#09090B]">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold">
              <Sparkles size={14} className="text-[#F97316]" />
              <span>Bật Landing Page</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{landingActiveCount}</div>
          </div>
        </div>
      )}

      {/* Landing Status Banner */}
      <div className="p-3.5 bg-white border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Sparkles size={16} className="text-[#F97316]" />
          <span>
            Đang hiển thị <strong className="text-[#F97316] font-black">{landingActiveCount} danh mục</strong> ở mục &ldquo;Danh Mục Phổ Biến&rdquo; trên Landing Page.
          </span>
        </div>
        <a
          href="http://localhost:5100/#categories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono font-bold text-zinc-900 underline hover:text-[#F97316]"
        >
          Xem trên User Landing Page ↗
        </a>
      </div>

      {/* Active Drill-down Breadcrumb */}
      {activeParentCategory && (
        <div className="flex items-center justify-between p-3 border-2 border-[#09090B] bg-[#FAFAFA] font-mono text-xs font-bold text-[#09090B]">
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-[#F97316]" />
            <span>
              ĐANG XEM DANH MỤC CON THUỘC: <strong className="uppercase underline">{activeParentCategory.name}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveParentId(null)}
            className="inline-flex items-center gap-1 text-xs text-rose-600 underline hover:text-rose-800 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Quay lại tất cả danh mục cha
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
              isFeaturedOnLanding={isCategoryFeatured(c.id)}
              onToggleLanding={handleToggleLanding}
              onEdit={(cat: Category) => {
                setSelectedCategory(cat);
                setIsCategoryModalOpen(true);
              }}
              onDelete={handleCategoryDeleteClick}
              onViewChildren={(cat: Category) => setActiveParentId(cat.id)}
            />
          ))}
        </div>
      )}

      {/* MODALS */}

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        categories={categories}
        defaultParentId={activeParentId ?? undefined}
        onSubmit={handleCategorySubmit}
      />

      {/* Category Delete Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteCategoryOpen}
        onClose={() => {
          setIsDeleteCategoryOpen(false);
          setDeleteCategoryId(null);
        }}
        onConfirm={handleConfirmCategoryDelete}
        title="XÁC NHẬN XÓA DANH MỤC"
        message="Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục này sẽ mất phân loại."
      />
    </div>
  );
}
