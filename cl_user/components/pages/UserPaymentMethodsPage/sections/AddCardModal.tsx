'use client';

import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import type { SavedCard } from './SavedCardItem';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (card: SavedCard) => void;
}

export function AddCardModal({ isOpen, onClose, onAddCard }: AddCardModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefaultCard, setIsDefaultCard] = useState(false);

  if (!isOpen) return null;

  const detectBrand = (num: string): 'VISA' | 'MASTERCARD' | 'JCB' | 'NAPAS' => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (clean.startsWith('35')) return 'JCB';
    return 'NAPAS';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiry(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 12 || !cardholderName.trim() || expiry.length < 5 || cvv.length < 3) {
      return;
    }

    const brand = detectBrand(cleanNum);
    const last4 = cleanNum.slice(-4);
    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      card_brand: brand,
      card_number_masked: `•••• •••• •••• ${last4}`,
      cardholder_name: cardholderName.trim().toUpperCase(),
      expiry_month_year: expiry,
      is_default: isDefaultCard,
      color_gradient:
        brand === 'VISA'
          ? 'from-blue-900 via-indigo-900 to-slate-900'
          : brand === 'MASTERCARD'
          ? 'from-amber-700 via-rose-800 to-zinc-900'
          : 'from-emerald-800 via-teal-900 to-zinc-900',
    };

    onAddCard(newCard);
    setCardNumber('');
    setCardholderName('');
    setExpiry('');
    setCvv('');
    setIsDefaultCard(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-orange-600" />
            <h3 className="text-base font-black text-zinc-900">Thêm Thẻ Thanh Toán Mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Số thẻ (16 chữ số) *
            </label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4242 •••• •••• 4242"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Tên in trên thẻ (không dấu) *
            </label>
            <input
              type="text"
              required
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              placeholder="VD: NGUYEN VAN A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold uppercase focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Hạn dùng (MM/YY) *
              </label>
              <input
                type="text"
                required
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="12/28"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Mã CVV/CVC *</label>
              <input
                type="password"
                maxLength={4}
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="•••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefaultCard}
              onChange={(e) => setIsDefaultCard(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-600 cursor-pointer"
            />
            <span className="text-xs font-semibold text-zinc-700">
              Đặt làm thẻ thanh toán mặc định
            </span>
          </label>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-xs cursor-pointer"
            >
              Lưu Thẻ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

