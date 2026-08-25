'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthHeaderNav() {
  return (
    <div className="flex items-center justify-between">
      {/* Mobile Logo */}
      <Link href="/" className="flex lg:hidden items-center gap-2.5">
        <div className="w-9 h-9 bg-orange-600 text-white flex items-center justify-center font-extrabold text-lg rounded-xl shadow-xs">
          CS
        </div>
        <span className="text-xl font-black text-zinc-900">CSMART</span>
      </Link>

      <div className="hidden lg:block" />

      <Link
        href="/"
        className="text-xs font-bold text-zinc-500 hover:text-orange-600 flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-orange-50 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về trang chủ</span>
      </Link>
    </div>
  );
}
