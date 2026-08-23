'use client';

import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentsStatsProps {
  totalAmountStr: string;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
}

export function PaymentsStats({ totalAmountStr, completedCount, failedCount, pendingCount }: PaymentsStatsProps) {
  const statsList = [
    { label: 'Doanh thu', value: totalAmountStr, icon: DollarSign, color: 'bg-emerald-400' },
    { label: 'Thành công', value: completedCount, icon: CheckCircle, color: 'bg-blue-400' },
    { label: 'Thất bại', value: failedCount, icon: XCircle, color: 'bg-rose-400' },
    { label: 'Chờ thanh toán', value: pendingCount, icon: Clock, color: 'bg-amber-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsList.map((s) => (
        <div key={s.label} className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-4">
          <div className={`inline-flex p-2 mb-3 ${s.color} border-2 border-[#09090B]`}><s.icon size={16} /></div>
          <div className="font-mono text-xl font-black text-[#09090B] leading-tight">{s.value}</div>
          <div className="font-mono text-xs text-zinc-500 uppercase">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
