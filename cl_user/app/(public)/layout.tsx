import type { ReactNode } from 'react';
import PublicSetup from '@/components/layouts/(public)/PublicSetup';

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-zinc-900">
      <PublicSetup>{children}</PublicSetup>
    </div>
  );
}
