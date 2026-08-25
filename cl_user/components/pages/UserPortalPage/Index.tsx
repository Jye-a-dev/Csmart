'use client';

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useUsers, useOrders } from '@/hooks';
import CategoriesSection from '../MainPage/sections/CategoriesSection';
import FeaturedProductsSection from '../MainPage/sections/FeaturedProductsSection';
import SupportFloatingWidget from '../MainPage/sections/SupportFloatingWidget';
import SupportAgentConsoleModal from '../MainPage/sections/SupportAgentConsoleModal';
import type { Product } from '@/types/entities/product';
import type { Order } from '@/types/entities/order';
import type { User } from '@/types/entities/user';
import {
  Sparkles,
  ShoppingBag,
  Package,
  Gift,
  Check,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Copy,
  Flame,
  Bot,
  Zap,
} from 'lucide-react';

let _cachedRaw: string | null = null;
let _cachedUser: User | null = null;

function getUserSnapshot(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (raw === _cachedRaw) return _cachedUser;
  _cachedRaw = raw;
  if (!raw) {
    _cachedUser = null;
    return null;
  }
  try {
    _cachedUser = JSON.parse(raw) as User;
  } catch {
    _cachedUser = null;
  }
  return _cachedUser;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

export default function UserPortalPage() {
  const user = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  const { getUserStats } = useUsers();
  const { findAllOrders } = useOrders();

  const [stats, setStats] = useState<{
    points: number;
    total_orders: number;
    total_spent: number;
    membership_tier: string;
  } | null>(null);

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSupportConsoleOpen, setIsSupportConsoleOpen] = useState(false);

  // Fetch user stats & real orders
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    getUserStats(user.id)
      .then((data) => {
        if (isMounted && data) setStats(data);
      })
      .catch(() => {
        if (isMounted) {
          setStats({
            points: 50,
            total_orders: 0,
            total_spent: 0,
            membership_tier: 'THÀNH VIÊN ĐỒNG',
          });
        }
      });

    setLoadingOrders(true);
    findAllOrders({ limit: 3 })
      .then((orders) => {
        if (isMounted && Array.isArray(orders)) {
          setRecentOrders(orders);
        }
      })
      .catch(() => {
        if (isMounted) setRecentOrders([]);
      })
      .finally(() => {
        if (isMounted) setLoadingOrders(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, getUserStats, findAllOrders]);

  // Sync external search events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSearchEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchKeyword(customEvent.detail ?? '');
    };

    window.addEventListener('csmart-search', handleSearchEvent);
    return () => window.removeEventListener('csmart-search', handleSearchEvent);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product | { name: string; discount_price?: number; base_price: number }) => {
      showToast(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
    },
    [showToast]
  );

  const handleClearFilters = useCallback(() => {
    setSearchKeyword('');
    setSelectedCategoryId(null);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('q');
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
      window.dispatchEvent(new CustomEvent('csmart-search', { detail: '' }));
    }
  }, []);

  const handleCopyVoucher = (code: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedVoucher(code);
      showToast(`Đã sao chép mã "${code}"!`);
      setTimeout(() => setCopiedVoucher(null), 2500);
    }
  };

  const currentPoints = stats?.points ?? 50;
  const currentTier = stats?.membership_tier ?? 'THÀNH VIÊN ĐỒNG';
  const totalOrders = stats?.total_orders ?? 0;
  const totalSpent = stats?.total_spent ?? 0;

  const vouchers = [
    { code: 'CSMART50K', title: 'Giảm 50.000đ', desc: 'Đơn từ 300.000đ', tag: 'DÀNH CHO BẠN' },
    { code: 'FREESHIP', title: 'Miễn Phí Vận Chuyển', desc: 'Tối đa 30.000đ cho đơn từ 200k', tag: 'FREESHIP' },
    { code: 'VIP20', title: 'Giảm 20% Tối Đa 100k', desc: 'Dành riêng cho thành viên', tag: 'ƯU ĐÃI VIP' },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50/50 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-zinc-700">
            <Check size={16} className="text-emerald-400 stroke-3" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. HERO WELCOME BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-950 via-zinc-900 to-orange-950 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-zinc-800">
            {/* Background glowing gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Greeting & Status */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-orange-300">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Trung Tâm Trải Nghiệm Khách Hàng CSMART</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Xin chào,{' '}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-amber-300 to-yellow-200">
                    {user?.full_name || 'Khách Hàng CSMART'}
                  </span>{' '}
                  👋
                </h1>

                <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
                  Chào mừng bạn quay lại! Khám phá ngay các gợi ý sản phẩm được cá nhân hóa bằng AI và tận dụng điểm thưởng tích lũy hôm nay.
                </p>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#featured-products"
                    className="px-5 py-2.5 rounded-xl bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-orange-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <ShoppingBag size={15} />
                    <span>Mua Sắm Ngay</span>
                  </a>

                  <a
                    href="#orders"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Package size={15} />
                    <span>Xem Đơn Hàng</span>
                  </a>

                  <a
                    href="#vouchers"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-orange-300 border border-white/15 text-xs font-bold flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Gift size={15} />
                    <span>Kho Voucher (3)</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Real-Time Stats Bento Card */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                {/* Stat 1: Loyalty Points */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Điểm Tích Lũy</span>
                    <Sparkles size={14} className="text-amber-400" />
                  </div>
                  <div className="my-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">
                      {currentPoints.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                      CSMART Points
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp size={11} />
                    <span>+10% đơn tiếp theo</span>
                  </span>
                </div>

                {/* Stat 2: Tier */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Hạng Thành Viên</span>
                    <Flame size={14} className="text-orange-400" />
                  </div>
                  <div className="my-2">
                    <span className="text-base sm:text-lg font-extrabold text-white block truncate">
                      {currentTier}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      Freeship đơn từ 200k
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full w-3/4 rounded-full" />
                  </div>
                </div>

                {/* Stat 3: Total Orders */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Đơn Đã Mua</span>
                    <Package size={14} className="text-orange-400" />
                  </div>
                  <div className="my-2">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
                      {totalOrders}
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                      Đơn hàng
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Giao nhanh 24h</span>
                </div>

                {/* Stat 4: Total Spent */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span>Tổng Chi Tiêu</span>
                    <Zap size={14} className="text-amber-400" />
                  </div>
                  <div className="my-2">
                    <span className="text-lg sm:text-xl font-black text-white font-mono block truncate">
                      {totalSpent.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                      Tích lũy hoàn tiền
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Tích 1% mỗi đơn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VOUCHERS & DEALS SECTION */}
      <section id="vouchers" className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                Kho Voucher Dành Riêng Cho Bạn
              </h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">Tự động áp dụng khi thanh toán</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-600" />
                <div className="space-y-1 pl-1">
                  <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {v.tag}
                  </span>
                  <h3 className="text-sm font-black text-zinc-900">{v.title}</h3>
                  <p className="text-xs text-zinc-500">{v.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyVoucher(v.code)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    copiedVoucher === v.code
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border-orange-200 hover:border-orange-600'
                  }`}
                >
                  {copiedVoucher === v.code ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedVoucher === v.code ? 'Đã lưu' : v.code}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. RECENT ORDERS TRACKER */}
      <section id="orders" className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Package size={16} />
                </div>
                <div>
                  <h2 className="text-base font-black text-zinc-900 tracking-tight">
                    Đơn Hàng Gần Đây Của Bạn
                  </h2>
                  <p className="text-xs text-zinc-500">Cập nhật lộ trình giao hàng trực tiếp</p>
                </div>
              </div>

              <a
                href="#featured-products"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight size={14} />
              </a>
            </div>

            {loadingOrders ? (
              <div className="p-8 text-center text-xs text-zinc-400 animate-pulse">
                Đang tải danh sách đơn hàng...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-200">
                <Package className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-700">Bạn chưa có đơn hàng nào gần đây</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Khám phá danh mục sản phẩm bên dưới để nhận voucher giảm 50.000đ!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-900">
                          #{order.order_code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {order.items?.length || 1} sản phẩm • Tổng thanh toán:{' '}
                        <strong className="text-zinc-900">
                          {Number(order.total_amount).toLocaleString('vi-VN')}₫
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>Dự kiến: 24h</span>
                      </span>
                      <a
                        href="#featured-products"
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold border border-zinc-200 shadow-2xs transition-all"
                      >
                        Mua Lại
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. AI COPILOT INTERACTIVE PROMPT BAR */}
      <section className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-orange-600 to-amber-500 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black">Trợ Lý AI Mua Sắm CSMART Copilot</h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  Bạn cần tìm gì hôm nay? Đặt câu hỏi tự nhiên để nhận gợi ý tức thì.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('áo polo nam cao cấp');
                  window.dispatchEvent(new CustomEvent('csmart-search', { detail: 'áo polo nam cao cấp' }));
                }}
                className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                &ldquo;Áo polo nam cao cấp&rdquo;
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('tai nghe chống ồn');
                  window.dispatchEvent(new CustomEvent('csmart-search', { detail: 'tai nghe chống ồn' }));
                }}
                className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                &ldquo;Tai nghe bluetooth&rdquo;
              </button>

              <a
                href="#featured-products"
                className="px-4 py-1.5 rounded-full bg-white text-orange-600 hover:bg-orange-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Khám phá</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT CATEGORIES */}
      <section id="categories">
        <CategoriesSection
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(catId) => setSelectedCategoryId(catId)}
        />
      </section>

      {/* 6. FEATURED PRODUCTS STOREFRONT */}
      <section id="featured-products">
        <FeaturedProductsSection
          searchKeyword={searchKeyword}
          selectedCategoryId={selectedCategoryId}
          onAddToCart={handleAddToCart}
          onClearFilters={handleClearFilters}
        />
      </section>

      {/* 7. SUPPORT CHAT WIDGET & CSKH CONSOLE */}
      <SupportFloatingWidget
        activeRole="CUSTOMER"
        onOpenSupportConsole={() => setIsSupportConsoleOpen(true)}
      />

      <SupportAgentConsoleModal
        isOpen={isSupportConsoleOpen}
        onClose={() => setIsSupportConsoleOpen(false)}
      />
    </div>
  );
}
