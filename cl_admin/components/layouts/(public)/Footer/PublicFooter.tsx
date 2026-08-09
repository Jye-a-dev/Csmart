'use client';

import { Terminal, ArrowUp } from 'lucide-react';

export default function PublicFooter() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#09090B] text-[#FAFAFA] border-t-2 border-[#09090B] px-6 py-12 md:px-12 font-mono text-xs mt-auto">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#FAFAFA] text-[#09090B] p-1 border border-[#FAFAFA]">
                <Terminal size={16} />
              </div>
              <span className="font-extrabold tracking-tighter text-sm uppercase text-[#FAFAFA]">
                CSMART_Admin
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-xs text-[11px]">
              Hệ sinh thái tự động hóa bán lẻ, trợ lý mua sắm đàm thoại thông minh và rào chắn kiểm soát AI.
            </p>
          </div>

          {/* Col 2: Services / Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">01. PHÂN HỆ CORE</div>
            <ul className="space-y-1.5 text-zinc-500">
              <li>
                <a href="#core-structure" className="hover:text-[#F97316] transition-colors">/pipeline_ai Engine</a>
              </li>
              <li>
                <a href="#core-structure" className="hover:text-[#F97316] transition-colors">/server Swagger API</a>
              </li>
              <li>
                <a href="#core-structure" className="hover:text-[#F97316] transition-colors">/cl_admin Console</a>
              </li>
              <li>
                <a href="#core-structure" className="hover:text-[#F97316] transition-colors">/cl_user Copilot</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical Docs */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">02. BẢO MẬT & CHÍNH SÁCH</div>
            <ul className="space-y-1.5 text-zinc-500">
              <li>
                <span className="text-emerald-500 font-bold">✓ SQL Guardrails Enabled</span>
              </li>
              <li>
                <span className="text-emerald-500 font-bold">✓ SSL Handshake Active</span>
              </li>
              <li>
                <span className="text-amber-500 font-bold">⚠ HITL Authorization Required</span>
              </li>
              <li>
                <span className="text-zinc-500 font-bold">⚙ Jaccard Threshold &gt;= 0.15</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Action / Back to top */}
          <div className="flex flex-col justify-between items-start md:items-end">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 md:mb-0">
              TRẠNG THÁI: <span className="text-emerald-500 animate-pulse">OK</span>
            </div>
            <button
              onClick={handleScrollToTop}
              className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-[#FAFAFA] hover:bg-zinc-800 transition-all px-3 py-2 cursor-pointer font-bold"
            >
              Lên đầu trang <ArrowUp size={14} />
            </button>
          </div>

        </div>

        {/* Lower section */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-500 text-[10px]">
          <div>
            &copy; 2026 CSMART OS CORPORATION. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
            <span>•</span>
            <a href="#" className="hover:underline">Điều khoản sử dụng</a>
            <span>•</span>
            <a href="#" className="hover:underline">Báo cáo bảo mật</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
