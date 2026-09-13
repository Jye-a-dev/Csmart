'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Sparkles,
  Percent,
  Tag,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Info,
} from 'lucide-react';

export interface Voucher {
  id: string;
  code: string;
  title: string;
  desc: string;
  category: 'ALL' | 'FREESHIP' | 'DISCOUNT' | 'VIP';
  discount_type: 'FIXED' | 'PERCENT';
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  expiry_date: string;
  badge: string;
  is_expired?: boolean;
  terms: string[];
}

interface VoucherCardProps {
  voucher: Voucher;
  isCopied: boolean;
  onCopy: (code: string) => void;
}

export function VoucherCard({ voucher, isCopied, onCopy }: VoucherCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
        voucher.is_expired
          ? 'border-zinc-200 opacity-60 bg-zinc-50/50'
          : 'border-zinc-200/90 hover:border-orange-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="p-4 sm:p-5 flex gap-4">
        {/* Left Ticket Badge */}
        <div
          className={`w-20 sm:w-24 rounded-2xl flex flex-col items-center justify-center p-2 text-center shrink-0 border ${
            voucher.is_expired
              ? 'bg-zinc-100 text-zinc-400 border-zinc-200'
              : voucher.category === 'FREESHIP'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : voucher.category === 'VIP'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-orange-50 text-orange-700 border-orange-200'
          }`}
        >
          {voucher.category === 'FREESHIP' ? (
            <Truck size={24} className="mb-1" />
          ) : voucher.category === 'VIP' ? (
            <Sparkles size={24} className="mb-1" />
          ) : (
            <Percent size={24} className="mb-1" />
          )}
          <span className="text-[11px] font-black leading-tight uppercase">{voucher.badge}</span>
        </div>

        {/* Main Voucher Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-black text-zinc-900 truncate">
              {voucher.title}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed line-clamp-2">
            {voucher.desc}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-zinc-400">
            <span className="inline-flex items-center gap-1 text-zinc-600">
              <Tag size={12} className="text-orange-500" />
              Đơn từ {voucher.min_order_value.toLocaleString('vi-VN')}đ
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              HSD: {voucher.expiry_date}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
        >
          <span>Điều kiện</span>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        <div className="flex items-center gap-2">
          {!voucher.is_expired && (
            <button
              type="button"
              onClick={() => onCopy(voucher.code)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-700 hover:border-orange-500 hover:text-orange-600'
              }`}
            >
              {isCopied ? <Check size={13} /> : <Copy size={13} />}
              <span>{isCopied ? 'Đã sao chép' : voucher.code}</span>
            </button>
          )}
          {!voucher.is_expired && (
            <Link
              href="/user"
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-extrabold hover:bg-orange-700 transition-colors shadow-xs"
            >
              Dùng ngay
            </Link>
          )}
        </div>
      </div>

      {/* Expanded Terms Accordion */}
      {isExpanded && (
        <div className="p-4 bg-zinc-100/70 border-t border-zinc-200 text-xs text-zinc-600 space-y-1.5 animate-in fade-in duration-150">
          <p className="font-bold text-zinc-800 flex items-center gap-1.5">
            <Info size={13} className="text-orange-600" />
            Quy định áp dụng:
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
            {voucher.terms.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

