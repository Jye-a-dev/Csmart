'use client';

import { ShieldCheck } from 'lucide-react';
import type { LandingTrustBadge } from '@/types/landing';

interface TrustBadgesSectionProps {
  trustBadges: LandingTrustBadge[];
  onChange: (index: number, field: keyof LandingTrustBadge, val: string) => void;
}

export default function TrustBadgesSection({
  trustBadges,
  onChange,
}: TrustBadgesSectionProps) {
  return (
    <section className="bg-white border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] p-6 space-y-6">
      <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-3">
        <ShieldCheck size={18} className="text-[#F97316]" />
        <h2 className="font-mono font-bold text-sm uppercase text-[#09090B]">
          03. Bốn Cam Kết Dịch Vụ (Trust Badges)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trustBadges.map((badge, idx) => (
          <div
            key={badge.id || idx}
            className="p-4 border-2 border-[#09090B] bg-[#FAFAFA] space-y-3"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-700">
              <span>CAM KẾT #{idx + 1}</span>
              <select
                value={badge.icon}
                onChange={(e) => onChange(idx, 'icon', e.target.value)}
                className="bg-white border border-[#09090B] px-2 py-1 text-xs font-mono font-bold outline-none"
              >
                <option value="truck">Icon: Xe Giao Hàng (Truck)</option>
                <option value="shield">Icon: Khiên Chính Hãng (Shield)</option>
                <option value="refresh">Icon: Đổi Trả 30 Ngày (Refresh)</option>
                <option value="headset">Icon: CSKH 24/7 (Headset)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[11px] font-bold text-zinc-600 uppercase">
                Tiêu đề cam kết:
              </label>
              <input
                type="text"
                value={badge.title}
                onChange={(e) => onChange(idx, 'title', e.target.value)}
                className="w-full bg-white border border-[#09090B] px-3 py-1.5 text-xs font-bold text-zinc-900 outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[11px] font-bold text-zinc-600 uppercase">
                Mô tả ngắn:
              </label>
              <input
                type="text"
                value={badge.subtitle}
                onChange={(e) => onChange(idx, 'subtitle', e.target.value)}
                className="w-full bg-white border border-[#09090B] px-3 py-1.5 text-xs text-zinc-600 outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
