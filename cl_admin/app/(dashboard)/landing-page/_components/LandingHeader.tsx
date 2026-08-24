'use client';

import { Palette, ExternalLink, RotateCcw, Save } from 'lucide-react';

interface LandingHeaderProps {
  onReset: () => void;
  onSave: () => void;
}

export default function LandingHeader({ onReset, onSave }: LandingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#09090B] pb-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-black text-[#F97316] uppercase tracking-wider mb-1">
          <Palette size={15} />
          <span>QUẢN LÝ GIAO DIỆN KHÁCH HÀNG</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-mono font-black uppercase text-[#09090B] tracking-tight">
          Landing Page CMS
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Tùy biến nội dung dải thông báo, banner hero, cam kết và CTA hiển thị trực tiếp trên trang khách hàng (cl_user).
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
        <a
          href="http://localhost:5100/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#09090B] border-2 border-[#09090B] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#09090B] hover:bg-zinc-50 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all whitespace-nowrap shrink-0"
          title="Mở tab giao diện người dùng"
        >
          <span>Xem Trang User</span>
          <ExternalLink size={13} />
        </a>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-zinc-700 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#09090B] hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer whitespace-nowrap shrink-0"
          title="Khôi phục về mặc định ban đầu"
        >
          <RotateCcw size={13} />
          <span>Khôi Phục</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#F97316] text-white border-2 border-[#09090B] font-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_#09090B] hover:bg-[#ea580c] active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Save size={14} />
          <span>LƯU THAY ĐỔI</span>
        </button>
      </div>
    </div>
  );
}
