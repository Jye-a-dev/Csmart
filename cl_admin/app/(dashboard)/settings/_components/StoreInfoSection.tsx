'use client';

import { Store } from 'lucide-react';

export interface AdminSettings {
  confidence_threshold: number;
  store_name: string;
  store_hotline: string;
  store_address: string;
}

interface StoreInfoSectionProps {
  settings: AdminSettings;
  onSet: <K extends keyof AdminSettings>(key: K, val: AdminSettings[K]) => void;
}

export function StoreInfoSection({ settings, onSet }: StoreInfoSectionProps) {
  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center gap-2">
        <Store size={14} className="text-[#F97316]" />
        Thông tin Cửa hàng
      </div>
      <div className="p-5 space-y-4">
        <p className="font-mono text-xs text-zinc-500">
          Thông tin này được hiển thị trong các phản hồi AI Assistant khi khách hàng hỏi về liên hệ hỗ trợ.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Tên cửa hàng</label>
            <input value={settings.store_name} onChange={(e) => onSet('store_name', e.target.value)} placeholder="VD: CsmartAI Store" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
          </div>
          <div>
            <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Hotline / Số điện thoại</label>
            <input value={settings.store_hotline} onChange={(e) => onSet('store_hotline', e.target.value)} placeholder="VD: 0901 234 567" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
          </div>
          <div className="md:col-span-2">
            <label className="font-mono text-xs font-black uppercase text-[#09090B] block mb-1">Địa chỉ cửa hàng</label>
            <input value={settings.store_address} onChange={(e) => onSet('store_address', e.target.value)} placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM" className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]" />
          </div>
        </div>
        <div className="p-3 border-2 border-dashed border-zinc-300 bg-zinc-50 font-mono text-[10px] text-zinc-400">
          ⚠ Cài đặt được lưu trong localStorage trình duyệt. Để lưu vĩnh viễn lên server, cần tích hợp API /settings.
        </div>
      </div>
    </section>
  );
}
