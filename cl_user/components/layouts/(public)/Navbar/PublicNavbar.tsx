'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import {
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '@/hooks';
import { useAuthModal } from '@/contexts/AuthModalContext';
import type { User } from '@/types/entities/user';

// Stable user cache for useSyncExternalStore
let _cachedRaw: string | null = null;
let _cachedUser: User | null = null;

function getUserSnapshot(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (raw === _cachedRaw) return _cachedUser;
  _cachedRaw = raw;
  if (!raw) {
    _cachedUser = null;
    return null;
  }
  try {
    _cachedUser = JSON.parse(raw) as User;
  } catch {
    _cachedUser = null;
  }
  return _cachedUser;
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

interface PublicNavbarProps {
  onSearch?: (keyword: string) => void;
  cartCount?: number;
  activeRole?: 'CUSTOMER' | 'SUPPORT';
  onRoleChange?: (role: 'CUSTOMER' | 'SUPPORT') => void;
  onOpenSupportConsole?: () => void;
  onToggleSidebar?: () => void;
}

export default function PublicNavbar({
  onSearch,
  cartCount = 0,
  activeRole = 'CUSTOMER',
  onOpenSupportConsole,
  onToggleSidebar,
}: PublicNavbarProps) {
  const { logout } = useAuth();
  const { openAuthModal, requireAuth } = useAuthModal();
  const user = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const el = document.getElementById('featured-products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 'Vui lòng đăng nhập để xem giỏ hàng và đặt hàng');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Mở menu người dùng"
            >
              <Menu size={20} />
            </button>
          )}

          <Link href={user ? '/user' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              CS
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900">
              CSMART
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-2">
          <SearchBar onSearch={onSearch} />
        </div>

        {/* Right Section: Actions & Auth */}
        <div className="flex items-center gap-3 font-sans text-sm">
          {/* Role switcher for CSKH support */}
          {activeRole === 'SUPPORT' && (
            <button
              type="button"
              onClick={onOpenSupportConsole}
              className="hidden lg:inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-amber-200 transition-colors cursor-pointer"
            >
              <Sparkles size={13} className="text-orange-600" />
              <span>Console CSKH</span>
            </button>
          )}

          {/* Cart button - visible when logged in */}
          {user && (
            <button
              type="button"
              onClick={handleCartClick}
              className="relative p-2 rounded-full text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Giỏ hàng của bạn"
            >
              <ShoppingBag size={22} />
              <span className="absolute top-0.5 right-0.5 bg-orange-600 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full ring-2 ring-white">
                {cartCount > 0 ? cartCount : 0}
              </span>
            </button>
          )}

          {/* Login button - only when not authenticated */}
          {!user && (
            <button
              type="button"
              onClick={() => openAuthModal('Đăng nhập tài khoản CSMART')}
              className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold px-5 py-2 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              Đăng Nhập
            </button>
          )}

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar & Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-zinc-200 space-y-3">
          <SearchBar onSearch={onSearch} />
          <div className="flex flex-col gap-2 text-xs font-semibold text-zinc-700">
            <a href="#categories" className="py-1 hover:text-orange-600">
              Danh Mục Sản Phẩm
            </a>
            <a href="#featured-products" className="py-1 hover:text-orange-600">
              Sản Phẩm Bán Chạy
            </a>
            <a href="#trust-props" className="py-1 hover:text-orange-600">
              Chính Sách Bán Hàng
            </a>
            {activeRole === 'SUPPORT' && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenSupportConsole) onOpenSupportConsole();
                }}
                className="w-full py-2 bg-amber-400 text-zinc-900 font-bold rounded-lg text-center"
              >
                Mở Console CSKH
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
