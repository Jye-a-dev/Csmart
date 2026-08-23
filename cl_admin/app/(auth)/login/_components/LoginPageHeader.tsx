'use client';

import { Headphones } from 'lucide-react';

export default function LoginPageHeader() {
  return (
    <header className="w-full bg-white border-b-2 border-[#09090B] px-6 py-4 md:px-12 flex items-center justify-between shadow-[0_2px_0_0_#09090B]">
      <div className="flex items-center gap-3">
        <div className="bg-[#09090B] text-white p-2 border border-[#09090B] font-mono font-black text-sm">
          CS
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-base text-[#09090B] leading-none uppercase">
            CSMART_Admin
          </span>
          <span className="text-[10px] text-zinc-500 font-medium mt-1">
            Hệ thống quản lý bán hàng
          </span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] px-4 py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B]">
        <Headphones size={14} className="text-[#F97316]" />
        HỖ TRỢ: 1900 1234
      </div>
    </header>
  );
}
