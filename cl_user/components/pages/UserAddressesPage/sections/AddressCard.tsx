'use client';

import React from 'react';
import { User as UserIcon, Phone, Edit3, Trash2 } from 'lucide-react';
import type { UserAddress } from '@/types/entities/user';

interface AddressCardProps {
  address: UserAddress;
  onSetDefault: (address: UserAddress) => void;
  onEdit: (address: UserAddress) => void;
  onDelete: (address: UserAddress) => void;
}

export function AddressCard({
  address,
  onSetDefault,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <div
      className={`p-5 sm:p-6 bg-white rounded-2xl border transition-all ${
        address.is_default
          ? 'border-orange-500/70 shadow-sm ring-2 ring-orange-500/10'
          : 'border-zinc-200/80 hover:border-zinc-300 shadow-xs'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-zinc-900 flex items-center gap-2">
              <UserIcon size={16} className="text-zinc-400" />
              {address.recipient_name}
            </span>
            <span className="text-zinc-300">|</span>
            <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
              <Phone size={14} className="text-zinc-400" />
              {address.phone}
            </span>
            {address.is_default && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-700 border border-orange-200 tracking-wide uppercase">
                Mặc định
              </span>
            )}
          </div>

          <div className="text-xs sm:text-sm text-zinc-700 space-y-1">
            <p className="font-medium">{address.street_address}</p>
            <p className="text-zinc-500 text-xs">
              {[address.ward, address.district, address.city_province]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          {!address.is_default && (
            <button
              type="button"
              onClick={() => onSetDefault(address)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-bold hover:border-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Đặt mặc định
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Chỉnh sửa địa chỉ"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(address)}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Xóa địa chỉ"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

