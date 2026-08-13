'use client';

import { AiRequestLog } from '@/types/ai/log';
import { AlertTriangle, Filter, Clock, Zap } from 'lucide-react';

interface HitlStatsProps {
  logs: AiRequestLog[];
  filteredCount: number;
}

export function HitlStats({ logs, filteredCount }: HitlStatsProps) {
  const avgLatency = Math.round(
    logs.reduce((s, l) => s + (l.execution_time_ms ?? 0), 0) / (logs.length || 1)
  );
  const endpointCount = new Set(logs.map((l) => l.endpoint)).size;

  const stats = [
    { label: 'Chờ duyệt', value: logs.length, icon: AlertTriangle, color: 'bg-amber-400' },
    { label: 'Lọc hiện tại', value: filteredCount, icon: Filter, color: 'bg-blue-400' },
    { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: 'bg-purple-400' },
    { label: 'Endpoints', value: endpointCount, icon: Zap, color: 'bg-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-4">
          <div className={`inline-flex p-2 mb-3 ${s.color} border-2 border-[#09090B]`}>
            <s.icon size={16} />
          </div>
          <div className="font-mono text-2xl font-black text-[#09090B]">{s.value}</div>
          <div className="font-mono text-xs text-zinc-500 uppercase">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
