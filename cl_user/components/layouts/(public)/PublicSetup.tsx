'use client';

import type { ReactNode } from 'react';
import PublicFooter from '@/components/layouts/(public)/Footer/PublicFooter';
import PublicNavbar from '@/components/layouts/(public)/Navbar/PublicNavbar';
import MarqueeTicker from '@/components/layouts/(public)/Navbar/MarqueeTicker';
import { AuthModalProvider } from '@/contexts/AuthModalContext';

type PublicSetupProps = {
  children: ReactNode;
};

export default function PublicSetup({ children }: PublicSetupProps) {
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
