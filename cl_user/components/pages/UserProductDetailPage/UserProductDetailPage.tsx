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

function formatPrice(val?: number | string | null): string {
  if (val === undefined || val === null || val === '') return '0đ';
  const num = typeof val === 'string' ? parseFloat(val) : Number(val);
  if (isNaN(num)) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + 'đ';
}

function parseProductDescription(desc?: string) {
  if (!desc) return null;
  const hasHtml = /<[a-z][\s\S]*>/i.test(desc) || desc.includes('&nbsp;');
  const isOcr =
    desc.includes('Sản phẩm quét tự động từ nhãn OCR') ||
    desc.includes('quét tự động từ nhãn') ||
    desc.includes('Chi tiết nhãn') ||
    desc.includes('Chi tiết:');

  // Convert HTML elements and entities to line breaks
  let text = desc
    .replace(/&nbsp;/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/gi, '');

  text = text
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  // Normalize multiple dashes e.g. "- - " -> "- "
  text = text.replace(/-\s*-\s+/g, '- ');

  // Split intro header if stuck to "- Tên:"
  text = text.replace(/:\s*-\s+/g, ':\n- ');

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return { isOcr, hasHtml, lines };
}

function getSpecificationsList(prod: Product) {
  if (prod.specifications && prod.specifications.trim().length > 0) {
    const cleanSpecs = prod.specifications
      .replace(/<[^>]+>/gi, '')
      .replace(/&nbsp;/gi, ' ');
    return cleanSpecs
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(':');
        return {
          label: parts[0]?.trim() || 'Thông số',
          value: parts.slice(1).join(':').trim(),
        };
      });
  }

  // Derive specifications dynamically from attributes and OCR data
  const items: { label: string; value: string }[] = [];
  const attrs = (prod.attributes as Record<string, unknown>) || {};
  const cleanDesc = (prod.description || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/gi, '\n');

  // Origin
  const originMatch = cleanDesc.match(/(?:Xuất xứ|SẢN XUẤT TẠI):\s*([^\n]+)/i);
  const originVal =
    String(attrs.origin || '') ||
    (originMatch && originMatch[1]?.trim()) ||
    prod.short_description?.split('•')[0]?.replace('Xuất xứ:', '').trim();
  if (originVal) items.push({ label: 'Xuất xứ', value: originVal });

  // Colors
  if (prod.colors && prod.colors.length > 0) {
    items.push({
      label: 'Màu sắc',
      value: prod.colors.map((c) => c.name).join(', '),
    });
  } else {
    const colorMatch = cleanDesc.match(/MÀU SẮC:\s*([^\n\s]+)/i);
    if (colorMatch && colorMatch[1]) {
      items.push({ label: 'Màu sắc', value: colorMatch[1].trim() });
    }
  }

  // SKU
  const skuMatch = cleanDesc.match(/MÃ SP:\s*([^\n\s]+)/i);
  const resolvedSku = prod.sku || (skuMatch && skuMatch[1]?.trim());
  if (resolvedSku) {
    items.push({ label: 'Mã sản phẩm (SKU)', value: resolvedSku });
  }

  // Size
  const sizeMatch = cleanDesc.match(/SIZE:\s*([A-Za-z0-9]+)/i);
  if (sizeMatch && sizeMatch[1]) {
    items.push({ label: 'Kích cỡ (Size)', value: sizeMatch[1].trim() });
  }

  // Material
  const materialMatch = cleanDesc.match(/CHẤT LIỆU:\s*([^\n]+)/i);
  if (materialMatch && materialMatch[1]) {
    items.push({ label: 'Chất liệu', value: materialMatch[1].trim() });
  }

  // Care
  const careMatch = cleanDesc.match(/HƯỚNG DẪN BẢO QUẢN:\s*([^\n]+)/i);
  if (careMatch && careMatch[1]) {
    items.push({ label: 'Bảo quản', value: careMatch[1].trim() });
  }

  if (attrs.ocr_extracted || cleanDesc.includes('nhãn OCR')) {
    items.push({ label: 'Phương thức nhập', value: 'Quét nhãn tự động (OCR AI)' });
  }

  Object.entries(attrs).forEach(([k, v]) => {
    if (['origin', 'ocr_extracted', 'ocr_confidence'].includes(k)) return;
    items.push({ label: k, value: String(v) });
  });

  return items;
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

  const rawBase = Number(product?.base_price) || 0;
  const rawDiscount = product?.discount_price ? Number(product.discount_price) : undefined;
  const currentPrice = rawDiscount && rawDiscount > 0 && rawDiscount < rawBase ? rawDiscount : rawBase;
  const originalPrice = rawDiscount && rawDiscount > 0 && rawDiscount < rawBase ? rawBase : null;
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
                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.colors.map((c: ProductColor) => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-orange-600 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20 shadow-xs font-bold'
                              : 'border-zinc-200 text-zinc-700 hover:border-zinc-300 bg-white'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                            style={{ backgroundColor: c.hex || '#09090B' }}
                          />
                          <span>{c.name}</span>
                          {!c.in_stock && (
                            <span className="text-[10px] text-zinc-400 font-normal">(Hết)</span>
                          )}
                        </button>
                      );
                    })}
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
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <Layers size={18} className="text-orange-600" />
              Mô Tả Chi Tiết Sản Phẩm
            </h2>
            {product.description?.includes('nhãn OCR') && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80 text-[11px] font-bold">
                <Sparkles size={13} className="text-orange-600" />
                OCR Nhãn AI
              </span>
            )}
          </div>

          <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed space-y-3">
            {(() => {
              const parsed = parseProductDescription(product.description);
              if (!parsed || parsed.lines.length === 0) {
                return (
                  <p className="text-zinc-500 italic">
                    {product.short_description || 'Thông tin mô tả đang được cập nhật.'}
                  </p>
                );
              }

              return (
                <div className="space-y-2.5">
                  {parsed.lines.map((line, idx) => {
                    if (line.includes('Sản phẩm quét tự động từ nhãn OCR')) {
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 mb-2 rounded-xl bg-orange-50/80 border border-orange-200/80 font-bold text-xs text-orange-800 shadow-2xs"
                        >
                          <Sparkles size={14} className="text-orange-600 shrink-0" />
                          <span>{line.replace(/[:&]/g, '').trim()}</span>
                        </div>
                      );
                    }

                    const isBullet = line.startsWith('- ') || line.startsWith('• ');
                    const cleanLine = line.replace(/^[-•]\s+/, '').trim();
                    const colonIdx = cleanLine.indexOf(':');

                    if (colonIdx > 0 && !isBullet) {
                      const key = cleanLine.slice(0, colonIdx).trim();
                      const val = cleanLine.slice(colonIdx + 1).trim();

                      if (!val) {
                        return (
                          <div key={idx} className="pt-2 pb-1 text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                            <span>{key}:</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-start justify-between py-2 px-3 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-white hover:bg-zinc-50/60 transition-colors gap-1 sm:gap-4"
                        >
                          <span className="font-bold text-zinc-900 min-w-37.5 shrink-0 flex items-center gap-2 text-xs sm:text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                            {key}:
                          </span>
                          <span className="text-zinc-800 font-medium wrap-break-word text-left sm:text-right flex-1 text-xs sm:text-sm">
                            {val}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="py-1.5 px-3 pl-6 text-xs sm:text-sm font-medium text-zinc-700 bg-zinc-50/60 rounded-lg flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                        <span>{cleanLine}</span>
                      </div>
                    );
                  })}
                </div>
              );

              return (
                <p className="whitespace-pre-line leading-relaxed">
                  {product?.description || product?.short_description || 'Thông tin mô tả đang được cập nhật.'}
                </p>
              );
            })()}
          </div>
        </div>

        {/* Specifications Table */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg font-black text-zinc-900 pb-2 border-b border-zinc-100">
            Thông Số Kỹ Thuật
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-zinc-600">
            {(() => {
              const specs = getSpecificationsList(product);
              if (specs.length === 0) {
                return (
                  <div className="py-2 text-zinc-400 text-xs">Chưa có thông số chi tiết</div>
                );
              }

              return specs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-b-0 gap-2"
                >
                  <span className="font-medium text-zinc-500">{item.label}</span>
                  <span className="font-bold text-zinc-800 text-right">{item.value}</span>
                </div>
              ));
            })()}
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

