'use client';

import Link from 'next/link';
import { Terminal } from 'lucide-react';

export default function PublicNavbar() {
  return (
    <nav className="sticky top-0 z-40 w-full bg-[#FAFAFA]/95 backdrop-blur-md border-b-2 border-[#09090B] px-6 py-4 md:px-12">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#09090B] text-[#FAFAFA] p-1.5 border border-[#09090B] transition-transform group-hover:rotate-6">
            <Terminal size={18} />
          </div>
          <span className="font-mono font-extrabold tracking-tighter text-lg uppercase text-[#09090B]">
            CSMART_OS <span className="text-[#F97316]">v2.4</span>
          </span>
        </Link>

        {/* Menu Navigation */}
        <div className="hidden md:flex items-center gap-8 font-mono text-sm font-semibold">
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
        <div>
          <Link
            href="/login"
            className="btn-brutal inline-flex items-center justify-center bg-[#F97316] text-[#09090B] font-mono font-bold text-sm px-5 py-2.5 uppercase tracking-wide cursor-pointer"
          >
            Đăng nhập Console
          </Link>
        </div>
      </div>
    </nav>
  );
}
