'use client';

import { PaymentMethod, PaymentStatus } from '@/types/entities/payment';

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: 'COD',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản',
  [PaymentMethod.MOMO]: 'MoMo',
  [PaymentMethod.VNPAY]: 'VNPay',
};

interface MethodBreakdownItem {
  method: PaymentMethod;
  count: number;
  amount: number;
}

interface StatusConfigItem {
  label: string;
  cls: string;
  icon: React.ElementType;
}

interface PaymentsBreakdownProps {
  methodBreakdown: MethodBreakdownItem[];
  totalPaymentsCount: number;
  fmt: (n: number) => string;
  statusConfig: Record<PaymentStatus, StatusConfigItem>;
  statusCounts: Record<PaymentStatus, number>;
}

export function PaymentsBreakdown({
  methodBreakdown,
  totalPaymentsCount,
  fmt,
  statusConfig,
  statusCounts,
}: PaymentsBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Method Breakdown */}
      <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-5">
        <h3 className="font-mono font-black text-xs uppercase mb-4 pb-2 border-b-2 border-[#09090B]">Phân bổ theo Cổng thanh toán</h3>
        <div className="space-y-2">
          {methodBreakdown.map((m) => (
            <div key={m.method} className="flex items-center gap-3 font-mono text-xs">
              <span className="w-28 text-zinc-500 shrink-0">{METHOD_LABELS[m.method]}</span>
              <div className="flex-1 bg-zinc-100 h-5 border border-zinc-200 relative overflow-hidden">
                <div className="h-full bg-[#F97316] transition-all" style={{ width: `${(m.count / (totalPaymentsCount || 1)) * 100}%` }} />
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
            const count = statusCounts[s] ?? 0;
            const cfg = statusConfig[s];
            return (
              <div key={s} className="flex items-center gap-3">
                <div className={`px-2 py-1 font-mono text-[10px] font-black flex items-center gap-1 ${cfg.cls} w-32 shrink-0`}>
                  <cfg.icon size={10} />{cfg.label}
                </div>
                <div className="flex-1 bg-zinc-100 h-4 border border-zinc-200 overflow-hidden">
                  <div className="h-full bg-[#09090B] transition-all" style={{ width: `${(count / (totalPaymentsCount || 1)) * 100}%` }} />
                </div>
                <span className="font-mono text-xs font-black text-[#09090B] w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
