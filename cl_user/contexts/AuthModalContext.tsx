'use client';

import React, { createContext, useContext, useState, useCallback, useSyncExternalStore, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/entities/user';
import {
  X,
  LogIn,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string, pendingAction?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, reason?: string) => boolean;
  currentUser: User | null;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

// Cache for useSyncExternalStore
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

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentUser = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>('Vui lòng đăng nhập để tiếp tục thao tác');

  const openAuthModal = useCallback((customReason?: string) => {
    setReason(customReason || 'Vui lòng đăng nhập để tiếp tục thao tác');
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const requireAuth = useCallback(
    (action: () => void, customReason?: string): boolean => {
      const isAuth = !!localStorage.getItem('access_token');
      if (isAuth) {
        action();
        return true;
      }
      openAuthModal(customReason || 'Vui lòng đăng nhập để thực hiện thao tác này');
      return false;
    },
    [openAuthModal]
  );

  const handleGoToLogin = () => {
    closeAuthModal();
    router.push('/login');
  };

  return (
    <AuthModalContext.Provider
      value={{
        isAuthModalOpen: isOpen,
        authModalReason: reason,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        currentUser,
      }}
    >
      {children}

      {/* Global Auth Informational Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={closeAuthModal}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer z-10"
              title="Đóng"
            >
              <X size={18} />
            </button>

            {/* Header Icon Accent */}
            <div className="pt-8 pb-4 px-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-orange-600 shadow-inner mb-4">
                <LogIn size={32} className="stroke-[2.2]" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase mb-2">
                <Sparkles size={13} className="text-orange-600" />
                <span>Yêu Cầu Đăng Nhập</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
                CSMART Store
              </h2>

              <p className="text-zinc-700 font-semibold text-sm mt-3 px-2 leading-relaxed">
                {reason}
              </p>

              <p className="text-zinc-400 text-xs mt-2 px-4 leading-relaxed">
                Đăng nhập hoặc đăng ký tài khoản thành viên để tận hưởng quyền lợi mua sắm, nhận ưu đãi độc quyền và theo dõi đơn hàng thuận tiện.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="px-6 py-2">
              <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100 grid grid-cols-2 gap-2 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Bảo mật 100%</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                  <ShoppingBag size={16} className="text-orange-600 shrink-0" />
                  <span>Lưu giỏ hàng</span>
                </div>
              </div>
            </div>

            {/* Single Action CTA Button */}
            <div className="p-6 pt-4 space-y-3">
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Đăng Nhập / Đăng Ký Ngay</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={closeAuthModal}
                className="text-xs text-zinc-400 hover:text-zinc-600 font-medium cursor-pointer"
              >
                Để sau, tiếp tục xem sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
