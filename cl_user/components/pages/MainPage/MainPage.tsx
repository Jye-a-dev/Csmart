'use client';

import { useState, useCallback, useEffect } from 'react';
import HeroSection from './sections/HeroSection';
import TrustPropsSection from './sections/TrustPropsSection';
import CategoriesSection from './sections/CategoriesSection';
import FeaturedProductsSection from './sections/FeaturedProductsSection';
import SupportFloatingWidget from './sections/SupportFloatingWidget';
import SupportAgentConsoleModal from './sections/SupportAgentConsoleModal';
import type { Product } from '@/types/entities/product';
import { Check } from 'lucide-react';

export default function MainPage() {
  const [searchKeyword, setSearchKeyword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeRole] = useState<'CUSTOMER' | 'SUPPORT'>('CUSTOMER');
  const [isSupportConsoleOpen, setIsSupportConsoleOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync search keyword from global search events
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

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg border border-zinc-700">
            <Check size={16} className="text-emerald-400 stroke-3" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Hero Section (Lifestyle Banner & CTAs) */}
      <HeroSection
        onSearchChipClick={(keyword) => setSearchKeyword(keyword)}
        onOpenChat={() => {
          // Triggers scrolling or chat open focus
        }}
      />

      {/* 2. Trust Props (4 Commitments) */}
      <TrustPropsSection />

      {/* 3. Categories Section (4 Columns) */}
      <CategoriesSection
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(catId) => setSelectedCategoryId(catId)}
      />

      {/* 4. Featured Products Grid */}
      <FeaturedProductsSection
        searchKeyword={searchKeyword}
        selectedCategoryId={selectedCategoryId}
        onAddToCart={handleAddToCart}
        onClearFilters={handleClearFilters}
      />

      {/* 5. Support Floating Widget (Copilot SSE + Support Tooling) */}
      <SupportFloatingWidget
        activeRole={activeRole}
        onOpenSupportConsole={() => setIsSupportConsoleOpen(true)}
      />

      {/* 6. Support Agent Console Modal (Role: SUPPORT) */}
      <SupportAgentConsoleModal
        isOpen={isSupportConsoleOpen}
        onClose={() => setIsSupportConsoleOpen(false)}
      />
    </div>
  );
}
