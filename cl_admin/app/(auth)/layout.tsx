import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Xác Thực Quản Trị - CSMART',
  description: 'Đăng nhập bảng quản trị hệ thống Csmart AI.',
};

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-screen bg-[#f6f4ef] text-[#09090B] antialiased">
        <div className="min-h-screen w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
          {children}
        </div>
      </body>
    </html>
  );
}
