import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSMART Store — Mua Sắm Thông Minh & Trợ Lý AI 24/7',
  description:
    'Sàn thương mại điện tử thế hệ mới với công nghệ tìm kiếm thông minh Hybrid Search, nhận diện hình ảnh OCR và Trợ lý AI Copilot đàm thoại mua sắm 24/7.',
  keywords: [
    'CSMART',
    'thương mại điện tử',
    'mua sắm thông minh',
    'AI Copilot',
    'thời trang',
    'công nghệ',
    'đồ gia dụng',
  ],
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
