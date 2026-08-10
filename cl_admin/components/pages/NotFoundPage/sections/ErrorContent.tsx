'use client';

import { Terminal } from 'lucide-react';

export default function ErrorContent() {
  return (
    <>
      {/* Large floating 404 text */}
      <div className="relative mb-6 select-none animate-float">
        <h1 className="text-8xl md:text-9xl font-black font-mono tracking-tighter text-[#09090B] drop-shadow-[4px_4px_0px_#F97316] uppercase">
          404
        </h1>
      </div>

      {/* Error Code Badge */}
      <div className="inline-block">
        <span className="font-mono text-xs font-black bg-[#F97316]/10 text-[#F97316] px-3.5 py-1.5 border-2 border-[#F97316] uppercase tracking-wider shadow-[2px_2px_0px_0px_#F97316]">
          LỖI: TÀI NGUYÊN KHÔNG TÌM THẤY
        </span>
      </div>

      {/* Content Heading */}
      <h2 className="text-2xl font-black text-[#09090B] uppercase tracking-tight mt-8 mb-3 font-mono">
        Trang Không Tồn Tại
      </h2>

      {/* Informative description */}
      <p className="text-xs md:text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto mb-10 font-sans">
        Đường dẫn hoặc tài nguyên bạn đang cố gắng truy cập không tồn tại, đã bị gỡ bỏ, hoặc bị di chuyển sang vị trí khác trong hệ thống CSMART.
      </p>
    </>
  );
}

export function ErrorFooter() {
  return (
    <div className="mt-8 pt-4 border-t-2 border-[#09090B]/5 flex items-center justify-center gap-1.5 text-zinc-400 font-mono text-[9px] uppercase font-black">
      <Terminal size={10} />
      <span>system_status_code: 404_not_found</span>
    </div>
  );
}
