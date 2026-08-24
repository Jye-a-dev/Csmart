'use client';

import {
  Sparkles,
  Check,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';
import type { LandingHeroConfig } from '@/types/landing';
import { GRADIENT_PRESETS } from './constants';

interface HeroBannerSectionProps {
  hero: LandingHeroConfig;
  onChange: (field: keyof LandingHeroConfig, val: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HeroBannerSection({
  hero,
  onChange,
  onFileUpload,
}: HeroBannerSectionProps) {
  return (
    <section className="bg-white border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] p-6 space-y-6">
      <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-3">
        <Sparkles size={18} className="text-[#F97316]" />
        <h2 className="font-mono font-bold text-sm uppercase text-[#09090B]">
          02. Banner Quảng Cáo Nổi Bật (Hero Section)
        </h2>
      </div>

      {/* Gradient Presets */}
      <div className="space-y-2">
        <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
          Màu Nền Banner (Gradient Theme):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {GRADIENT_PRESETS.map((preset) => {
            const isSelected = hero.gradientClass === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange('gradientClass', preset.value)}
                className={`p-2.5 border-2 text-left flex flex-col justify-between rounded-none transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#09090B] bg-zinc-100 shadow-[2px_2px_0px_0px_#09090B]'
                    : 'border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <div className={`h-8 w-full ${preset.previewBg} border border-black/20 mb-2`} />
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-800">
                  <span className="truncate">{preset.name}</span>
                  {isSelected && <Check size={13} className="text-[#F97316] shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Tag Huy Hiệu Nhỏ:
          </label>
          <input
            type="text"
            value={hero.pillTag}
            onChange={(e) => onChange('pillTag', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none"
            placeholder="VD: BỘ SƯU TẬP MÙA HÈ 2026"
          />
        </div>

        <div className="md:col-span-8 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Tiêu Đề Chính (Headline):
          </label>
          <input
            type="text"
            value={hero.headline}
            onChange={(e) => onChange('headline', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none font-bold"
            placeholder="VD: Nâng Tầm Phong Cách Sống Mỗi Ngày Cùng CSMART"
          />
        </div>

        <div className="md:col-span-12 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Đoạn Mô Tả Ngắn:
          </label>
          <textarea
            rows={3}
            value={hero.description}
            onChange={(e) => onChange('description', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none"
            placeholder="Mô tả ưu đãi, thông điệp thương hiệu..."
          />
        </div>

        {/* Image Mode & Source Inputs */}
        <div className="md:col-span-12 border-2 border-[#09090B] bg-zinc-50 p-4 space-y-4 shadow-[2px_2px_0px_0px_#09090B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-[#F97316]" />
              <span className="font-mono text-xs font-black uppercase text-[#09090B]">
                Hình Ảnh Banner (Hero Image):
              </span>
            </div>
            {hero.imageUrl && (
              <button
                type="button"
                onClick={() => onChange('imageUrl', '')}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 underline font-mono cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Xóa ảnh</span>
              </button>
            )}
          </div>

          {/* Display Mode Selection */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] font-bold text-zinc-600 uppercase">
              Chế độ hiển thị hình ảnh:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChange('imageMode', 'background')}
                className={`p-3 border-2 text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  (hero.imageMode || 'background') === 'background'
                    ? 'border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B]'
                    : 'border-zinc-200 bg-zinc-100 hover:bg-white'
                }`}
              >
                <div className="p-1.5 bg-orange-100 text-orange-700 border border-orange-300 shrink-0">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-zinc-900">
                    Ảnh Nền Toàn Banner (Background)
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Ảnh phủ toàn bộ banner với lớp màu gradient mờ bảo vệ độ tương phản chữ.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChange('imageMode', 'right-side')}
                className={`p-3 border-2 text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  hero.imageMode === 'right-side'
                    ? 'border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B]'
                    : 'border-zinc-200 bg-zinc-100 hover:bg-white'
                }`}
              >
                <div className="p-1.5 bg-blue-100 text-blue-700 border border-blue-300 shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-zinc-900">
                    Ảnh Nổi Bật Bên Phải (Right-side Showcase)
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Ảnh hiển thị dạng thẻ sản phẩm/người mẫu nổi bật bên cạnh tiêu đề.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Inputs: URL & Local File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            {/* URL Input */}
            <div className="md:col-span-7 space-y-1.5">
              <label className="font-mono text-[11px] font-bold text-zinc-700 uppercase flex items-center gap-1.5">
                <LinkIcon size={13} />
                <span>Cách 1: Nhập link ảnh trực tuyến (Image URL):</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={hero.imageUrl || ''}
                  onChange={(e) => onChange('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-white border-2 border-[#09090B] px-3.5 py-2 font-mono text-xs focus:border-[#F97316] outline-none"
                />
              </div>

              {/* Sample Image Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-zinc-400">Gợi ý mẫu:</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      'imageUrl',
                      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'
                    )
                  }
                  className="text-[10px] font-mono bg-white px-2 py-0.5 border border-zinc-300 hover:border-[#09090B] hover:text-[#F97316] cursor-pointer"
                >
                  Thời trang Lifestyle
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      'imageUrl',
                      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80'
                    )
                  }
                  className="text-[10px] font-mono bg-white px-2 py-0.5 border border-zinc-300 hover:border-[#09090B] hover:text-[#F97316] cursor-pointer"
                >
                  Thiết bị Công nghệ
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      'imageUrl',
                      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
                    )
                  }
                  className="text-[10px] font-mono bg-white px-2 py-0.5 border border-zinc-300 hover:border-[#09090B] hover:text-[#F97316] cursor-pointer"
                >
                  Cửa hàng Hiện đại
                </button>
              </div>
            </div>

            {/* Local File Upload */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="font-mono text-[11px] font-bold text-zinc-700 uppercase flex items-center gap-1.5">
                <Upload size={13} />
                <span>Cách 2: Tải từ máy tính (Local Storage):</span>
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-dashed border-[#09090B] font-mono text-xs font-bold text-zinc-800 hover:bg-orange-50 hover:border-[#F97316] hover:text-[#F97316] transition-all cursor-pointer text-center">
                <Upload size={16} />
                <span>Chọn file ảnh từ thiết bị...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-zinc-500 font-mono">
                Hỗ trợ PNG, JPG, WEBP tối đa 5MB. Ảnh sẽ được chuyển đổi và lưu bền vững.
              </p>
            </div>
          </div>
        </div>

        {/* CTA 1 */}
        <div className="md:col-span-3 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Nút CTA Chính (Text):
          </label>
          <input
            type="text"
            value={hero.primaryCtaText}
            onChange={(e) => onChange('primaryCtaText', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Nút CTA Chính (Link URL):
          </label>
          <input
            type="text"
            value={hero.primaryCtaLink}
            onChange={(e) => onChange('primaryCtaLink', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-mono text-xs focus:bg-white focus:border-[#F97316] outline-none"
          />
        </div>

        {/* CTA 2 */}
        <div className="md:col-span-3 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Nút CTA Phụ (Text):
          </label>
          <input
            type="text"
            value={hero.secondaryCtaText}
            onChange={(e) => onChange('secondaryCtaText', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none"
          />
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Nút CTA Phụ (Link URL):
          </label>
          <input
            type="text"
            value={hero.secondaryCtaLink}
            onChange={(e) => onChange('secondaryCtaLink', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-mono text-xs focus:bg-white focus:border-[#F97316] outline-none"
          />
        </div>
      </div>

      {/* Live Mini Preview Box */}
      <div className="space-y-2 pt-2">
        <label className="font-mono text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
          <span>Xem trước Hero Banner (Live Preview):</span>
        </label>
        <div
          style={{
            backgroundImage:
              hero.imageUrl && (hero.imageMode || 'background') === 'background'
                ? `linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.45)), url(${hero.imageUrl})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className={`relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-linear-to-r ${
            hero.gradientClass || 'from-orange-600 via-orange-500 to-amber-500'
          } text-white shadow-md`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              {hero.pillTag && (
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider border border-white/30 backdrop-blur-xs">
                  {hero.pillTag}
                </span>
              )}
              <h3 className="text-xl sm:text-2xl font-black text-white whitespace-pre-line leading-tight">
                {hero.headline || 'Tiêu Đề Banner...'}
              </h3>
              <p className="text-white/90 text-xs max-w-lg leading-relaxed">
                {hero.description || 'Mô tả banner...'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-4 py-1.5 bg-white text-zinc-900 font-bold text-xs rounded-full shadow-sm">
                  {hero.primaryCtaText || 'Nút 1'}
                </span>
                <span className="px-4 py-1.5 bg-black/20 text-white font-bold text-xs rounded-full border border-white/30">
                  {hero.secondaryCtaText || 'Nút 2'}
                </span>
              </div>
            </div>

            {/* Right-side image preview if in right-side mode */}
            {hero.imageUrl && hero.imageMode === 'right-side' && (
              <div className="lg:col-span-4 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.imageUrl}
                  alt="Hero Preview"
                  className="max-h-44 w-auto object-cover rounded-xl shadow-lg border-2 border-white/40"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
