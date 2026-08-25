'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Sparkles, Check } from 'lucide-react';
import { useProducts } from '@/hooks';
import { useAuthModal } from '@/contexts/AuthModalContext';
import type { Product } from '@/types/entities/product';

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-polo-bamboo',
    sku: 'FASH-POLO-001',
    name: 'Áo Polo Bamboo Basic Dáng Regular Fit',
    category_name: 'Thời trang nam',
    base_price: 399000,
    discount_price: 299000,
    badge: 'BÁN CHẠY',
    badge_color: 'bg-red-600',
    rating: 4.9,
    reviews_count: 128,
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'prod-headphone-anc',
    sku: 'ELEC-HEAD-002',
    name: 'Tai Nghe Không Dây NoiseCancel Pro Chống Ồn',
    category_name: 'Thiết bị âm thanh',
    base_price: 1190000,
    discount_price: 890000,
    badge: null,
    rating: 4.8,
    reviews_count: 86,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'prod-airfryer-5l',
    sku: 'APPL-FRYER-003',
    name: 'Nồi Chiên Không Dầu SmartFryer Dung Tích 5.5L',
    category_name: 'Đồ gia dụng',
    base_price: 1550000,
    discount_price: 1250000,
    badge: '-30%',
    badge_color: 'bg-orange-600',
    rating: 5.0,
    reviews_count: 210,
    images: [
      'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'prod-serum-b5',
    sku: 'BEAU-SERUM-004',
    name: 'Serum Cấp Ẩm Chuyên Sâu Tự Nhiên 50ml',
    category_name: 'Chăm sóc sắc đẹp',
    base_price: 400000,
    discount_price: 320000,
    badge: null,
    rating: 4.7,
    reviews_count: 64,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

function getProductFallbackImage(name?: string, sku?: string): string {
  const text = `${name || ''} ${sku || ''}`.toLowerCase();
  if (text.includes('iphone') || text.includes('phone') || text.includes('s24')) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('macbook') || text.includes('laptop') || text.includes('dell')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('airpods') || text.includes('tai nghe') || text.includes('headphone')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('sac') || text.includes('anker') || text.includes('charger')) {
    return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('polo') || text.includes('ao') || text.includes('fashion')) {
    return 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('noi chien') || text.includes('fryer') || text.includes('gia dung')) {
    return 'https://images.unsplash.com/photo-1584269600519-112d071b35e6?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('serum') || text.includes('my pham') || text.includes('skin')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
}

interface FeaturedProductsSectionProps {
  searchKeyword?: string;
  selectedCategoryId?: string | null;
  onAddToCart?: (product: Product | (typeof DEFAULT_PRODUCTS)[0]) => void;
  onClearFilters?: () => void;
}

interface HybridSearchApiResponse {
  results?: Product[];
  data?: Product[];
}

export default function FeaturedProductsSection({
  searchKeyword = '',
  selectedCategoryId = null,
  onAddToCart,
  onClearFilters,
}: FeaturedProductsSectionProps) {
  const { loading, findAllProducts, hybridSearch } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROMO'>('ALL');

  useEffect(() => {
    let isMounted = true;

    if (searchKeyword.trim()) {
      hybridSearch(searchKeyword.trim(), 12)
        .then((res: Product[] | HybridSearchApiResponse | unknown) => {
          let list: Product[] = [];
          if (Array.isArray(res)) {
            list = res as Product[];
          } else if (res && typeof res === 'object') {
            const apiRes = res as HybridSearchApiResponse;
            if (Array.isArray(apiRes.results)) list = apiRes.results;
            else if (Array.isArray(apiRes.data)) list = apiRes.data;
          }

          // Fallback matching against default mock list if AI hybrid search returned 0 items
          if (list.length === 0) {
            const kw = searchKeyword.toLowerCase().trim();
            const fallbackFiltered = DEFAULT_PRODUCTS.filter(
              (p) =>
                p.name.toLowerCase().includes(kw) ||
                p.category_name?.toLowerCase().includes(kw) ||
                p.sku.toLowerCase().includes(kw)
            );
            if (isMounted) setProducts(fallbackFiltered as unknown as Product[]);
          } else {
            if (isMounted) setProducts(list);
          }
        })
        .catch(() => {
          const kw = searchKeyword.toLowerCase().trim();
          const fallbackFiltered = DEFAULT_PRODUCTS.filter(
            (p) =>
              p.name.toLowerCase().includes(kw) ||
              p.category_name?.toLowerCase().includes(kw) ||
              p.sku.toLowerCase().includes(kw)
          );
          if (isMounted) setProducts(fallbackFiltered as unknown as Product[]);
        });
    } else {
      findAllProducts({ limit: 12, offset: 0 })
        .then((data) => {
          if (isMounted && Array.isArray(data)) setProducts(data);
          else if (isMounted) setProducts([]);
        })
        .catch(() => {
          if (isMounted) setProducts([]);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [searchKeyword, findAllProducts, hybridSearch]);

  const baseList = products.length > 0 ? products : (searchKeyword.trim() ? [] : DEFAULT_PRODUCTS);

  const filteredProducts = selectedCategoryId
    ? baseList.filter((p) => (p as { category_id?: string }).category_id === selectedCategoryId)
    : activeTab === 'PROMO'
    ? baseList.filter((p) => {
        const disc = Number((p as { discount_price?: number }).discount_price || 0);
        const base = Number(p.base_price || 0);
        return disc > 0 && disc < base;
      })
    : baseList;

  const { requireAuth } = useAuthModal();

  const handleAdd = (item: Product | (typeof DEFAULT_PRODUCTS)[0]) => {
    requireAuth(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: true }));
      if (onAddToCart) onAddToCart(item);

      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [item.id]: false }));
      }, 1500);
    }, `Vui lòng đăng nhập để thêm "${item.name}" vào giỏ hàng`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <section id="featured-products" className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              {searchKeyword.trim()
                ? `Kết Quả Tìm Kiếm Cho: "${searchKeyword}"`
                : 'Sản Phẩm Đang Bán Chạy'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {searchKeyword.trim()
                ? `Tìm thấy ${filteredProducts.length} sản phẩm tương thích`
                : 'Các mặt hàng được khách hàng đánh giá cao nhất'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {searchKeyword.trim() && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              Tất Cả
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PROMO')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'PROMO'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              Khuyến Mãi
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-sm text-zinc-500 flex items-center justify-center gap-2">
            <Sparkles size={16} className="animate-spin text-orange-600" />
            <span>Đang tìm kiếm danh sách sản phẩm...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
            <h3 className="font-bold text-base text-zinc-900">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-zinc-500 text-xs">
              Vui lòng thử tìm với từ khóa khác hoặc bỏ chọn bộ lọc hiện tại.
            </p>
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-orange-700"
              >
                Xem tất cả sản phẩm
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => {
            const isAdded = !!addedIds[product.id];
            const fallbackMeta = DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length];
            const displayRating = (product as { rating?: number }).rating || fallbackMeta.rating || 4.8;
            const displayReviews =
              (product as { reviews_count?: number }).reviews_count || fallbackMeta.reviews_count || (80 + idx * 25);
            
            const rawBase = Number(product.base_price) || fallbackMeta.base_price;
            const rawDiscount = product.discount_price ? Number(product.discount_price) : undefined;
            const price = rawDiscount || rawBase;
            const originalPrice = rawDiscount && rawDiscount < rawBase ? rawBase : null;

            let displayBadge = (product as { badge?: string | null }).badge;
            let displayBadgeColor = 'bg-orange-600';

            if (displayBadge === undefined) {
              if (originalPrice && originalPrice > price) {
                const percent = Math.round(((originalPrice - price) / originalPrice) * 100);
                displayBadge = `-${percent}%`;
                displayBadgeColor = 'bg-orange-600';
              } else if (idx === 0) {
                displayBadge = 'BÁN CHẠY';
                displayBadgeColor = 'bg-red-600';
              } else {
                displayBadge = fallbackMeta.badge;
              }
            }

            const categoryName =
              (product as { category_name?: string }).category_name ||
              (product as { category?: { name?: string } }).category?.name ||
              fallbackMeta.category_name ||
              'Sản phẩm CSMART';

            const displayImage =
              (product.images && product.images[0]) ||
              fallbackMeta.images?.[0] ||
              getProductFallbackImage(product.name, product.sku);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                {/* Top Image Container */}
                <div className="relative h-48 sm:h-52 w-full bg-zinc-100/80 overflow-hidden flex items-center justify-center border-b border-zinc-100">
                  {displayImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-zinc-400 text-xs font-medium">Ảnh Sản Phẩm</span>
                  )}
                  {displayBadge && (
                    <span className={`absolute top-3 left-3 text-white font-bold text-[10px] px-2 py-0.5 rounded-full ${displayBadgeColor} shadow-sm`}>
                      {displayBadge}
                    </span>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Category */}
                    <span className="text-[11px] text-zinc-400 font-medium">
                      {categoryName}
                    </span>

                    {/* Name */}
                    <h3 className="font-bold text-sm text-zinc-900 line-clamp-2 mt-1 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-2">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold text-zinc-800">{displayRating}</span>
                      <span className="text-zinc-400">({displayReviews} đánh giá)</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-base text-orange-600 leading-tight">
                        {formatPrice(price)}
                      </div>
                      {originalPrice && (
                        <div className="text-xs text-zinc-400 line-through">
                          {formatPrice(originalPrice)}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(product)}
                      disabled={isAdded}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-900 hover:bg-orange-600 text-white shadow-sm'
                      }`}
                      title="Thêm vào giỏ hàng"
                    >
                      {isAdded ? (
                        <Check size={16} className="stroke-3" />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
