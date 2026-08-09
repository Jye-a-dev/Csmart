'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md border-4 border-[#09090B] bg-[#FAFAFA] p-8 shadow-[8px_8px_0px_0px_#09090B] text-center">
        
        {/* Error icon */}
        <div className="mx-auto p-4 border-2 border-[#09090B] bg-rose-100 text-rose-600 rounded-full mb-6 w-fit shadow-[2px_2px_0px_0px_#09090B]">
          <ShieldAlert size={40} />
        </div>

        {/* Error Code */}
        <span className="font-mono text-xs font-bold bg-rose-600 text-white px-3 py-1 border-2 border-[#09090B] uppercase tracking-wider shadow-[2px_2px_0px_0px_#09090B]">
          Lỗi Hệ Thống - 500
        </span>

        {/* Content */}
        <h2 className="text-2xl font-extrabold text-[#09090B] uppercase tracking-tight mt-6 mb-3">
          Đã Xảy Ra Sự Cố
        </h2>

        <p className="text-sm text-zinc-600 leading-relaxed mb-6">
          Một sự cố không mong muốn đã làm gián đoạn tiến trình hiển thị của trang quản trị.
        </p>

        {/* Technical Error Details */}
        <div className="mb-6 p-4 border border-[#09090B] bg-zinc-100 text-left font-mono text-[10px] text-zinc-700 overflow-auto max-h-24 shadow-[inner_2px_2px_0px_rgba(0,0,0,0.1)]">
          <strong className="text-[#09090B] block mb-1">MÃ CHI TIẾT:</strong>
          {error.message || 'Unknown runtime error'}
          {error.digest && <span className="block mt-1 text-zinc-400">Digest: {error.digest}</span>}
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="btn-brutal flex-1 inline-flex items-center justify-center gap-2 bg-[#F97316] text-[#09090B] font-mono font-bold px-4 py-3 uppercase text-xs cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <RefreshCw size={16} />
            Thử Lại
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-brutal flex-1 inline-flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold px-4 py-3 uppercase text-xs cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-zinc-100"
          >
            <Home size={16} />
            Trang Chủ
          </button>
        </div>

      </div>
    </div>
  );
}
