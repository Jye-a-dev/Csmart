'use client';

import { Payment, PaymentStatus } from '@/types/entities/payment';
import { METHOD_LABELS } from './PaymentsBreakdown';

interface StatusConfigItem {
  label: string;
  cls: string;
  icon: React.ElementType;
}

interface PaymentsTableProps {
  loading: boolean;
  filtered: Payment[];
  fmt: (n: number) => string;
  statusConfig: Record<PaymentStatus, StatusConfigItem>;
}

export function PaymentsTable({ loading, filtered, fmt, statusConfig }: PaymentsTableProps) {
  if (loading && filtered.length === 0) {
    return <div className="text-center py-16 font-mono text-zinc-500 italic">Đang tải giao dịch...</div>;
  }

  return (
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
            const cfg = statusConfig[p.payment_status];
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
  );
}
