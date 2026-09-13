'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shirt, Smartphone, Home, Sparkles, Laptop, Headphones, Package } from 'lucide-react';
import type { ElementType } from 'react';
import { useCategories, useLandingConfig } from '@/hooks';

interface CategoryItem {
  id: string;
  name: string;
  subtitle: string;
  icon: ElementType;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-fashion',
    name: 'Thời Trang & May Mặc',
    subtitle: 'Áo polo, sơ mi, quần tây',
    icon: Shirt,
  },
  {
    id: 'cat-electronics',
    name: 'Thiết Bị Điện Tử',
    subtitle: 'Tai nghe, sạc cáp, phụ kiện',
    icon: Smartphone,
  },
  {
    id: 'cat-appliances',
    name: 'Đồ Dùng Gia Đình',
    subtitle: 'Nồi chiên, ấm đun, máy xay',
    icon: Home,
  },
  {
    id: 'cat-beauty',
    name: 'Mỹ Phẩm & Chăm Sóc',
    subtitle: 'Dưỡng da, son môi, nước hoa',
    icon: Sparkles,
  },
];

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

interface CategoriesSectionProps {
  selectedCategoryId?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
}

export default function CategoriesSection({
  selectedCategoryId,
  onSelectCategory,
}: CategoriesSectionProps) {
  const { config: landingConfig } = useLandingConfig();
  const { findAllCategories } = useCategories();
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    findAllCategories({ limit: 50 })
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          const featuredIds = landingConfig.featuredCategoryIds;
          const filteredData =
            featuredIds !== undefined
              ? data.filter((c) => featuredIds.includes(c.id))
              : data.slice(0, 4);

          const sourceList = filteredData.length > 0 ? filteredData : data.slice(0, 4);

          const mapped = sourceList.map((cat, idx) => ({
            id: cat.id,
            name: cat.name,
            subtitle: cat.description || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].subtitle,
            icon: getCategoryIcon(cat.slug, cat.name),
          }));
          setCategories(mapped);
        }
      })
      .catch(() => {
        // Fallback to default
      });

    return () => {
      isMounted = false;
    };
  }, [findAllCategories, landingConfig.featuredCategoryIds]);

  return (
    <section id="categories" className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Danh Mục Phổ Biến
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Khám phá các ngành hàng nổi bật hôm nay
            </p>
          </div>

          <Link
            href="/user/categories"
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 4).map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : cat.id)}
                className={`group bg-white rounded-2xl border p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                    : 'border-zinc-200 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-50/80 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon size={26} className="stroke-[1.75]" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                  {cat.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
