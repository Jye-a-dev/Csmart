'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function ActionButtons() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => router.back()}
        className="btn-brutal-custom flex-1 inline-flex items-center justify-center gap-2.5 bg-white text-[#09090B] font-mono font-black px-6 py-3.5 uppercase text-xs cursor-pointer"
      >
        <ArrowLeft size={16} />
        Quay Lại
      </button>
      <button
        onClick={() => router.push('/')}
        className="btn-brutal-custom flex-1 inline-flex items-center justify-center gap-2.5 bg-[#F97316] text-[#09090B] font-mono font-black px-6 py-3.5 uppercase text-xs cursor-pointer"
      >
        <Home size={16} />
        Trang Chủ
      </button>
    </div>
  );
}
