'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

export interface SavedCard {
  id: string;
  card_brand: 'VISA' | 'MASTERCARD' | 'JCB' | 'NAPAS';
  card_number_masked: string;
  cardholder_name: string;
  expiry_month_year: string;
  is_default: boolean;
  color_gradient: string;
}

interface SavedCardItemProps {
  card: SavedCard;
  onSetDefault: (id: string) => void;
  onDelete: (card: SavedCard) => void;
}

export function SavedCardItem({ card, onSetDefault, onDelete }: SavedCardItemProps) {
  return (
    <div
      className={`relative rounded-3xl p-5 text-white bg-linear-to-br ${card.color_gradient} shadow-md flex flex-col justify-between h-48 border border-white/10 overflow-hidden group`}
    >
      {/* Card top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-300/40 flex items-center justify-center">
            <div className="w-4 h-3 border border-amber-800/40 rounded-xs" />
          </div>
          <span className="text-[10px] tracking-widest uppercase font-mono text-zinc-300">
            Debit
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {card.is_default && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase">
              Mặc định
            </span>
          )}
          <span className="font-black text-sm tracking-wider">{card.card_brand}</span>
        </div>
      </div>

      {/* Card Number */}
      <div className="font-mono text-base tracking-widest text-zinc-100 font-bold">
        {card.card_number_masked}
      </div>

      {/* Card bottom bar */}
      <div className="flex items-end justify-between text-xs">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">
            Chủ thẻ
          </p>
          <p className="font-black tracking-wide truncate max-w-[130px]">
            {card.cardholder_name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">
            Hết hạn
          </p>
          <p className="font-mono font-bold">{card.expiry_month_year}</p>
        </div>
      </div>

      {/* Hover overlay actions */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
        {!card.is_default && (
          <button
            type="button"
            onClick={() => onSetDefault(card.id)}
            className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 text-xs font-extrabold hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Đặt mặc định
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(card)}
          className="p-2 rounded-xl bg-rose-600/90 text-white hover:bg-rose-700 transition-colors cursor-pointer"
          title="Xóa thẻ"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

