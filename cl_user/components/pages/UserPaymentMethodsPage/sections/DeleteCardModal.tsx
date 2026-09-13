'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { SavedCard } from './SavedCardItem';

interface DeleteCardModalProps {
  card: SavedCard | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCardModal({ card, onClose, onConfirm }: DeleteCardModalProps) {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-zinc-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-rose-600">
          <AlertCircle size={22} />
          <h3 className="text-base font-black text-zinc-900">Xóa Thẻ Thanh Toán</h3>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Bạn có chắc chắn muốn xóa thẻ{' '}
          <strong>
            {card.card_brand} {card.card_number_masked}
          </strong>{' '}
          khỏi tài khoản?
        </p>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}

