'use client';

import React, { useState } from 'react';
import { Tag } from 'lucide-react';

interface VoucherInputBarProps {
  onAddVoucher: (code: string) => void;
}

export function VoucherInputBar({ onAddVoucher }: VoucherInputBarProps) {
  const [inputCode, setInputCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) return;
    onAddVoucher(clean);
    setInputCode('');
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Tag size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Nhập mã ưu đãi (VD: CSMART50K, FREESHIP)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm uppercase font-bold tracking-wider placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs sm:text-sm font-extrabold hover:bg-orange-700 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          Lưu Vào Ví
        </button>
      </form>
    </div>
  );
}

