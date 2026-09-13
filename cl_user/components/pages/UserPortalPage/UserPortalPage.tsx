'use client';

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useUsers, useOrders } from '@/hooks';
import CategoriesSection from '../MainPage/sections/CategoriesSection';
import FeaturedProductsSection from '../MainPage/sections/FeaturedProductsSection';
import SupportFloatingWidget from '../MainPage/sections/SupportFloatingWidget';
import SupportAgentConsoleModal from '../MainPage/sections/SupportAgentConsoleModal';
import {
  UserPortalHeroBanner,
  UserPortalVouchersSection,
  UserPortalRecentOrdersSection,
  UserPortalCopilotPromptBar,
} from './sections';
import type { Product } from '@/types/entities/product';
import type { Order } from '@/types/entities/order';
import type { User } from '@/types/entities/user';
import { Check } from 'lucide-react';

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

const DEFAULT_VOUCHERS = [
  { code: 'CSMART50K', title: 'Giảm 50.000đ', desc: 'Đơn từ 300.000đ', tag: 'DÀNH CHO BẠN' },
  { code: 'FREESHIP', title: 'Miễn Phí Vận Chuyển', desc: 'Tối đa 30.000đ cho đơn từ 200k', tag: 'FREESHIP' },
  { code: 'VIP20', title: 'Giảm 20% Tối Đa 100k', desc: 'Dành riêng cho thành viên', tag: 'ƯU ĐÃI VIP' },
];

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

  // Fetch user stats & recent orders
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

    void (async () => {
      await Promise.resolve();
      if (!isMounted) return;
      setLoadingOrders(true);
      try {
        const orders = await findAllOrders({ limit: 3 });
        if (isMounted && Array.isArray(orders)) {
          setRecentOrders(orders);
        }
      } catch {
        if (isMounted) setRecentOrders([]);
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    })();

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

  const handleSelectPrompt = (promptText: string) => {
    setSearchKeyword(promptText);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('csmart-search', { detail: promptText }));
    }
  };

  const currentPoints = stats?.points ?? 50;
  const currentTier = stats?.membership_tier ?? 'THÀNH VIÊN ĐỒNG';
  const totalOrders = stats?.total_orders ?? 0;
  const totalSpent = stats?.total_spent ?? 0;

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

      {/* 1. HERO WELCOME BANNER & STATS */}
      <UserPortalHeroBanner
        user={user}
        points={currentPoints}
        tier={currentTier}
        totalOrders={totalOrders}
        totalSpent={totalSpent}
      />

      {/* 2. VOUCHERS & DEALS */}
      <UserPortalVouchersSection
        vouchers={DEFAULT_VOUCHERS}
        copiedVoucher={copiedVoucher}
        onCopyVoucher={handleCopyVoucher}
      />

      {/* 3. RECENT ORDERS TRACKER */}
      <UserPortalRecentOrdersSection
        orders={recentOrders}
        loading={loadingOrders}
      />

      {/* 4. AI COPILOT INTERACTIVE PROMPT BAR */}
      <UserPortalCopilotPromptBar
        onSelectPrompt={handleSelectPrompt}
      />

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
