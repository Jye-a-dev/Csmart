'use client';

import { useState } from 'react';
import { useLandingConfig } from '@/hooks';
import { LandingConfig, LandingTrustBadge, DEFAULT_LANDING_CONFIG } from '@/types/landing';
import {
  LandingHeader,
  AnnouncementSection,
  HeroBannerSection,
  TrustBadgesSection,
  LandingFooterBar,
} from './_components';

export default function LandingPageAdmin() {
  const { config: storedConfig, saveConfig, resetConfig } = useLandingConfig();
  const [form, setForm] = useState<LandingConfig>(storedConfig);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    const success = await saveConfig(form);
    if (success) {
      showToast('Đã lưu và đồng bộ Landing Page thành công!');
    } else {
      showToast('Lỗi khi lưu cấu hình', 'err');
    }
  };

  const handleReset = async () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục Landing Page về cài đặt ban đầu?')) {
      await resetConfig();
      setForm(DEFAULT_LANDING_CONFIG);
      showToast('Đã khôi phục cài đặt mặc định!');
    }
  };

  const updateAnnouncement = (field: keyof LandingConfig['announcement'], val: string) => {
    setForm((prev) => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        [field]: val,
      },
    }));
  };

  const updateHero = (field: keyof LandingConfig['hero'], val: string) => {
    setForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: val,
      },
    }));
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh quá lớn (> 5MB). Vui lòng chọn ảnh nhỏ hơn.', 'err');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateHero('imageUrl', base64);
        showToast('Đã tải ảnh lên từ thiết bị!', 'ok');
      }
    };
    reader.readAsDataURL(file);
  };

  const updateBadge = (index: number, field: keyof LandingTrustBadge, val: string) => {
    setForm((prev) => {
      const nextBadges = [...prev.trustBadges];
      nextBadges[index] = {
        ...nextBadges[index],
        [field]: val,
      };
      return {
        ...prev,
        trustBadges: nextBadges,
      };
    });
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl pb-16">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${
            toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header Bar */}
      <LandingHeader onReset={handleReset} onSave={handleSave} />

      {/* 01. Announcement Section */}
      <AnnouncementSection
        announcement={form.announcement}
        onChange={updateAnnouncement}
      />

      {/* 02. Hero Banner Section */}
      <HeroBannerSection
        hero={form.hero}
        onChange={updateHero}
        onFileUpload={handleHeroFileUpload}
      />

      {/* 03. Trust Badges Section */}
      <TrustBadgesSection
        trustBadges={form.trustBadges}
        onChange={updateBadge}
      />

      {/* Floating Bottom Action Bar */}
      <LandingFooterBar onReset={handleReset} onSave={handleSave} />
    </div>
  );
}
