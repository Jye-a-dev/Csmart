'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Sparkles,
  ChevronRight,
  Shirt,
  Smartphone,
  Home,
  Laptop,
  Headphones,
  Package,
  FolderTree,
  ArrowRight,
  Check,
  X,
  Filter,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useCategories, useProducts } from '@/hooks';
import type { Category } from '@/types/entities/category';
import type { Product } from '@/types/entities/product';
import FeaturedProductsSection from '../MainPage/sections/FeaturedProductsSection';
import SupportFloatingWidget from '../MainPage/sections/SupportFloatingWidget';
import SupportAgentConsoleModal from '../MainPage/sections/SupportAgentConsoleModal';

function getCategoryIcon(slug?: string, name?: string): ElementType {
  const text = `${slug || ''} ${name || ''}`.toLowerCase();
  if (text.includes('thoai') || text.includes('phone') || text.includes('smart')) return Smartphone;
  if (text.includes('laptop') || text.includes('macbook') || text.includes('may-tinh')) return Laptop;
  if (text.includes('phu-kien') || text.includes('tai-nghe') || text.includes('audio')) return Headphones;
  if (text.includes('thoi-trang') || text.includes('ao') || text.includes('quan')) return Shirt;
  if (text.includes('gia-dung') || text.includes('nha-cua') || text.includes('bep')) return Home;
  if (text.includes('my-pham') || text.includes('sac-dep') || text.includes('skin')) return Sparkles;
  return Package;
}

export default function UserCategoriesPage() {
  const { findAllCategories, loading: loadingCategories } = useCategories();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('ALL');
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSupportConsoleOpen, setIsSupportConsoleOpen] = useState(false);

  // Load all categories on mount
  useEffect(() => {
    let isMounted = true;
    findAllCategories({ limit: 100 })
      .then((data) => {
        if (isMounted && data) {
          setCategories(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [findAllCategories]);

  // Toast helper
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

  // Group top-level parent categories vs sub-categories
  const parentCategories = useMemo(() => {
    return categories.filter((cat) => !cat.parent_id);
  }, [categories]);

  // Sub-categories lookup map
  const subCategoriesMap = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories.forEach((cat) => {
      if (cat.parent_id) {
        const list = map.get(cat.parent_id) || [];
        list.push(cat);
        map.set(cat.parent_id, list);
      }
    });
    return map;
  }, [categories]);

  // Filtered categories according to parent filter & search term
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        categorySearch === '' ||
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(categorySearch.toLowerCase()));

      const matchesParent =
        selectedParentId === 'ALL' ||
        cat.id === selectedParentId ||
        cat.parent_id === selectedParentId;

      return matchesSearch && matchesParent;
    });
  }, [categories, categorySearch, selectedParentId]);

  const selectedCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  const handleSelectCategory = (catId: string) => {
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(catId);
      const el = document.getElementById('category-products-storefront');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50/50 pb-20 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-zinc-700">
            <Check size={16} className="text-emerald-400 stroke-3" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. HERO BREADCRUMB & HEADER BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-4 font-medium">
            <Link href="/user" className="hover:text-orange-600 transition-colors">
              Trang Chủ
            </Link>
            <ChevronRight size={14} className="text-zinc-400" />
            <span className="text-zinc-900 font-bold">Danh Mục Ngành Hàng</span>
          </nav>

          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-orange-600 via-amber-600 to-orange-500 p-6 sm:p-10 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
                <FolderTree size={14} />
                <span>CSMART PRODUCT TAXONOMY</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Danh Mục Ngành Hàng Toàn Diện
              </h1>
              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
                Khám phá toàn bộ danh mục sản phẩm chính hãng, phân nhóm theo nhu cầu mua sắm và tìm kiếm nhanh chóng cùng Trợ lý CSMART.
              </p>

              {/* Quick Search Bar inside Hero */}
              <div className="pt-2 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Tìm kiếm danh mục (vd: Áo sơ mi, Điện thoại, Tai nghe...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Background Aesthetic Blur */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 2. PARENT CATEGORY FILTER TABS */}
      <section className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedParentId('ALL')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedParentId === 'ALL'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              Tất Cả Ngành Hàng ({categories.length})
            </button>

            {parentCategories.map((pCat) => {
              const Icon = getCategoryIcon(pCat.slug, pCat.name);
              const isSelected = selectedParentId === pCat.id;
              const subCount = subCategoriesMap.get(pCat.id)?.length || 0;

              return (
                <button
                  key={pCat.id}
                  type="button"
                  onClick={() => setSelectedParentId(pCat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-white' : 'text-orange-500'} />
                  <span>{pCat.name}</span>
                  {subCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {subCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES CARDS GRID */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Layers size={18} className="text-orange-500" />
              <span>Khám Phá Theo Danh Mục ({filteredCategories.length})</span>
            </h2>
            {selectedCategoryId && (
              <button
                type="button"
                onClick={() => setSelectedCategoryId(null)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <X size={14} /> Xóa chọn danh mục
              </button>
            )}
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-white border border-zinc-200 p-5 animate-pulse" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-3xl bg-white border border-dashed border-zinc-300">
              <Package className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-700">Không tìm thấy danh mục phù hợp</p>
              <p className="text-xs text-zinc-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug, cat.name);
                const isSelected = selectedCategoryId === cat.id;
                const subCats = subCategoriesMap.get(cat.id) || [];

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`group bg-white rounded-3xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg bg-orange-50/20'
                        : 'border-zinc-200/90 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isSelected
                              ? 'bg-orange-600 text-white shadow-sm'
                              : 'bg-orange-50 text-orange-600'
                          }`}
                        >
                          <Icon size={22} className="stroke-[1.75]" />
                        </div>

                        {cat.parent_id && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 uppercase">
                            Danh mục phụ
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-black transition-colors ${
                          isSelected ? 'text-orange-600' : 'text-zinc-900 group-hover:text-orange-600'
                        }`}
                      >
                        {cat.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description || 'Sản phẩm chính hãng với nhiều ưu đãi và giảm giá đặc quyền.'}
                      </p>

                      {/* Sub-categories Pills */}
                      {subCats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {subCats.slice(0, 3).map((sub) => (
                            <span
                              key={sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCategory(sub.id);
                              }}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-orange-100 text-zinc-600 hover:text-orange-700 transition-colors"
                            >
                              {sub.name}
                            </span>
                          ))}
                          {subCats.length > 3 && (
                            <span className="text-[10px] font-bold text-zinc-400 self-center">
                              +{subCats.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold">
                      <span className={isSelected ? 'text-orange-600' : 'text-zinc-500 group-hover:text-orange-600'}>
                        {isSelected ? 'Đang lọc sản phẩm' : 'Xem sản phẩm'}
                      </span>
                      <ArrowRight
                        size={14}
                        className={`transition-transform group-hover:translate-x-1 ${
                          isSelected ? 'text-orange-600' : 'text-zinc-400 group-hover:text-orange-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. DEDICATED STOREFRONT PRODUCT LIST FOR CHOSEN CATEGORY */}
      <section id="category-products-storefront" className="scroll-mt-6">
        {selectedCategoryObj && (
          <div className="px-4 sm:px-6 lg:px-8 py-2">
            <div className="mx-auto max-w-7xl">
              <div className="p-4 rounded-2xl bg-orange-100/70 border border-orange-300 flex items-center justify-between gap-3 text-orange-900">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Filter size={15} className="text-orange-600" />
                  <span>
                    Đang hiển thị sản phẩm thuộc danh mục:{' '}
                    <strong className="text-orange-700 font-extrabold text-sm">
                      {selectedCategoryObj.name}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="px-3 py-1 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs shadow-2xs cursor-pointer"
                >
                  Xem Tất Cả Sản Phẩm
                </button>
              </div>
            </div>
          </div>
        )}

        <FeaturedProductsSection
          selectedCategoryId={selectedCategoryId}
          onAddToCart={handleAddToCart}
          onClearFilters={() => setSelectedCategoryId(null)}
        />
      </section>

      {/* 5. SUPPORT WIDGET & CONSOLE */}
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
