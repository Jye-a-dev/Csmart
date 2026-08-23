'use client';

import { useState, useEffect } from 'react';
import { Product, ProductStatus, ProductColor, CreateProductDto, UpdateProductDto } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { X, RefreshCw } from 'lucide-react';
import ProductRichTextEditor from './ProductRichTextEditor';
import ProductImagePicker from './ProductImagePicker';
import ProductColorManager from './ProductColorManager';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  onSubmit: (id?: string, payload?: CreateProductDto | UpdateProductDto) => Promise<void>;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  categories,
  defaultCategoryId,
  onSubmit
}: ProductModalProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [status, setStatus] = useState<ProductStatus>(ProductStatus.IN_STOCK);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!product) {
      setSlug(generateSlug(val));
    }
  };

  const handleGenerateSku = () => {
    const code = 'SKU-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setSku(code);
  };



  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (product) {
          setSku(product.sku);
          setName(product.name);
          setSlug(product.slug);
          setCategoryId(product.category_id || defaultCategoryId || undefined);
          setBasePrice(product.base_price);
          setDiscountPrice(product.discount_price || undefined);
          setStockQuantity(product.stock_quantity);
          setStatus(product.status);
          setIsPublished(product.is_published);
          setDescription(product.description || '');
          setShortDescription(product.short_description || '');
          setSpecifications(product.specifications || '');
          setColors(product.colors || []);
          setImages(product.images || []);
        } else {
          setSku('');
          setName('');
          setSlug('');
          setCategoryId(defaultCategoryId || categories[0]?.id || undefined);
          setBasePrice(0);
          setDiscountPrice(undefined);
          setStockQuantity(0);
          setStatus(ProductStatus.IN_STOCK);
          setIsPublished(true);
          setDescription('');
          setShortDescription('');
          setSpecifications('');
          setColors([]);
          setImages([]);
          handleGenerateSku();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [product, isOpen, categories, defaultCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !slug.trim() || basePrice < 0 || stockQuantity < 0) {
      alert('Vui lòng điền đầy đủ các trường thông tin bắt buộc và hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanCategoryId = categoryId !== undefined && categoryId !== null && String(categoryId).trim() !== '' && String(categoryId) !== 'null' && String(categoryId) !== 'undefined' ? String(categoryId) : undefined;
      const payload: CreateProductDto = {
        sku,
        name,
        slug,
        category_id: cleanCategoryId,
        description: description || undefined,
        short_description: shortDescription || undefined,
        specifications: specifications || undefined,
        colors,
        base_price: Number(basePrice),
        discount_price: discountPrice !== undefined && discountPrice !== null ? Number(discountPrice) : undefined,
        stock_quantity: Number(stockQuantity),
        status,
        is_published: isPublished,
        images
      };

      if (!payload.category_id) {
        delete payload.category_id;
      }

      await onSubmit(product?.id, payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi lưu sản phẩm.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09090B]/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-3xl p-6 shadow-[8px_8px_0px_0px_#09090B] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B]"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-extrabold uppercase border-b-2 border-[#09090B] pb-3 mb-6">
          {product ? '📝 Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-xs font-mono font-bold uppercase mb-1">Mã SKU *</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-XXXXXX"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleGenerateSku}
              className="px-3 py-2.5 border-2 border-[#09090B] bg-[#FAFAFA] font-mono text-xs font-bold uppercase hover:bg-zinc-50 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#09090B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <RefreshCw size={12} />
              Ngẫu nhiên
            </button>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Tên Sản Phẩm *</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Nhập tên sản phẩm..."
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Đường dẫn tĩnh (Slug) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ten-san-pham"
              className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                Danh Mục
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value || undefined)}
                disabled={Boolean(defaultCategoryId)}
                className={`w-full px-3 py-2 border-2 border-[#09090B] font-mono text-xs font-bold focus:outline-none ${
                  defaultCategoryId
                    ? 'bg-zinc-100 text-zinc-700 cursor-not-allowed opacity-90'
                    : 'bg-white cursor-pointer'
                }`}
              >
                <option value="">Không danh mục</option>
                {categories.map((c) => {
                  const isParentCategory = categories.some((child) => child.parent_id === c.id);
                  return (
                    <option key={c.id} value={c.id} disabled={isParentCategory}>
                      {c.name} {isParentCategory ? '📁 (Danh mục cha)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Trạng thái bán</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-xs font-bold focus:outline-none bg-white cursor-pointer"
              >
                <option value={ProductStatus.IN_STOCK}>IN_STOCK (CÒN HÀNG)</option>
                <option value={ProductStatus.OUT_OF_STOCK}>OUT_OF_STOCK (HẾT HÀNG)</option>
                <option value={ProductStatus.PRE_ORDER}>PRE_ORDER (ĐẶT TRƯỚC)</option>
                <option value={ProductStatus.DISCONTINUED}>DISCONTINUED (NGỪNG BÁN)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Đơn Giá (đ) *</label>
              <input
                type="text"
                value={basePrice ? basePrice.toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setBasePrice(raw ? Number(raw) : 0);
                }}
                placeholder="100.000"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm font-bold focus:outline-none bg-white text-[#09090B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Giá Khuyến Mãi (đ)</label>
              <input
                type="text"
                value={discountPrice !== undefined && discountPrice !== null && discountPrice !== 0 ? discountPrice.toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setDiscountPrice(raw ? Number(raw) : undefined);
                }}
                placeholder="80.000"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm font-bold focus:outline-none bg-white text-[#09090B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Tồn Kho *</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
                required
              />
            </div>
          </div>

          {/* 🎨 Quản lý Màu sắc sản phẩm */}
          <ProductColorManager colors={colors} onChange={setColors} />

          {/* 📸 Bộ sưu tập hình ảnh sản phẩm */}
          <ProductImagePicker images={images} onChange={setImages} />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-2 border-[#09090B] text-[#F97316] focus:ring-0 cursor-pointer accent-[#F97316]"
            />
            <label htmlFor="published" className="text-xs font-mono font-bold text-[#09090B] uppercase cursor-pointer select-none">
              Hiển thị trên website (Published)
            </label>
          </div>

          {/* 📝 Mô tả ngắn sản phẩm (Text Editor) */}
          <ProductRichTextEditor
            label="📝 Mô tả ngắn sản phẩm (Rich Text Editor)"
            value={shortDescription}
            onChange={setShortDescription}
          />

          {/* ⚙️ Thông số kỹ thuật / Đặc tính sản phẩm (Text Editor) */}
          <ProductRichTextEditor
            label="⚙️ Thông số kỹ thuật / Đặc tính sản phẩm (Rich Text Editor)"
            value={specifications}
            onChange={setSpecifications}
          />

          {/* 📝 Mô tả chi tiết sản phẩm (Text Editor) */}
          <ProductRichTextEditor
            label="📝 Mô tả chi tiết sản phẩm (Rich Text Editor)"
            value={description}
            onChange={setDescription}
          />

          <div className="flex justify-end gap-3 border-t-2 border-[#09090B] pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase hover:bg-zinc-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border-2 border-[#09090B] bg-[#09090B] text-white font-mono text-xs font-bold uppercase hover:bg-zinc-800"
            >
              {product ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
