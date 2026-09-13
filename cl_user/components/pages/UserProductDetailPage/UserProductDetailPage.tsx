'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingCart,
  Check,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Bot,
  Layers,
  ArrowLeft,
  Plus,
  Minus,
} from 'lucide-react';
import { useProducts, useOrders } from '@/hooks';
import { OrderStatus } from '@/types/entities/order';
import type { Product, ProductColor } from '@/types/entities/product';
import SupportFloatingWidget from '../MainPage/sections/SupportFloatingWidget';
import SupportAgentConsoleModal from '../MainPage/sections/SupportAgentConsoleModal';

const FALLBACK_PRODUCTS_CATALOG: Record<string, Partial<Product>> = {
  'prod-polo-bamboo': {
    id: 'prod-polo-bamboo',
    sku: 'FASH-POLO-001',
    name: 'Áo Polo Bamboo Basic Dáng Regular Fit',
    slug: 'ao-polo-bamboo-basic',
    base_price: 399000,
    discount_price: 299000,
    stock_quantity: 150,
    short_description: 'Chất liệu sợi tre Bamboo tự nhiên, kháng khuẩn, thấm hút mồ hôi vượt trội.',
    description: 'Áo polo sợi tre cao cấp với công nghệ dệt Double-Face thoáng mát, giữ form chuẩn suốt ngày dài năng động. Phù hợp cả đi làm, đi chơi hay dự tiệc nhẹ.',
    specifications: 'Chất liệu: 95% Sợi tre (Bamboo), 5% Spandex\nForm dáng: Regular Fit thoải mái\nXuất xứ: Việt Nam\nBảo hành: Đổi trả trong 30 ngày',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  'prod-headphone-anc': {
    id: 'prod-headphone-anc',
    sku: 'ELEC-HEAD-002',
    name: 'Tai Nghe Không Dây NoiseCancel Pro Chống Ồn',
    slug: 'tai-nghe-khong-day-noisecancel-pro',
    base_price: 1190000,
    discount_price: 890000,
    stock_quantity: 45,
    short_description: 'Công nghệ chống ồn chủ động ANC Hybrid, pin 40 giờ liên tục, Bluetooth 5.3.',
    description: 'Trải nghiệm âm thanh vòm chuẩn Hi-Res Audio sống động với màng loa Dynamic 40mm. Đệm tai memory foam êm ái chống bí tai.',
    specifications: 'Kết nối: Bluetooth 5.3 / Jack 3.5mm\nThời lượng pin: 40 giờ (bật ANC)\nCổng sạc: Type-C sạc nhanh 10 phút dùng 4 giờ',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  'prod-airfryer-5l': {
    id: 'prod-airfryer-5l',
    sku: 'APPL-FRYER-003',
    name: 'Nồi Chiên Không Dầu SmartFryer Dung Tích 5.5L',
    slug: 'noi-chien-khong-dau-smartfryer-5-5l',
    base_price: 1550000,
    discount_price: 1250000,
    stock_quantity: 80,
    short_description: 'Công suất 1800W, công nghệ chiên đối lưu Rapid Air giảm 85% lượng dầu mỡ.',
    description: 'Nồi chiên thông minh điều khiển cảm ứng LED, tích hợp 8 chế độ nấu nướng tự động. Lòng nồi chống dính Ceramic an toàn tuyệt đối cho sức khỏe.',
    specifications: 'Dung tích: 5.5 Lít\nCông suất: 1800W\nĐiện áp: 220V/50Hz\nChất liệu lòng nồi: Chống dính Ceramic cao cấp',
    images: [
      'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=800&q=80',
    ],
  },
  'prod-serum-b5': {
    id: 'prod-serum-b5',
    sku: 'BEAU-SERUM-004',
    name: 'Serum Cấp Ẩm Chuyên Sâu Tự Nhiên 50ml',
    slug: 'serum-cap-am-chuyen-sau-50ml',
    base_price: 400000,
    discount_price: 320000,
    stock_quantity: 200,
    short_description: 'Phức hợp Vitamin B5 và Hyaluronic Acid đa tầng, phục hồi hàng rào bảo vệ da.',
    description: 'Serum dưỡng ẩm sâu giúp tái tạo và làm dịu làn da nhạy cảm tức thì. Không cồn, không paraben, an toàn cho mọi loại da.',
    specifications: 'Dung tích: 50ml\nThành phần chính: Panthenol (B5) 5%, HA đa phân tử\nHạn sử dụng: 36 tháng kể từ ngày sản xuất',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    ],
  },
};

function formatPrice(val?: number): string {
  if (!val) return '0 ₫';
  return `${val.toLocaleString('vi-VN')} ₫`;
}

interface UserProductDetailPageProps {
  productId: string;
}

export default function UserProductDetailPage({ productId }: UserProductDetailPageProps) {
  const { findOneProduct, loading } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSupportConsoleOpen, setIsSupportConsoleOpen] = useState(false);

  // Load product detail
  useEffect(() => {
    let isMounted = true;
    const cleanId = decodeURIComponent(productId);

    findOneProduct(cleanId)
      .then((data) => {
        if (isMounted && data) {
          setProduct(data);
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0].name);
          }
        }
      })
      .catch(() => {
        // Fallback to static catalog if backend record matches key or slug
        const fallback =
          FALLBACK_PRODUCTS_CATALOG[cleanId] ||
          Object.values(FALLBACK_PRODUCTS_CATALOG).find(
            (p) => p.slug === cleanId || p.sku === cleanId || p.name?.toLowerCase().includes(cleanId.toLowerCase())
          );

        if (isMounted && fallback) {
          setProduct(fallback as Product);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId, findOneProduct]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const { createOrder } = useOrders();
  const router = useRouter();
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    setSubmittingOrder(true);
    try {
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const parsedUser = userRaw ? JSON.parse(userRaw) : null;
      const orderCode = `ORD-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

      await createOrder({
        order_code: orderCode,
        user_id: parsedUser?.id ? String(parsedUser.id) : undefined,
        status: OrderStatus.PENDING,
        total_amount: currentPrice * quantity,
        shipping_fee: 0,
        discount_amount:
          originalPrice && originalPrice > currentPrice
            ? (originalPrice - currentPrice) * quantity
            : 0,
        shipping_address: 'Địa chỉ nhận hàng mặc định',
        items: [
          {
            product_id: String(product.id),
            product_name: product.name,
            unit_price: currentPrice,
            quantity: quantity,
          },
        ],
      });

      showToast(`Đã tạo đơn hàng #${orderCode}! Đang chuyển hướng...`);
      setTimeout(() => {
        router.push('/user/orders');
      }, 1000);
    } catch {
      showToast('Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const imagesList = useMemo(() => {
    if (product?.images && product.images.length > 0) return product.images;
    return [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ];
  }, [product]);

  const currentPrice = product?.discount_price || product?.base_price || 0;
  const originalPrice = product?.discount_price ? product.base_price : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  if (loading && !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Sparkles size={28} className="animate-spin text-orange-600" />
        <span className="text-sm font-medium">Đang tải thông tin sản phẩm...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-zinc-900">Không tìm thấy sản phẩm</h2>
        <p className="text-zinc-500 text-sm">
          Sản phẩm với mã hoặc tên &quot;{productId}&quot; không tồn tại hoặc đã ngừng kinh doanh.
        </p>
        <div className="pt-2">
          <Link
            href="/user/featured-products"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all"
          >
            <ArrowLeft size={16} />
            <span>Xem sản phẩm nổi bật khác</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <Check size={16} className="shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/user" className="hover:text-orange-600 transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight size={14} className="text-zinc-400" />
        <Link href="/user/featured-products" className="hover:text-orange-600 transition-colors font-medium">
          Sản phẩm
        </Link>
        <ChevronRight size={14} className="text-zinc-400" />
        <span className="text-zinc-900 font-bold truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Product Detail Main Section */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200 flex items-center justify-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagesList[selectedImageIndex] || imagesList[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              {discountPercent && (
                <span className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails Row */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-orange-600 ring-2 ring-orange-600/20 shadow-xs'
                        : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Overview & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* SKU & Category & Stock */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  SKU: {product.sku}
                </span>
                <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                  {product.status === 'IN_STOCK' ? 'Còn Hàng' : 'Đặt Hàng'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl font-black text-zinc-900 leading-tight">
                {product.name}
              </h1>

              {/* Reviews & Ratings */}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={15} className="fill-amber-400" />
                  <span className="font-extrabold text-zinc-900 text-sm">4.9</span>
                </div>
                <span>•</span>
                <span>128 đánh giá</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">Đã bán 520+</span>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-orange-600">
                  {formatPrice(currentPrice)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-zinc-400 line-through font-medium">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Tiết kiệm {formatPrice(originalPrice! - currentPrice)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Color Options if available */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-zinc-800 block">
                    Màu sắc: <span className="text-orange-600 font-extrabold">{selectedColor}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c: ProductColor) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedColor === c.name
                            ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-2xs font-bold'
                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-bold text-zinc-800">Số lượng:</span>
                <div className="flex items-center border border-zinc-200 rounded-xl bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-zinc-900 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & AI Integration */}
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={submittingOrder}
                  className="flex-1 py-3 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart size={17} />
                  )}
                  <span>{submittingOrder ? 'Đang Tạo Đơn...' : 'Thêm Vào Giỏ & Đặt Hàng'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSupportConsoleOpen(true)}
                  className="py-3 px-5 rounded-2xl border border-orange-200 bg-orange-50/80 hover:bg-orange-100 text-orange-700 text-xs sm:text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot size={17} className="text-orange-600" />
                  <span>Hỏi AI Về Sản Phẩm Này</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-zinc-100">
                <div className="flex flex-col items-center gap-1 text-[11px] text-zinc-600">
                  <ShieldCheck size={16} className="text-orange-600" />
                  <span>Chính hãng 100%</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[11px] text-zinc-600">
                  <Truck size={16} className="text-orange-600" />
                  <span>Giao hỏa tốc 2h</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[11px] text-zinc-600">
                  <RotateCcw size={16} className="text-orange-600" />
                  <span>Đổi trả 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detailed Information & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Description */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
            <Layers size={18} className="text-orange-600" />
            Mô Tả Chi Tiết Sản Phẩm
          </h2>
          <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed space-y-3">
            <p>{product.description || product.short_description || 'Thông tin mô tả đang được cập nhật.'}</p>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg font-black text-zinc-900">Thông Số Kỹ Thuật</h2>
          <div className="space-y-2 text-xs sm:text-sm text-zinc-600">
            {product.specifications ? (
              product.specifications.split('\n').map((line, idx) => (
                <div key={idx} className="flex justify-between py-1.5 border-b border-zinc-100 last:border-b-0">
                  <span className="font-medium text-zinc-500">{line.split(':')[0] || 'Thông số'}</span>
                  <span className="font-bold text-zinc-800 text-right">{line.split(':')[1] || ''}</span>
                </div>
              ))
            ) : (
              <div className="py-2 text-zinc-400 text-xs">Chưa có thông số chi tiết</div>
            )}
          </div>
        </div>
      </div>

      {/* Floating 24/7 AI Widget */}
      <SupportFloatingWidget onOpenSupportConsole={() => setIsSupportConsoleOpen(true)} />

      {/* Support Agent Console Modal */}
      <SupportAgentConsoleModal
        isOpen={isSupportConsoleOpen}
        onClose={() => setIsSupportConsoleOpen(false)}
      />
    </div>
  );
}

