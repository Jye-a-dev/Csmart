'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Voucher,
  VoucherCard,
  VoucherInputBar,
  VoucherTabsFilter,
} from './sections';

const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'v-1',
    code: 'CSMART50K',
    title: 'Giảm 50.000đ cho đơn đầu tiên',
    desc: 'Áp dụng cho mọi khách hàng mới trên toàn quốc',
    category: 'DISCOUNT',
    discount_type: 'FIXED',
    discount_value: 50000,
    min_order_value: 300000,
    expiry_date: '2026-12-31',
    badge: '50K HOT',
    terms: [
      'Áp dụng cho đơn hàng từ 300.000đ trở lên.',
      'Áp dụng cho toàn bộ ngành hàng trừ thẻ cào.',
      'Mỗi khách hàng được sử dụng tối đa 1 lần.',
    ],
  },
  {
    id: 'v-2',
    code: 'FREESHIP30K',
    title: 'Miễn phí vận chuyển 30.000đ',
    desc: 'Hỗ trợ giao hàng toàn quốc từ 200.000đ',
    category: 'FREESHIP',
    discount_type: 'FIXED',
    discount_value: 30000,
    min_order_value: 200000,
    expiry_date: '2026-10-15',
    badge: 'FREESHIP',
    terms: [
      'Áp dụng cho mọi hình thức giao hàng nhanh và tiêu chuẩn.',
      'Giảm tối đa 30.000đ phí vận chuyển.',
      'Không giới hạn số lần sử dụng trong tháng.',
    ],
  },
  {
    id: 'v-3',
    code: 'VIP20PRO',
    title: 'Giảm 20% tối đa 150.000đ',
    desc: 'Đặc quyền cho thành viên VIP và khách hàng thân thiết',
    category: 'VIP',
    discount_type: 'PERCENT',
    discount_value: 20,
    min_order_value: 500000,
    max_discount: 150000,
    expiry_date: '2026-11-30',
    badge: 'VIP CLUB',
    terms: [
      'Áp dụng cho thành viên đạt hạng Bạc trở lên.',
      'Giảm 20% giá trị đơn hàng, tối đa 150.000đ.',
      'Có thể áp dụng đồng thời với mã freeship.',
    ],
  },
  {
    id: 'v-4',
    code: 'TECH100K',
    title: 'Giảm 100.000đ Thiết Bị Công Nghệ',
    desc: 'Áp dụng cho điện thoại, laptop và phụ kiện công nghệ',
    category: 'DISCOUNT',
    discount_type: 'FIXED',
    discount_value: 100000,
    min_order_value: 1200000,
    expiry_date: '2026-10-31',
    badge: 'CÔNG NGHỆ',
    terms: [
      'Áp dụng cho danh mục Laptop, Điện Thoại, Phụ Kiện Âm Thanh.',
      'Đơn hàng tối thiểu 1.200.000đ.',
      'Hạn sử dụng đến 31/10/2026.',
    ],
  },
  {
    id: 'v-5',
    code: 'EXPIRED2025',
    title: 'Ưu Đãi Năm Mới 2025',
    desc: 'Mã ưu đãi đã hết hạn sử dụng',
    category: 'DISCOUNT',
    discount_type: 'FIXED',
    discount_value: 40000,
    min_order_value: 250000,
    expiry_date: '2025-01-01',
    badge: 'HẾT HẠN',
    is_expired: true,
    terms: ['Mã đã hết thời hạn áp dụng vào ngày 01/01/2025.'],
  },
];

export default function UserVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('user_wallet_vouchers');
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_VOUCHERS;
  });

  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('user_wallet_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã "${code}" vào clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAddVoucher = (code: string) => {
    const clean = code.toUpperCase();
    if (vouchers.some((v) => v.code === clean)) {
      showToast(`Mã "${clean}" đã có sẵn trong kho voucher của bạn!`);
      return;
    }

    const newVoucher: Voucher = {
      id: `v-custom-${Date.now()}`,
      code: clean,
      title: `Ưu Đãi Đặc Biệt ${clean}`,
      desc: 'Mã giảm giá vừa lưu thành công vào ví voucher cá nhân',
      category: clean.includes('SHIP') ? 'FREESHIP' : clean.includes('VIP') ? 'VIP' : 'DISCOUNT',
      discount_type: 'FIXED',
      discount_value: 50000,
      min_order_value: 300000,
      expiry_date: '2026-12-31',
      badge: 'VỪA LƯU',
      terms: [
        'Mã ưu đãi độc quyền lưu từ sự kiện.',
        'Áp dụng cho đơn hàng từ 300.000đ.',
        'Hạn dùng đến hết năm 2026.',
      ],
    };

    setVouchers((prev) => [newVoucher, ...prev]);
    showToast(`Lưu thành công mã "${clean}" vào kho voucher!`);
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (selectedTab === 'EXPIRED') return v.is_expired;
      if (v.is_expired) return false;
      if (selectedTab === 'ALL') return true;
      return v.category === selectedTab;
    });
  }, [vouchers, selectedTab]);

  return (
    <div className="min-w-0 flex-1 space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-linear-to-r from-orange-600 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <Gift size={14} /> Ví Khuyến Mãi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Kho Voucher & Ưu Đãi</h1>
          <p className="mt-2 text-sm text-orange-50 leading-relaxed">
            Thu thập mã giảm giá độc quyền, voucher freeship và ưu đãi thành viên để tận hưởng mua sắm tiết kiệm nhất.
          </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-3">
          <span className="text-3xl font-black">{vouchers.filter((v) => !v.is_expired).length}</span>
          <div className="text-xs text-orange-50 leading-tight">
            <p className="font-bold">Mã khả dụng</p>
            <p className="text-[10px] text-white/80">Sẵn sàng áp dụng</p>
          </div>
        </div>
        <div className="absolute -right-5 -bottom-5 opacity-10 pointer-events-none">
          <Gift size={240} />
        </div>
      </div>

      {/* Voucher Input Bar */}
      <VoucherInputBar onAddVoucher={handleAddVoucher} />

      {/* Tabs Filter */}
      <VoucherTabsFilter
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        vouchers={vouchers}
      />

      {/* Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVouchers.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
              <Gift size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Không có voucher nào trong mục này</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Nhập mã ưu đãi hoặc quay lại trang mua sắm để khám phá thêm các khuyến mãi mới nhất.
              </p>
            </div>
            <Link
              href="/user"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm"
            >
              <span>Khám Phá Cửa Hàng</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          filteredVouchers.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              isCopied={copiedCode === v.code}
              onCopy={handleCopy}
            />
          ))
        )}
      </div>
    </div>
  );
}
