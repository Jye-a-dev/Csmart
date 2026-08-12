'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePayments } from '@/hooks';
import { Payment, PaymentMethod, PaymentStatus } from '@/types/entities/payment';
import { CreditCard, RefreshCw, Search, CheckCircle, XCircle, Clock, RotateCcw, DollarSign } from 'lucide-react';

const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: 'COD',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản',
  [PaymentMethod.MOMO]: 'MoMo',
  [PaymentMethod.VNPAY]: 'VNPay',
};

const STATUS_CONFIG: Record<PaymentStatus, { label: string; cls: string; icon: React.ElementType }> = {
  [PaymentStatus.PENDING]: { label: 'Chờ thanh toán', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  [PaymentStatus.COMPLETED]: { label: 'Thành công', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  [PaymentStatus.FAILED]: { label: 'Thất bại', cls: 'bg-rose-100 text-rose-700', icon: XCircle },
  [PaymentStatus.REFUNDED]: { label: 'Hoàn tiền', cls: 'bg-orange-100 text-orange-700', icon: RotateCcw },
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function PaymentsPage() {
  const { loading, findAllPayments } = usePayments();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const load = useCallback(async () => {
    try {
      const data = await findAllPayments({ limit: 500 });
      setPayments(data || []);
    } catch {
      console.error('Failed to load payments');
    }
  }, [findAllPayments]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = payments.filter((p) => {
    const methodMatch = methodFilter === 'ALL' || p.payment_method === methodFilter;
    const statusMatch = statusFilter === 'ALL' || p.payment_status === statusFilter;
    const searchMatch = !search || String(p.order_id).includes(search) || (p.transaction_code ?? '').toLowerCase().includes(search.toLowerCase());
    return methodMatch && statusMatch && searchMatch;
  });

  // Stats
  const totalAmount = payments.filter((p) => p.payment_status === PaymentStatus.COMPLETED).reduce((s, p) => s + p.amount, 0);
  const completedCount = payments.filter((p) => p.payment_status === PaymentStatus.COMPLETED).length;
  const failedCount = payments.filter((p) => p.payment_status === PaymentStatus.FAILED).length;
  const pendingCount = payments.filter((p) => p.payment_status === PaymentStatus.PENDING).length;

  // Breakdown by method
  const methodBreakdown = Object.values(PaymentMethod).map((m) => ({
    method: m,
    count: payments.filter((p) => p.payment_method === m).length,
    amount: payments.filter((p) => p.payment_method === m && p.payment_status === PaymentStatus.COMPLETED).reduce((s, p) => s + p.amount, 0),
  })).filter((m) => m.count > 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#09090B] text-[#F97316]"><CreditCard size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">Thanh Toán</h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">Quản lý giao dịch qua các cổng thanh toán</p>
        </div>
        <button onClick={load} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 font-mono text-xs font-bold">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu', value: fmt(totalAmount), icon: DollarSign, color: 'bg-emerald-400' },
          { label: 'Thành công', value: completedCount, icon: CheckCircle, color: 'bg-blue-400' },
          { label: 'Thất bại', value: failedCount, icon: XCircle, color: 'bg-rose-400' },
          { label: 'Chờ thanh toán', value: pendingCount, icon: Clock, color: 'bg-amber-400' },
        ].map((s) => (
          <div key={s.label} className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-4">
            <div className={`inline-flex p-2 mb-3 ${s.color} border-2 border-[#09090B]`}><s.icon size={16} /></div>
            <div className="font-mono text-xl font-black text-[#09090B] leading-tight">{s.value}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-5">
          <h3 className="font-mono font-black text-xs uppercase mb-4 pb-2 border-b-2 border-[#09090B]">Phân bổ theo Cổng thanh toán</h3>
          <div className="space-y-2">
            {methodBreakdown.map((m) => (
              <div key={m.method} className="flex items-center gap-3 font-mono text-xs">
                <span className="w-28 text-zinc-500 shrink-0">{METHOD_LABELS[m.method]}</span>
                <div className="flex-1 bg-zinc-100 h-5 border border-zinc-200 relative overflow-hidden">
                  <div className="h-full bg-[#F97316] transition-all" style={{ width: `${(m.count / (payments.length || 1)) * 100}%` }} />
                </div>
                <span className="font-black text-[#09090B] w-6 text-right">{m.count}</span>
                <span className="text-zinc-400 w-28 text-right">{fmt(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-5">
          <h3 className="font-mono font-black text-xs uppercase mb-4 pb-2 border-b-2 border-[#09090B]">Phân bổ theo Trạng thái</h3>
          <div className="space-y-3">
            {Object.values(PaymentStatus).map((s) => {
              const count = payments.filter((p) => p.payment_status === s).length;
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`px-2 py-1 font-mono text-[10px] font-black flex items-center gap-1 ${cfg.cls} w-32 shrink-0`}>
                    <cfg.icon size={10} />{cfg.label}
                  </div>
                  <div className="flex-1 bg-zinc-100 h-4 border border-zinc-200 overflow-hidden">
                    <div className="h-full bg-[#09090B] transition-all" style={{ width: `${(count / (payments.length || 1)) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs font-black text-[#09090B] w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400"><Search size={14} /></div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm Order ID, mã giao dịch..." className="w-full pl-9 pr-4 py-2.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white shadow-[2px_2px_0px_0px_#09090B]" />
        </div>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'ALL')} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
          <option value="ALL">Tất cả phương thức</option>
          {Object.values(PaymentMethod).map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
          <option value="ALL">Tất cả trạng thái</option>
          {Object.values(PaymentStatus).map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading && filtered.length === 0 ? (
        <div className="text-center py-16 font-mono text-zinc-500 italic">Đang tải giao dịch...</div>
      ) : (
        <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="bg-[#09090B] text-white">
                {['#ID', 'Order ID', 'Phương thức', 'Số tiền', 'Mã GD', 'Trạng thái', 'Thanh toán lúc', 'Tạo lúc'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-black uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-zinc-400 italic">Không có giao dịch nào.</td></tr>
              ) : filtered.map((p, i) => {
                const cfg = STATUS_CONFIG[p.payment_status];
                return (
                  <tr key={p.id} className={`border-t-2 border-[#09090B] ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}>
                    <td className="px-4 py-3 font-black text-[#F97316]">#{p.id}</td>
                    <td className="px-4 py-3"><a href={`/orders/${p.order_id}`} className="font-black text-[#09090B] underline hover:text-[#F97316]">#{p.order_id}</a></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 border-2 border-[#09090B] bg-[#09090B] text-white text-[10px] font-black">{METHOD_LABELS[p.payment_method]}</span></td>
                    <td className="px-4 py-3 font-black text-[#09090B]">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono">{p.transaction_code ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 font-black text-[10px] flex items-center gap-1 w-fit ${cfg.cls}`}>
                        <cfg.icon size={10} />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{p.paid_at ? new Date(p.paid_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{new Date(p.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
