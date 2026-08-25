'use client';

import type { ReactNode } from 'react';
import { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import PublicFooter from '@/components/layouts/(public)/Footer/PublicFooter';
import PublicNavbar from '@/components/layouts/(public)/Navbar/PublicNavbar';
import MarqueeTicker from '@/components/layouts/(public)/Navbar/MarqueeTicker';
import UserSidebar from '@/components/layouts/(public)/Sidebar/UserSidebar';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import type { User } from '@/types/entities/user';

type PublicSetupProps = {
  children: ReactNode;
};

// Stable cache for useSyncExternalStore
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

export default function PublicSetup({ children }: PublicSetupProps) {
  const pathname = usePathname();
  const user = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isUserRoute = pathname.startsWith('/user');

  if (isAuthRoute) {
    return (
      <AuthModalProvider>
        <main className="w-full min-h-screen bg-zinc-100">{children}</main>
      </AuthModalProvider>
    );
  }

  if (isUserRoute) {
    return (
      <AuthModalProvider>
        <div className="flex min-h-screen w-full bg-[#FAFAFA] text-zinc-900">
          {/* Desktop & Mobile User Sidebar */}
          <UserSidebar
            user={user}
            mobileOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <MarqueeTicker />
            <PublicNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
            <main className="flex-1 w-full">{children}</main>
            <PublicFooter />
          </div>
        </div>
      </AuthModalProvider>
    );
  }

  return (
    <AuthModalProvider>
      <div className="flex flex-col min-h-screen w-full">
        <MarqueeTicker />
        <PublicNavbar />
        <main className="flex-1 w-full">{children}</main>
        <PublicFooter />
      </div>
    </AuthModalProvider>
  );
}
