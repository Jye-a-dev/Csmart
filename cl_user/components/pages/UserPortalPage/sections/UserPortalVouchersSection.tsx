import React from 'react';
import { Flame, Check, Copy } from 'lucide-react';

export interface VoucherItem {
  code: string;
  title: string;
  desc: string;
  tag: string;
}

export interface UserPortalVouchersSectionProps {
  vouchers: VoucherItem[];
  copiedVoucher: string | null;
  onCopyVoucher: (code: string) => void;
}

export function UserPortalVouchersSection({
  vouchers,
  copiedVoucher,
  onCopyVoucher,
}: UserPortalVouchersSectionProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-3">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={18} className="text-orange-500" />
          <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
            Mã Giảm Giá Đang Dành Cho Bạn
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vouchers.map((v) => (
            <div
              key={v.code}
              className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:border-orange-300 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[10px] font-extrabold tracking-wide">
                  {v.tag}
                </span>
                <h3 className="text-xs font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">
                  {v.title}
                </h3>
                <p className="text-[11px] text-zinc-500">{v.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => onCopyVoucher(v.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedVoucher === v.code
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-orange-500 hover:text-white text-zinc-700'
                }`}
              >
                {copiedVoucher === v.code ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedVoucher === v.code ? 'Đã lưu' : v.code}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
