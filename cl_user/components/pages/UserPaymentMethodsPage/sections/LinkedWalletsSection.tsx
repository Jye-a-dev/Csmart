'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';

export interface LinkedWallet {
  id: string;
  name: string;
  code: 'MOMO' | 'VNPAY' | 'ZALOPAY' | 'SHOPEEPAY';
  phone_masked?: string;
  is_linked: boolean;
  icon_color: string;
}

interface LinkedWalletsSectionProps {
  wallets: LinkedWallet[];
  onToggleWallet: (wallet: LinkedWallet) => void;
}

export function LinkedWalletsSection({ wallets, onToggleWallet }: LinkedWalletsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
          <Smartphone size={18} className="text-orange-600" />
          <span>Ví Điện Tử Liên Kết</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Liên kết một chạm để thanh toán siêu tốc không cần nhập lại mã xác thực
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl ${wallet.icon_color} font-black text-xs flex items-center justify-center shadow-xs shrink-0`}
              >
                {wallet.code.slice(0, 4)}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900">{wallet.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {wallet.is_linked ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Đã liên kết {wallet.phone_masked ? `(${wallet.phone_masked})` : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-zinc-300" />
                      <span className="text-[11px] font-medium text-zinc-400">Chưa liên kết</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleWallet(wallet)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                wallet.is_linked
                  ? 'border border-zinc-200 text-zinc-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs'
              }`}
            >
              {wallet.is_linked ? 'Hủy liên kết' : 'Liên kết ngay'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

