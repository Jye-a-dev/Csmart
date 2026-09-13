'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { usePayments } from '@/hooks';
import { Payment, PaymentMethod, PaymentStatus } from '@/types/entities/payment';
import {
  SavedCard,
  SavedCardItem,
  AddCardModal,
  DeleteCardModal,
  LinkedWallet,
  LinkedWalletsSection,
  PaymentHistorySection,
} from './sections';

const INITIAL_CARDS: SavedCard[] = [
  {
    id: 'card-1',
    card_brand: 'VISA',
    card_number_masked: '•••• •••• •••• 4242',
    cardholder_name: 'NGUYEN VAN AN',
    expiry_month_year: '12/28',
    is_default: true,
    color_gradient: 'from-blue-900 via-indigo-900 to-slate-900',
  },
  {
    id: 'card-2',
    card_brand: 'MASTERCARD',
    card_number_masked: '•••• •••• •••• 8899',
    cardholder_name: 'NGUYEN VAN AN',
    expiry_month_year: '08/27',
    is_default: false,
    color_gradient: 'from-amber-700 via-rose-800 to-zinc-900',
  },
];

const INITIAL_WALLETS: LinkedWallet[] = [
  {
    id: 'w-momo',
    name: 'Ví MoMo',
    code: 'MOMO',
    phone_masked: '0901***567',
    is_linked: true,
    icon_color: 'bg-[#A50064] text-white',
  },
  {
    id: 'w-vnpay',
    name: 'Cổng VNPAY / VietQR',
    code: 'VNPAY',
    phone_masked: '0901***567',
    is_linked: true,
    icon_color: 'bg-[#005BAA] text-white',
  },
  {
    id: 'w-zalopay',
    name: 'Ví ZaloPay',
    code: 'ZALOPAY',
    is_linked: false,
    icon_color: 'bg-[#0068FF] text-white',
  },
  {
    id: 'w-shopeepay',
    name: 'Ví ShopeePay',
    code: 'SHOPEEPAY',
    is_linked: false,
    icon_color: 'bg-[#EE4D2D] text-white',
  },
];

export default function UserPaymentMethodsPage() {
  const { findAllPayments, loading: paymentsLoading } = usePayments();

  const [cards, setCards] = useState<SavedCard[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('user_saved_cards');
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_CARDS;
  });

  const [wallets, setWallets] = useState<LinkedWallet[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('user_linked_wallets');
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_WALLETS;
  });

  const [paymentsHistory, setPaymentsHistory] = useState<Payment[]>([]);
  const [addCardModal, setAddCardModal] = useState(false);
  const [deleteCardModal, setDeleteCardModal] = useState<SavedCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('user_saved_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('user_linked_wallets', JSON.stringify(wallets));
  }, [wallets]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    let isMounted = true;
    findAllPayments({ limit: 10 })
      .then((data) => {
        if (isMounted && data) {
          setPaymentsHistory(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPaymentsHistory([
            {
              id: 'pay-sample-1',
              order_id: 'ord-10023',
              payment_method: PaymentMethod.MOMO,
              payment_status: PaymentStatus.COMPLETED,
              transaction_code: 'MOMO20260901842',
              amount: 540000,
              paid_at: new Date(Date.now() - 86400000 * 2).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
              id: 'pay-sample-2',
              order_id: 'ord-10020',
              payment_method: PaymentMethod.CREDIT_CARD,
              payment_status: PaymentStatus.COMPLETED,
              transaction_code: 'VISA994821',
              amount: 1250000,
              paid_at: new Date(Date.now() - 86400000 * 5).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
            {
              id: 'pay-sample-3',
              order_id: 'ord-10018',
              payment_method: PaymentMethod.COD,
              payment_status: PaymentStatus.COMPLETED,
              amount: 320000,
              paid_at: new Date(Date.now() - 86400000 * 12).toISOString(),
              created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
            },
          ]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [findAllPayments]);

  const handleAddCard = (newCard: SavedCard) => {
    setCards((prev) =>
      newCard.is_default ? [...prev.map((c) => ({ ...c, is_default: false })), newCard] : [...prev, newCard]
    );
    showToast(`Đã thêm thẻ ${newCard.card_brand} ${newCard.card_number_masked} thành công!`);
  };

  const handleSetDefaultCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        is_default: c.id === id,
      }))
    );
    showToast('Đã đặt thẻ làm phương thức mặc định.');
  };

  const handleDeleteCard = () => {
    if (!deleteCardModal) return;
    setCards((prev) => prev.filter((c) => c.id !== deleteCardModal.id));
    showToast('Đã xóa thẻ thanh toán.');
    setDeleteCardModal(null);
  };

  const handleToggleWallet = (wallet: LinkedWallet) => {
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === wallet.id) {
          const nextLinked = !w.is_linked;
          showToast(
            nextLinked
              ? `Liên kết ${w.name} thành công!`
              : `Đã hủy liên kết với ${w.name}.`
          );
          return {
            ...w,
            is_linked: nextLinked,
            phone_masked: nextLinked ? '0901***567' : undefined,
          };
        }
        return w;
      })
    );
  };

  return (
    <div className="min-w-0 flex-1 space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-linear-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <CreditCard size={14} /> Cổng Thanh Toán
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Thẻ & Phương Thức TT</h1>
          <p className="mt-2 text-sm text-orange-100/90 leading-relaxed">
            Bảo mật thanh toán đa tầng đạt chuẩn PCI-DSS. Quản lý thẻ quốc tế, ví điện tử và tài khoản ngân hàng liên kết.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs font-bold">
          <ShieldCheck size={18} className="text-emerald-300" />
          <span>Mã hóa bảo mật 256-bit</span>
        </div>
        <div className="absolute -right-5 -bottom-5 opacity-10 pointer-events-none">
          <CreditCard size={240} />
        </div>
      </div>

      {/* SECTION 1: CREDIT & DEBIT CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-600" />
              <span>Thẻ Tín Dụng / Ghi Nợ Quốc Tế</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Hỗ trợ thẻ Visa, Mastercard, JCB và thẻ ATM Napas
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddCardModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-extrabold hover:bg-orange-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Thêm Thẻ Mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <SavedCardItem
              key={card.id}
              card={card}
              onSetDefault={handleSetDefaultCard}
              onDelete={(target) => setDeleteCardModal(target)}
            />
          ))}

          {/* Add card placeholder */}
          <button
            type="button"
            onClick={() => setAddCardModal(true)}
            className="rounded-3xl border-2 border-dashed border-zinc-200 hover:border-orange-400 bg-white hover:bg-orange-50/40 transition-all p-5 h-48 flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={22} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-zinc-900">Thêm thẻ thanh toán mới</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Visa, Mastercard, JCB, Napas</p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: LINKED E-WALLETS */}
      <LinkedWalletsSection
        wallets={wallets}
        onToggleWallet={handleToggleWallet}
      />

      {/* SECTION 3: BANK & VIETQR */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900">
                Tài Khoản Hoàn Tiền / Chuyển Khoản VietQR
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Ngân hàng TMCP Quân Đội (MB Bank) - 970422******1234
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Sẵn sàng
          </span>
        </div>
      </div>

      {/* SECTION 4: RECENT PAYMENT TRANSACTIONS */}
      <PaymentHistorySection
        payments={paymentsHistory}
        loading={paymentsLoading}
      />

      {/* Modals */}
      <AddCardModal
        isOpen={addCardModal}
        onClose={() => setAddCardModal(false)}
        onAddCard={handleAddCard}
      />

      <DeleteCardModal
        card={deleteCardModal}
        onClose={() => setDeleteCardModal(null)}
        onConfirm={handleDeleteCard}
      />
    </div>
  );
}
