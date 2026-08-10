'use client';

import { useState, useEffect } from 'react';
import { Product, ProductStatus, CreateProductDto, UpdateProductDto } from '@/types/entities/product';
import { Category } from '@/types/entities/category';
import { X, RefreshCw } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSubmit: (id?: number, payload?: CreateProductDto | UpdateProductDto) => Promise<void>;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  categories,
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
  const [submitting, setSubmitting] = useState(false);

  // Generate slug based on Vietnamese title
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
          setCategoryId(product.category_id || undefined);
          setBasePrice(product.base_price);
          setDiscountPrice(product.discount_price || undefined);
          setStockQuantity(product.stock_quantity);
          setStatus(product.status);
          setIsPublished(product.is_published);
          setDescription(product.description || '');
        } else {
          setSku('');
          setName('');
          setSlug('');
          setCategoryId(categories[0]?.id || undefined);
          setBasePrice(0);
          setDiscountPrice(undefined);
          setStockQuantity(0);
          setStatus(ProductStatus.IN_STOCK);
          setIsPublished(true);
          setDescription('');
          handleGenerateSku();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [product, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !slug.trim() || basePrice < 0 || stockQuantity < 0) {
      alert('Vui lòng điền đầy đủ các trường thông tin bắt buộc và hợp lệ.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateProductDto = {
        sku,
        name,
        slug,
        category_id: categoryId || undefined,
        description: description || undefined,
        base_price: Number(basePrice),
        discount_price: discountPrice !== undefined && discountPrice !== null ? Number(discountPrice) : undefined,
        stock_quantity: Number(stockQuantity),
        status,
        is_published: isPublished
      };

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
      <div className="bg-white border-4 border-[#09090B] w-full max-w-lg p-6 shadow-[8px_8px_0px_0px_#09090B] relative max-h-[90vh] overflow-y-auto">
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
              <label className="block text-xs font-mono font-bold uppercase mb-1">Danh Mục</label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value || undefined)}
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-xs font-bold focus:outline-none bg-white cursor-pointer"
              >
                <option value="">Không danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
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
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Giá Khuyến Mãi (đ)</label>
              <input
                type="number"
                value={discountPrice !== undefined ? discountPrice : ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                min="0"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white"
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

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Mô tả sản phẩm</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả sản phẩm..."
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none h-20 resize-none bg-white"
            />
          </div>

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
