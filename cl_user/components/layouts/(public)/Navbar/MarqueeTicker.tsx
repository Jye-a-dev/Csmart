'use client';

import { Sparkles, PhoneCall } from 'lucide-react';
import { useLandingConfig } from '@/hooks';

export default function MarqueeTicker() {
  const { config } = useLandingConfig();
  const { message, hotline, faqLinkText } = config.announcement;

  const defaultMsg = message || 'Ưu đãi đặc quyền: Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500k • Đổi trả dễ dàng trong 30 ngày';

  return (
    <div className="w-full bg-zinc-950 text-zinc-300 text-xs py-2 px-4 sm:px-8 border-b border-zinc-900 overflow-hidden select-none">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Continuous Smooth Ticker */}
        <div className="w-full sm:w-2/3 overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee-smooth flex items-center gap-12 text-[12px] font-medium tracking-wide">
            <span className="flex items-center gap-2">
              <Sparkles size={13} className="text-orange-400 shrink-0" />
              <span>{defaultMsg}</span>
            </span>
            <span className="text-zinc-600 font-mono">•</span>
            <span className="flex items-center gap-2">
              <Sparkles size={13} className="text-orange-400 shrink-0" />
              <span>Hỗ trợ tư vấn AI đa kênh 24/7 trực tiếp trên ứng dụng</span>
            </span>
            <span className="text-zinc-600 font-mono">•</span>
            <span className="flex items-center gap-2">
              <Sparkles size={13} className="text-orange-400 shrink-0" />
              <span>{defaultMsg}</span>
            </span>
            <span className="text-zinc-600 font-mono">•</span>
            <span className="flex items-center gap-2">
              <Sparkles size={13} className="text-orange-400 shrink-0" />
              <span>Hỗ trợ tư vấn AI đa kênh 24/7 trực tiếp trên ứng dụng</span>
            </span>
          </div>
        </div>

        {/* Quick Contacts */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 shrink-0">
          <a href="#faq" className="hover:text-zinc-100 transition-colors">
            {faqLinkText || 'Trợ giúp & FAQ'}
          </a>
          <span className="text-zinc-700">|</span>
          <a
            href={`tel:${hotline.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 hover:text-orange-400 transition-colors group"
          >
            <PhoneCall size={12} className="text-orange-400 group-hover:scale-110 transition-transform" />
            <span>Hotline:</span>
            <strong className="text-zinc-200 font-semibold">{hotline}</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
