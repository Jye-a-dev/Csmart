'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks';
import { Product, CreateProductDto, UpdateProductDto, ProductStatus, ProductColor } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import {
  ProductFormHeader,
  BasicInfoSection,
  PricingStockSection,
  DescriptionSection,
  ColorManagerSection,
  AttributesSection,
  TagManagerSection,
  ImageManagerSection,
} from './sections';

interface ProductFormPageProps {
  mode: 'create' | 'edit';
  productId?: string;
}

const EMPTY_FORM: CreateProductDto = {
  sku: '',
  name: '',
  slug: '',
  category_id: undefined,
  description: '',
  short_description: '',
  specifications: '',
  colors: [],
  base_price: 0,
  discount_price: undefined,
  stock_quantity: 0,
  status: ProductStatus.IN_STOCK,
  is_published: false,
  tags: [],
  attributes: {},
  images: [],
};

export default function ProductFormPage({ mode, productId }: ProductFormPageProps) {
  const router = useRouter();
  const { loading: productLoading, findOneProduct, createProduct, updateProduct } = useProducts();
  const { loading: catLoading, findAllCategories } = useCategories();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Attribute editor state
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');

  // Tag input
  const [tagInput, setTagInput] = useState('');

  // Image URL input
  const [imgInput, setImgInput] = useState('');

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const cats = await findAllCategories({ limit: 200 });
      setCategories(cats || []);
      if (mode === 'edit' && productId) {
        const prod: Product = await findOneProduct(productId);
        setForm({
          sku: prod.sku,
          name: prod.name,
          slug: prod.slug,
          category_id: prod.category_id,
          description: prod.description ?? '',
          short_description: prod.short_description ?? '',
          specifications: prod.specifications ?? '',
          colors: prod.colors ?? [],
          base_price: prod.base_price,
          discount_price: prod.discount_price,
          stock_quantity: prod.stock_quantity,
          status: prod.status,
          is_published: prod.is_published,
          tags: prod.tags ?? [],
          attributes: prod.attributes ?? {},
          images: prod.images ?? [],
        });
      }
    } catch {
      showToast('Không thể tải dữ liệu', 'err');
    }
  }, [mode, productId, findOneProduct, findAllCategories]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const set = <K extends keyof CreateProductDto>(key: K, value: CreateProductDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name || !form.slug) {
      showToast('SKU, Tên và Slug là bắt buộc', 'err');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'create') {
        const created = await createProduct(form);
        showToast('Tạo sản phẩm thành công!');
        setTimeout(() => router.push(`/products/${created.id}`), 1000);
      } else if (productId) {
        await updateProduct(productId, form as UpdateProductDto);
        showToast('Đã cập nhật sản phẩm!');
      }
    } catch {
      showToast('Lỗi khi lưu sản phẩm', 'err');
    } finally {
      setSaving(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    set('name', name);
    if (mode === 'create') {
      const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-');
      set('slug', slug);
    }
  };

  // Colors management
  const addColor = () => setForm((prev) => ({ ...prev, colors: [...(prev.colors ?? []), { name: '', hex: '#000000', in_stock: true }] }));
  const updateColor = (i: number, patch: Partial<ProductColor>) =>
    setForm((prev) => ({ ...prev, colors: (prev.colors ?? []).map((c, idx) => idx === i ? { ...c, ...patch } : c) }));
  const removeColor = (i: number) =>
    setForm((prev) => ({ ...prev, colors: (prev.colors ?? []).filter((_, idx) => idx !== i) }));

  // Attribute management
  const addAttr = () => {
    if (!attrKey.trim()) return;
    set('attributes', { ...(form.attributes ?? {}), [attrKey.trim()]: attrVal });
    setAttrKey(''); setAttrVal('');
  };
  const removeAttr = (k: string) => {
    const next = { ...(form.attributes ?? {}) };
    delete next[k];
    set('attributes', next);
  };

  // Tag management
  const addTag = () => {
    if (!tagInput.trim()) return;
    set('tags', [...(form.tags ?? []), tagInput.trim()]);
    setTagInput('');
  };
  const removeTag = (i: number) => set('tags', (form.tags ?? []).filter((_, idx) => idx !== i));

  // Image management
  const addImg = () => {
    if (!imgInput.trim()) return;
    set('images', [...(form.images ?? []), imgInput.trim()]);
    setImgInput('');
  };
  const removeImg = (i: number) => set('images', (form.images ?? []).filter((_, idx) => idx !== i));

  const isLoading = productLoading || catLoading;

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header Section */}
      <ProductFormHeader
        mode={mode}
        productId={productId}
        saving={saving}
        isLoading={isLoading}
      />

      {isLoading && mode === 'edit' ? (
        <div className="text-center py-16 font-mono text-zinc-500 italic">Đang tải dữ liệu sản phẩm...</div>
      ) : (
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <BasicInfoSection
            form={form}
            categories={categories}
            mode={mode}
            set={set}
            onNameChange={handleNameChange}
          />

          {/* Pricing & Stock Section */}
          <PricingStockSection form={form} set={set} />

          {/* Descriptions Section */}
          <DescriptionSection form={form} set={set} />

          {/* Colors Section */}
          <ColorManagerSection
            colors={form.colors ?? []}
            onAddColor={addColor}
            onUpdateColor={updateColor}
            onRemoveColor={removeColor}
          />

          {/* Dynamic Attributes Section */}
          <AttributesSection
            attributes={form.attributes ?? {}}
            attrKey={attrKey}
            attrVal={attrVal}
            setAttrKey={setAttrKey}
            setAttrVal={setAttrVal}
            onAddAttr={addAttr}
            onRemoveAttr={removeAttr}
          />

          {/* Tags Section */}
          <TagManagerSection
            tags={form.tags ?? []}
            tagInput={tagInput}
            setTagInput={setTagInput}
            onAddTag={addTag}
            onRemoveTag={removeTag}
          />

          {/* Images Section */}
          <ImageManagerSection
            images={form.images ?? []}
            imgInput={imgInput}
            setImgInput={setImgInput}
            onAddImg={addImg}
            onRemoveImg={removeImg}
          />
        </form>
      )}
    </div>
  );
}
