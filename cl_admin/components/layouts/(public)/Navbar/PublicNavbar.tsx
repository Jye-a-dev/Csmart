'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Terminal, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks';
import type { User } from '@/types/entities/user';

// Read user from localStorage — called on every external store change
function getUserSnapshot(): User | null {
  const str = localStorage.getItem('user');
  if (!str) return null;
  try {
    return JSON.parse(str) as User;
  } catch {
    return null;
  }
}

// SSR snapshot: always null (no localStorage on server)
function getServerSnapshot(): null {
  return null;
}

// Subscribe to localStorage changes (cross-tab and same-tab via custom event)
function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

export default function PublicNavbar() {
  const { logout } = useAuth();

  // useSyncExternalStore: no useEffect, no setState, SSR-safe
  const user = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#FAFAFA]/95 backdrop-blur-md border-b-2 border-[#09090B] px-6 py-4 md:px-12">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#09090B] text-[#FAFAFA] p-1.5 border border-[#09090B] transition-transform group-hover:rotate-6">
            <Terminal size={18} />
          </div>
          <span className="font-mono font-extrabold tracking-tighter text-lg uppercase text-[#09090B]">
            CSMART_Admin <span className="text-[#F97316]"></span>
          </span>
        </Link>

        {/* Menu Navigation */}
        <div className="hidden md:flex items-center gap-8 font-mono text-sm font-semibold">
          {user && (
            <Link
              href="/dashboard"
              className="text-[#09090B] hover:text-[#F97316] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#F97316] hover:after:w-full after:transition-all"
            >
              <span className="text-[#F97316] mr-1">00.</span> Bảng điều khiển
            </Link>
          )}
          <a
            href="#core-structure"
            className="text-[#09090B] hover:text-[#F97316] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#F97316] hover:after:w-full after:transition-all"
          >
            <span className="text-[#F97316] mr-1">01.</span> Cấu trúc Core
          </a>
          <a
            href="#ai-flow"
            className="text-[#09090B] hover:text-[#F97316] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#F97316] hover:after:w-full after:transition-all"
          >
            <span className="text-[#F97316] mr-1">02.</span> Luồng AI Engine
          </a>
          <a
            href="#monorepo"
            className="text-[#09090B] hover:text-[#F97316] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#F97316] hover:after:w-full after:transition-all"
          >
            <span className="text-[#F97316] mr-1">03.</span> Monorepo
          </a>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-mono text-xs font-bold text-[#09090B]">{user.full_name}</span>
                <span className="font-mono text-[9px] text-[#F97316] uppercase tracking-wider font-extrabold">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="btn-brutal inline-flex items-center justify-center gap-1.5 bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-4 py-2 uppercase cursor-pointer border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-zinc-100"
              >
                <Terminal size={12} />
                Thoát
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-brutal inline-flex items-center justify-center bg-[#F97316] text-[#09090B] font-mono font-bold text-sm px-5 py-2.5 uppercase tracking-wide cursor-pointer"
            >
              Đăng nhập Console
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
