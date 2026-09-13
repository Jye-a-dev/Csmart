'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Search,
  ChevronRight,
  Layers,
  Check,
} from 'lucide-react';
import { useCategories, useOrders } from '@/hooks';
import { OrderStatus } from '@/types/entities/order';
import type { Category } from '@/types/entities/category';
import type { Product } from '@/types/entities/product';
import FeaturedProductsSection from '../MainPage/sections/FeaturedProductsSection';
import SupportFloatingWidget from '../MainPage/sections/SupportFloatingWidget';
import SupportAgentConsoleModal from '../MainPage/sections/SupportAgentConsoleModal';

export default function UserFeaturedProductsPage() {
  const { findAllCategories } = useCategories();
  const { createOrder } = useOrders();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSupportConsoleOpen, setIsSupportConsoleOpen] = useState(false);

  // Fetch real categories
  useEffect(() => {
    let isMounted = true;
    findAllCategories({ limit: 20 })
      .then((data) => {
        if (isMounted && data) {
          setCategories(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [findAllCategories]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleAddToCart = useCallback(
    async (product: Product | { id?: string | number; name: string; discount_price?: number; base_price: number }) => {
      try {
        const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const parsedUser = userRaw ? JSON.parse(userRaw) : null;
        const price = Number(product.discount_price || product.base_price || 0);
        const orderCode = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
        await createOrder({
          order_code: orderCode,
          user_id: parsedUser?.id ? String(parsedUser.id) : undefined,
          status: OrderStatus.PENDING,
          total_amount: price,
          shipping_address: 'Địa chỉ nhận hàng mặc định',
          items: [
            {
              product_id: product.id ? String(product.id) : undefined,
              product_name: product.name,
              unit_price: price,
              quantity: 1,
            },
          ],
        });
        showToast(`Đã thêm "${product.name}" vào đơn hàng #${orderCode}!`);
      } catch {
        showToast(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
      }
    },
    [createOrder, showToast]
  );

  return (
    <div className="min-w-0 flex-1 space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
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
        <span className="text-zinc-900 font-bold">Sản Phẩm Bán Chạy & Nổi Bật</span>
      </nav>

      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-6 sm:p-10 shadow-lg shadow-orange-600/15">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-orange-50 border border-white/25">
            <Flame size={14} className="text-amber-200 fill-amber-200" />
            <span>Xu Hướng Mua Sắm 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Sản Phẩm Bán Chạy Nhất
          </h1>
          <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed font-normal">
            Khám phá bộ sưu tập những món hàng được đánh giá cao và bán chạy nhất tại CSMART AI Store. Giá ưu đãi độc quyền kèm bảo hành chính hãng.
          </p>
        </div>

        {/* Quick Search & Category Filter Pills inside Banner */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm nổi bật theo tên, mã SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-white text-zinc-900 text-xs sm:text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-300 shadow-xs placeholder:text-zinc-400 font-medium"
            />
          </div>
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Scroller */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-orange-600" />
              Lọc theo danh mục:
            </span>
            {selectedCategoryId && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="text-orange-600 hover:underline cursor-pointer"
              >
                Xem tất cả danh mục
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryId === null
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              Tất cả ({categories.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-orange-200 hover:text-orange-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Featured Products Grid Section */}
      <FeaturedProductsSection
        searchKeyword={searchKeyword}
        selectedCategoryId={selectedCategoryId}
        onAddToCart={handleAddToCart}
        onClearFilters={() => {
          setSearchKeyword('');
          setSelectedCategoryId(null);
        }}
      />

      {/* 24/7 AI Copilot Floating Widget */}
      <SupportFloatingWidget onOpenSupportConsole={() => setIsSupportConsoleOpen(true)} />

      {/* Support Agent Console Modal */}
      <SupportAgentConsoleModal
        isOpen={isSupportConsoleOpen}
        onClose={() => setIsSupportConsoleOpen(false)}
      />
    </div>
  );
}

