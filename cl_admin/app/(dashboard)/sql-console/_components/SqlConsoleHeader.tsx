'use client';

import { DatabaseZap } from 'lucide-react';

export function SqlConsoleHeader() {
  return (
    <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#09090B] text-[#F97316]"><DatabaseZap size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">SQL Console</h1>
        </div>
        <p className="font-mono text-xs text-zinc-500">Text-to-SQL Sandbox — Nhập tiếng Việt tự nhiên, nhận SQL tức thì</p>
      </div>
      <div className="hidden md:flex items-center gap-2 border-2 border-[#09090B] px-3 py-1.5 bg-[#FAFAFA] shadow-[2px_2px_0px_0px_#09090B] font-mono text-[10px] font-black text-zinc-600">
        <kbd className="bg-zinc-200 px-1.5 py-0.5 border border-zinc-300">Ctrl</kbd>+<kbd className="bg-zinc-200 px-1.5 py-0.5 border border-zinc-300">Enter</kbd>
        <span>để chạy</span>
      </div>
    </div>
  );
}
