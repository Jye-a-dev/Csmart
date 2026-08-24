'use client';

import { Sparkles, PhoneCall } from 'lucide-react';
import { useLandingConfig } from '@/hooks';

export default function MarqueeTicker() {
  const { config } = useLandingConfig();
  const { message, hotline, faqLinkText } = config.announcement;

  return (
    <div className="w-full bg-[#18181B] text-zinc-300 text-xs py-2 px-4 sm:px-8 border-b border-zinc-800">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-orange-400 shrink-0" />
          <span>{message}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <a href="#faq" className="hover:text-white transition-colors">
            {faqLinkText || 'Trợ giúp & FAQ'}
          </a>
          <span className="text-zinc-600">|</span>
          <a href={`tel:${hotline.replace(/\s/g, '')}`} className="flex items-center gap-1 hover:text-orange-400 transition-colors">
            <PhoneCall size={12} className="text-orange-400" />
            Hotline: <strong className="text-zinc-200 font-semibold">{hotline}</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
