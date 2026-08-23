'use client';

import { Settings, Save, CheckCircle } from 'lucide-react';

interface SettingsHeaderProps {
  saved: boolean;
  onSave: () => void;
}

export function SettingsHeader({ saved, onSave }: SettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#09090B] text-[#F97316]"><Settings size={20} /></div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">Cài Đặt Hệ Thống</h1>
        </div>
        <p className="font-mono text-xs text-zinc-500">Cấu hình AI threshold, Circuit Breaker và thông tin cửa hàng</p>
      </div>
      <button
        onClick={onSave}
        className={`px-6 py-3 border-2 border-[#09090B] font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 ${saved ? 'bg-emerald-400 text-[#09090B]' : 'bg-[#F97316] text-[#09090B]'}`}
      >
        {saved ? <CheckCircle size={14} /> : <Save size={14} />}
        {saved ? 'Đã lưu!' : 'Lưu Cài Đặt'}
      </button>
    </div>
  );
}
