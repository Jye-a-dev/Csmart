'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProducts, useCategories } from '@/hooks';
import { Product } from '@/types/entities/product';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/entities/category';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { CategoryCard, CategoryModal } from './sections';

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

  // Search/Filters State
  const [categorySearch, setCategorySearch] = useState('');

  // Modals Visibility
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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

  const handleCategoryDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm thuộc danh mục này sẽ mất phân loại.')) {
      try {
        await removeCategory(id);
        void loadData();
      } catch {
        alert('Không thể xóa danh mục.');
      }
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

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(categorySearch.toLowerCase()) || 
                          c.slug.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          (c.description && c.description.toLowerCase().includes(categorySearch.toLowerCase()));
    return matchesSearch;
  });

  const overallLoading = productsLoading || categoriesLoading;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
            Quản Lý Danh Mục
          </h1>
          <p className="text-zinc-500 font-mono text-xs mt-1">
            Thiết lập danh mục sản phẩm, quản lý phân nhóm danh mục và xem chi tiết sản phẩm liên quan.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="p-3 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center"
            title="Đồng bộ dữ liệu"
          >
            <RefreshCw size={16} className={overallLoading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={handleCategoryCreate}
            className="px-5 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-bold uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            Thêm Danh Mục
          </button>
        </div>
      </div>

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
          Chưa có danh mục sản phẩm nào. Tạo danh mục mới để bắt đầu.
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
              onDelete={handleCategoryDelete}
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
    </div>
  );
}
