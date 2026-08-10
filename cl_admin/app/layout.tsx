import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "CSMART Admin Console",
  description: "Bảng điều khiển quản trị hệ thống Csmart AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#FAF7F2] text-[#09090B] antialiased">
        {children}
      </body>
    </html>
  );
}
