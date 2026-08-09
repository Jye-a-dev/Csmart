'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md border-4 border-[#09090B] bg-[#FAFAFA] p-8 shadow-[8px_8px_0px_0px_#09090B] text-center">
        
        {/* Error icon */}
        <div className="mx-auto p-4 border-2 border-[#09090B] bg-amber-100 text-amber-600 rounded-full mb-6 w-fit shadow-[2px_2px_0px_0px_#09090B]">
          <ShieldAlert size={40} />
        </div>

        {/* Error Code */}
        <span className="font-mono text-xs font-bold bg-[#F97316] text-[#09090B] px-3 py-1 border-2 border-[#09090B] uppercase tracking-wider shadow-[2px_2px_0px_0px_#09090B]">
          Lỗi 404 - Không Tìm Thấy
        </span>

        {/* Content */}
        <h2 className="text-2xl font-extrabold text-[#09090B] uppercase tracking-tight mt-6 mb-3">
          Trang Không Tồn Tại
        </h2>

        <p className="text-sm text-zinc-600 leading-relaxed mb-8">
          Đường dẫn hoặc tài nguyên bạn đang cố gắng truy cập không tồn tại hoặc đã bị di chuyển sang vị trí khác trong hệ thống.
        </p>

        {/* Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.back()}
            className="btn-brutal flex-1 inline-flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold px-4 py-3 uppercase text-xs cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-zinc-100"
          >
            <ArrowLeft size={16} />
            Quay Lại
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-brutal flex-1 inline-flex items-center justify-center gap-2 bg-[#F97316] text-[#09090B] font-mono font-bold px-4 py-3 uppercase text-xs cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Home size={16} />
            Trang Chủ
          </button>
        </div>

      </div>
    </div>
  );
}
