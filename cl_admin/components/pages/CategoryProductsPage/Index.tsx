'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks';
import { Product, CreateProductDto, UpdateProductDto } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { ProductsTable, ProductModal, ConfirmDeleteModal } from '@/components/pages/ProductsPage/sections';
import { CategoryProductsHeader } from './sections';

interface CategoryProductsPageProps {
  categorySlug: string;
}

export default function CategoryProductsPage({ categorySlug }: CategoryProductsPageProps) {
  const router = useRouter();
  const {
    loading: productsLoading,
    createProduct,
    findAllProducts,
    updateProduct,
    removeProduct
  } = useProducts();

  const {
    loading: categoriesLoading,
    findAllCategories
  } = useCategories();

  // State
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search/Filters State
  const [productSearch, setProductSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');

  // Modals Visibility
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Confirm Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!categorySlug) return;
    try {
      // Find all categories
      const catsData = await findAllCategories({ limit: 100 });
      setCategories(catsData || []);

      // Find current category matching the slug
      const cat = catsData?.find(c => c.slug === categorySlug);
      if (cat) {
        setCurrentCategory(cat);

        // Find all products to filter
        const prodsData = await findAllProducts({ limit: 150 });
        const filteredProds = prodsData?.filter(p => p.category_id === cat.id) || [];
        setProducts(filteredProds);
      }
    } catch (err) {
      console.error('Failed to load category products data:', err);
    }
  }, [categorySlug, findAllCategories, findAllProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Handle category filter dropdown changes
  useEffect(() => {
    if (selectedCatFilter && selectedCatFilter !== 'ALL') {
      const targetCat = categories.find(c => c.id === selectedCatFilter);
      if (targetCat && targetCat.slug !== categorySlug) {
        router.push(`/products/category/${targetCat.slug}`);
      }
    }
  }, [selectedCatFilter, categorySlug, categories, router]);

  // Sync selectedCatFilter dropdown selection with slug prop changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentCat = categories.find(c => c.slug === categorySlug);
      if (currentCat) {
        setSelectedCatFilter(String(currentCat.id));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [categorySlug, categories]);

  // Product CRUD handlers
  const handleProductSubmit = async (id?: number, payload?: CreateProductDto | UpdateProductDto) => {
    if (!payload) return;
    if (id) {
      await updateProduct(id, payload as UpdateProductDto);
    } else {
      if (currentCategory) {
        const createPayload = {
          ...payload,
          category_id: currentCategory.id
        } as CreateProductDto;
        await createProduct(createPayload);
      }
    }
    void loadData();
  };

  const handleProductDeleteClick = (id: number) => {
    setDeleteProductId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmProductDelete = async () => {
    if (!deleteProductId) return;
    try {
      await removeProduct(deleteProductId);
      void loadData();
    } catch (err) {
      console.error(err);
      alert('Không thể xóa sản phẩm. Có thể sản phẩm đang tồn tại trong đơn hàng.');
    } finally {
      setDeleteProductId(null);
    }
  };

  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsProductOpen(true);
  };

  const handleProductCreate = () => {
    setSelectedProduct(null);
    setIsProductOpen(true);
  };

  const overallLoading = productsLoading || categoriesLoading;

  return (
    <div className="space-y-8 font-sans">
      <CategoryProductsHeader
        currentCategoryName={currentCategory ? `SẢN PHẨM: ${currentCategory.name}` : 'ĐANG TẢI...'}
        currentCategoryDescription={currentCategory?.description || 'Danh sách sản phẩm thuộc nhóm này.'}
        overallLoading={overallLoading}
        onLoadData={loadData}
        onProductCreate={handleProductCreate}
      />

      <ProductsTable
        products={products}
        categories={categories}
        loading={overallLoading}
        onEdit={handleProductEdit}
        onDelete={handleProductDeleteClick}
        searchTerm={productSearch}
        setSearchTerm={setProductSearch}
        selectedCategory={selectedCatFilter}
        setSelectedCategory={setSelectedCatFilter}
      />

      {/* Create/Edit Product Modal */}
      <ProductModal
        isOpen={isProductOpen}
        onClose={() => setIsProductOpen(false)}
        product={selectedProduct}
        categories={categories}
        defaultCategoryId={currentCategory?.id}
        onSubmit={handleProductSubmit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteProductId(null);
        }}
        onConfirm={handleConfirmProductDelete}
        title="XÁC NHẬN XÓA SẢN PHẨM"
        message="Bạn có chắc chắn muốn xóa sản phẩm này không? Tất cả dữ liệu liên quan sẽ bị xóa."
      />
    </div>
  );
}
