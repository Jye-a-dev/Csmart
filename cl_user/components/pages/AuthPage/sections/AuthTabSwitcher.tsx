'use client';

import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthTabSwitcherProps {
  activeTab: 'LOGIN' | 'REGISTER';
}

export default function AuthTabSwitcher({ activeTab }: AuthTabSwitcherProps) {
  return (
    <div className="p-1.5 bg-zinc-200/70 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold text-zinc-500">
      <Link
        href="/login"
        className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
          activeTab === 'LOGIN'
            ? 'bg-white text-orange-600 shadow-md shadow-orange-500/10'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <LogIn className="w-4 h-4" />
        <span>Đăng Nhập</span>
      </Link>
      <Link
        href="/register"
        className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
          activeTab === 'REGISTER'
            ? 'bg-white text-orange-600 shadow-md shadow-orange-500/10'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <UserPlus className="w-4 h-4" />
        <span>Đăng Ký</span>
      </Link>
    </div>
  );
}
