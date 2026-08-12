'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks';
import { Product, CreateProductDto, UpdateProductDto, ProductStatus, ProductColor } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { Package, Save, ArrowLeft, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface ProductFormPageProps {
  mode: 'create' | 'edit';
  productId?: number;
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.IN_STOCK]: 'Còn hàng',
  [ProductStatus.OUT_OF_STOCK]: 'Hết hàng',
  [ProductStatus.PRE_ORDER]: 'Đặt trước',
  [ProductStatus.DISCONTINUED]: 'Ngừng bán',
};

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

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.push('/products')} className="p-2 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div className="p-2 bg-[#09090B] text-[#F97316]"><Package size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">
              {mode === 'create' ? 'Tạo Sản Phẩm' : 'Chỉnh Sửa Sản Phẩm'}
            </h1>
          </div>
          {mode === 'edit' && productId && (
            <p className="font-mono text-xs text-zinc-500 ml-24">ID: #{productId}</p>
          )}
        </div>
        <button
          form="product-form"
          type="submit"
          disabled={saving || isLoading}
          className="px-6 py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {mode === 'create' ? 'Tạo Sản Phẩm' : 'Lưu Thay Đổi'}
        </button>
      </div>

      {isLoading && mode === 'edit' ? (
        <div className="text-center py-16 font-mono text-zinc-500 italic">Đang tải dữ liệu sản phẩm...</div>
      ) : (
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Thông tin cơ bản</div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">SKU *</label>
                <input value={form.sku} onChange={(e) => set('sku', e.target.value)} required placeholder="SP-001" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Tên sản phẩm *</label>
                <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Áo thun nam Polo..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Slug *</label>
                <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="ao-thun-nam-polo" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-xs focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-zinc-50 text-zinc-600" />
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Danh mục</label>
                <select value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value || undefined)} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white">
                  <option value="">— Không chọn —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Trạng thái</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value as ProductStatus)} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white">
                  {Object.values(ProductStatus).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="is_published" checked={form.is_published ?? false} onChange={(e) => set('is_published', e.target.checked)} className="w-4 h-4 accent-[#F97316] border-2 border-[#09090B]" />
                <label htmlFor="is_published" className="font-mono text-xs font-black text-[#09090B] cursor-pointer">Hiển thị công khai (Publish)</label>
              </div>
            </div>
          </section>

          {/* Pricing & Stock */}
          <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Giá & Kho hàng</div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Giá gốc (₫) *</label>
                <input type="number" min={0} value={form.base_price} onChange={(e) => set('base_price', Number(e.target.value))} required className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Giá khuyến mãi (₫)</label>
                <input type="number" min={0} value={form.discount_price ?? ''} onChange={(e) => set('discount_price', e.target.value ? Number(e.target.value) : undefined)} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Số lượng tồn kho</label>
                <input type="number" min={0} value={form.stock_quantity ?? 0} onChange={(e) => set('stock_quantity', Number(e.target.value))} className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white" />
              </div>
            </div>
          </section>

          {/* Descriptions */}
          <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Mô tả sản phẩm</div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Mô tả ngắn</label>
                <textarea value={form.short_description ?? ''} onChange={(e) => set('short_description', e.target.value)} rows={3} placeholder="Mô tả 1-2 câu hiển thị ngoài danh sách sản phẩm..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white resize-none" />
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Mô tả chi tiết</label>
                <textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={6} placeholder="Mô tả đầy đủ, nội dung HTML được hỗ trợ..." className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white resize-none" />
              </div>
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Thông số kỹ thuật</label>
                <textarea value={form.specifications ?? ''} onChange={(e) => set('specifications', e.target.value)} rows={4} placeholder="Trọng lượng: 200g&#10;Chất liệu: 100% Cotton&#10;Kích thước: S / M / L / XL" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white resize-none" />
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center justify-between">
              <span>Màu sắc ({(form.colors ?? []).length})</span>
              <button type="button" onClick={addColor} className="flex items-center gap-1 text-[#F97316] hover:text-amber-400 cursor-pointer font-mono text-xs">
                <Plus size={13} /> Thêm màu
              </button>
            </div>
            <div className="p-5 space-y-3">
              {(form.colors ?? []).length === 0 ? (
                <p className="font-mono text-xs text-zinc-400 italic">Chưa có màu nào. Nhấn &quot;Thêm màu&quot; để thêm.</p>
              ) : (form.colors ?? []).map((color, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border-2 border-[#09090B]">
                  <input type="color" value={color.hex ?? '#000000'} onChange={(e) => updateColor(i, { hex: e.target.value })} className="w-10 h-10 border-2 border-[#09090B] cursor-pointer p-0.5 bg-white" />
                  <input value={color.name} onChange={(e) => updateColor(i, { name: e.target.value })} placeholder="Tên màu (VD: Đỏ đậm)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
                  <label className="flex items-center gap-1.5 font-mono text-xs cursor-pointer">
                    <input type="checkbox" checked={color.in_stock} onChange={(e) => updateColor(i, { in_stock: e.target.checked })} className="accent-[#F97316]" />
                    Còn hàng
                  </label>
                  <button type="button" onClick={() => removeColor(i)} className="p-1.5 border-2 border-[#09090B] bg-rose-400 text-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Attributes */}
          <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Thuộc tính JSONB ({Object.keys(form.attributes ?? {}).length})</div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="Key (VD: chất liệu)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
                <input value={attrVal} onChange={(e) => setAttrVal(e.target.value)} placeholder="Value (VD: 100% Cotton)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
                <button type="button" onClick={addAttr} className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer">
                  <Plus size={13} />
                </button>
              </div>
              {Object.entries(form.attributes ?? {}).length === 0 ? (
                <p className="font-mono text-xs text-zinc-400 italic">Chưa có thuộc tính nào.</p>
              ) : (
                <div className="space-y-1">
                  {Object.entries(form.attributes ?? {}).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between p-2 border border-zinc-200 bg-zinc-50 font-mono text-xs">
                      <span><strong>{k}:</strong> {String(v)}</span>
                      <button type="button" onClick={() => removeAttr(k)} className="text-rose-500 hover:text-rose-700 cursor-pointer ml-2"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Tags */}
          <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Tags</div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Nhập tag rồi Enter..." className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
                <button type="button" onClick={addTag} className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer"><Plus size={13} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.tags ?? []).map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 border-2 border-[#09090B] bg-zinc-100 font-mono text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => removeTag(i)} className="text-zinc-400 hover:text-rose-600 cursor-pointer"><Trash2 size={10} /></button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase">Hình ảnh ({(form.images ?? []).length})</div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <input value={imgInput} onChange={(e) => setImgInput(e.target.value)} placeholder="URL hình ảnh (https://...)" className="flex-1 border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none" />
                <button type="button" onClick={addImg} className="px-4 py-2 border-2 border-[#09090B] bg-[#F97316] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer"><Plus size={13} /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(form.images ?? []).map((url, i) => (
                  <div key={i} className="relative border-2 border-[#09090B] aspect-square overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f4f4f5" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23a1a1aa" font-size="10">No Image</text></svg>'; }} />
                    <button type="button" onClick={() => removeImg(i)} className="absolute top-1 right-1 p-1 bg-rose-500 text-white border border-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-[#09090B]/70 p-1">
                      <p className="font-mono text-[9px] text-white truncate">{url}</p>
                    </div>
                  </div>
                ))}
              </div>
              {(form.images ?? []).length === 0 && (
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                  <AlertTriangle size={12} /> Chưa có hình ảnh nào.
                </div>
              )}
            </div>
          </section>
        </form>
      )}
    </div>
  );
}
