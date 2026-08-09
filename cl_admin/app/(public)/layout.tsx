import type { Metadata } from "next";
import type { ReactNode } from "react";

import PublicSetup from "@/components/layouts/(public)/PublicSetup";

import "../globals.css";

export const metadata: Metadata = {
  title: "CSMART_OS Admin Console",
  description: "Bảng điều khiển quản trị hệ thống Csmart AI.",
};

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-screen bg-[#FAFAFA] text-[#09090B] antialiased">
        <div className="min-h-screen w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
          <PublicSetup>{children}</PublicSetup>
        </div>
      </body>
    </html>
  );
}
