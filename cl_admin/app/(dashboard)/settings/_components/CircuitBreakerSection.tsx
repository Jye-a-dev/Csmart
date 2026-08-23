'use client';

import { CircuitBreakerState } from '@/types/ai/task';
import { Shield, RefreshCw, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const CIRCUIT_CONFIG: Record<CircuitBreakerState['state'], { label: string; cls: string; icon: React.ElementType; desc: string }> = {
  CLOSED: { label: 'CLOSED — Hoạt động bình thường', cls: 'bg-emerald-400 text-[#09090B]', icon: CheckCircle, desc: 'AI Microservices đang hoạt động ổn định. Tất cả requests được phép đi qua.' },
  OPEN: { label: 'OPEN — Ngừng hoạt động', cls: 'bg-rose-400 text-white', icon: XCircle, desc: 'Circuit breaker đang MỞ. Tất cả AI requests bị chặn để bảo vệ hệ thống.' },
  HALF_OPEN: { label: 'HALF_OPEN — Đang thử nghiệm phục hồi', cls: 'bg-amber-400 text-[#09090B]', icon: AlertTriangle, desc: 'Circuit breaker đang ở trạng thái thử nghiệm. Một số requests sẽ được phép để kiểm tra.' },
};

interface CircuitBreakerSectionProps {
  circuit: CircuitBreakerState | null;
  circuitLoading: boolean;
  onRefresh: () => void;
}

export function CircuitBreakerSection({ circuit, circuitLoading, onRefresh }: CircuitBreakerSectionProps) {
  const circuitCfg = circuit ? CIRCUIT_CONFIG[circuit.state] : null;

  return (
    <section className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-5 py-3 font-mono text-xs font-black uppercase flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[#F97316]" />
          Circuit Breaker — AI Microservices
        </div>
        <button onClick={onRefresh} className="text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1">
          <RefreshCw size={12} className={circuitLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      <div className="p-5">
        {circuitLoading ? (
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
            <Loader2 size={14} className="animate-spin" /> Đang lấy trạng thái...
          </div>
        ) : circuit && circuitCfg ? (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 px-4 py-3 border-2 border-[#09090B] font-mono font-black text-sm ${circuitCfg.cls}`}>
              <circuitCfg.icon size={20} />
              {circuitCfg.label}
            </div>
            <p className="font-mono text-xs text-zinc-500">{circuitCfg.desc}</p>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 border-2 border-[#09090B] bg-zinc-50">
                <div className="text-zinc-500 uppercase mb-1">Số lần thất bại</div>
                <div className="text-2xl font-black text-[#09090B]">{circuit.failuresCount}</div>
              </div>
              <div className="p-3 border-2 border-[#09090B] bg-zinc-50">
                <div className="text-zinc-500 uppercase mb-1">Thất bại gần nhất</div>
                <div className="font-black text-[#09090B]">
                  {circuit.lastFailureTime
                    ? new Date(circuit.lastFailureTime).toLocaleString('vi-VN')
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-zinc-400 italic">Không thể lấy trạng thái Circuit Breaker.</p>
        )}
      </div>
    </section>
  );
}
