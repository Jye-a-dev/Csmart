import React from 'react';
import { Bot, ArrowRight } from 'lucide-react';

export interface UserPortalCopilotPromptBarProps {
  onSelectPrompt: (promptText: string) => void;
}

export function UserPortalCopilotPromptBar({
  onSelectPrompt,
}: UserPortalCopilotPromptBarProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-3">
      <div className="mx-auto max-w-7xl">
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-orange-600 to-amber-500 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black">Trợ Lý AI Mua Sắm CSMART Copilot</h3>
              <p className="text-xs text-orange-100 mt-0.5">
                Bạn cần tìm gì hôm nay? Đặt câu hỏi tự nhiên để nhận gợi ý tức thì.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectPrompt('áo polo nam cao cấp')}
              className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              &ldquo;Áo polo nam cao cấp&rdquo;
            </button>

            <button
              type="button"
              onClick={() => onSelectPrompt('tai nghe chống ồn')}
              className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              &ldquo;Tai nghe bluetooth&rdquo;
            </button>

            <a
              href="#featured-products"
              className="px-4 py-1.5 rounded-full bg-white text-orange-600 hover:bg-orange-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Khám phá</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
