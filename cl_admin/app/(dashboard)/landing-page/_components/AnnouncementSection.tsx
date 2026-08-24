'use client';

import { Megaphone } from 'lucide-react';
import type { LandingAnnouncementConfig } from '@/types/landing';

interface AnnouncementSectionProps {
  announcement: LandingAnnouncementConfig;
  onChange: (field: keyof LandingAnnouncementConfig, val: string) => void;
}

export default function AnnouncementSection({
  announcement,
  onChange,
}: AnnouncementSectionProps) {
  return (
    <section className="bg-white border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] p-6 space-y-4">
      <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-3">
        <Megaphone size={18} className="text-[#F97316]" />
        <h2 className="font-mono font-bold text-sm uppercase text-[#09090B]">
          01. Dải Thông Báo Trên Cùng (Top Announcement Bar)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Nội dung thông báo (Freeship / Khuyến mãi):
          </label>
          <input
            type="text"
            value={announcement.message}
            onChange={(e) => onChange('message', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none"
            placeholder="VD: Miễn phí vận chuyển toàn quốc cho đơn hàng từ 499.000đ..."
          />
        </div>

        <div className="md:col-span-3 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Hotline hỗ trợ:
          </label>
          <input
            type="text"
            value={announcement.hotline}
            onChange={(e) => onChange('hotline', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none"
            placeholder="VD: 1900 1000"
          />
        </div>

        <div className="md:col-span-3 space-y-1">
          <label className="font-mono text-xs font-bold text-zinc-700 uppercase">
            Nhãn liên kết trợ giúp:
          </label>
          <input
            type="text"
            value={announcement.faqLinkText}
            onChange={(e) => onChange('faqLinkText', e.target.value)}
            className="w-full bg-[#FAFAFA] border-2 border-[#09090B] px-3.5 py-2 font-sans text-xs focus:bg-white focus:border-[#F97316] outline-none"
            placeholder="VD: Trợ giúp & FAQ"
          />
        </div>
      </div>
    </section>
  );
}
