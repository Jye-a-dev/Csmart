'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks';
import { Product, CreateProductDto, UpdateProductDto } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { ProductsTable, ProductModal, ConfirmDeleteModal } from '@/app/(dashboard)/products/_components';
import { CategoryProductsHeader } from '../../_components';

export default function CategoryProductsPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = (params?.slug as string) || '';

  const {
    loading: productsLoading,
    createProduct,
    findAllProducts,
    updateProduct,
    removeProduct,
  } = useProducts();

  const {
    loading: categoriesLoading,
    findAllCategories,
  } = useCategories();

  // State
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
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!categorySlug) return;
    try {
      // Find all categories and products
      const [catsData, prodsData] = await Promise.all([
        findAllCategories({ limit: 200 }),
        findAllProducts({ limit: 200 }),
      ]);

      setCategories(catsData || []);
      setProducts(prodsData || []);

      const rawSlug = decodeURIComponent(categorySlug).toLowerCase().trim();
      const cat = catsData?.find((c) => {
        const slug = String(c.slug ?? '').toLowerCase().trim();
        const id = String(c.id ?? '').toLowerCase().trim();
        const name = String(c.name ?? '').toLowerCase().trim();
        return (
          slug === rawSlug ||
          id === rawSlug ||
          name === rawSlug ||
          (slug && slug.includes(rawSlug)) ||
          (rawSlug && rawSlug.includes(slug))
        );
      });

      if (cat) {
        setSelectedCatFilter(String(cat.id));
      } else {
        setSelectedCatFilter(rawSlug);
      }
    } catch (err) {
      console.error('Failed to load category products data', err);
    }
  }, [categorySlug, findAllCategories, findAllProducts]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!ignore) {
        await loadData();
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, [loadData]);

  // Derived current category from loaded categories with resilient fallback
  const rawSlug = decodeURIComponent(categorySlug).toLowerCase().trim();
  const matchedCategory =
    categories.find((c) => {
      const slug = String(c.slug ?? '').toLowerCase().trim();
      const id = String(c.id ?? '').toLowerCase().trim();
      const name = String(c.name ?? '').toLowerCase().trim();
      return (
        slug === rawSlug ||
        id === rawSlug ||
        name === rawSlug ||
        (slug && slug.includes(rawSlug)) ||
        (rawSlug && rawSlug.includes(slug))
      );
    }) || null;

  const currentCategory =
    matchedCategory ||
    (categories.length > 0
      ? {
          id: rawSlug,
          name: rawSlug.toUpperCase(),
          slug: rawSlug,
          description: `Danh mục: ${rawSlug}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : null);

  const handleCategoryFilterChange = (catId: string) => {
    setSelectedCatFilter(catId);
    if (catId && catId !== 'ALL') {
      const targetCat = categories.find((c) => c.id === catId);
      if (targetCat && targetCat.slug !== categorySlug) {
        router.push(`/products/category/${targetCat.slug}`);
      }
    }
  };

  // Product CRUD handlers
  const handleProductSubmit = async (id?: string, payload?: CreateProductDto | UpdateProductDto) => {
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

  const handleProductDeleteClick = (id: string) => {
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
        setSelectedCategory={handleCategoryFilterChange}
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
