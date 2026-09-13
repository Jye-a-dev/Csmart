'use client';

import React from 'react';
import { MapPin, Plus } from 'lucide-react';

interface AddressEmptyStateProps {
  onAddFirst: () => void;
}

export function AddressEmptyState({ onAddFirst }: AddressEmptyStateProps) {
  return (
    <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
      <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
        <MapPin size={32} />
      </div>
      <div>
        <h3 className="text-base font-bold text-zinc-900">Chưa có địa chỉ nào được lưu</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Thêm địa chỉ giao hàng đầu tiên để tiết kiệm thời gian cho những lần mua sắm tiếp theo.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddFirst}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm cursor-pointer"
      >
        <Plus size={14} />
        <span>Thêm Địa Chỉ Đầu Tiên</span>
      </button>
    </div>
  );
}

