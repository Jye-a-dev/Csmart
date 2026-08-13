'use client';

import { Hash, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AiLogsStatsProps {
  totalLogs: number;
  flaggedCount: number;
  flagRate: string;
  avgLatency: number;
}

export function AiLogsStats({ totalLogs, flaggedCount, flagRate, avgLatency }: AiLogsStatsProps) {
  const statsList = [
    { label: 'Tổng logs', value: totalLogs, icon: Hash, color: 'bg-blue-400' },
    { label: 'Flagged', value: flaggedCount, icon: AlertTriangle, color: 'bg-amber-400' },
    { label: 'Flag Rate', value: `${flagRate}%`, icon: CheckCircle, color: 'bg-rose-400' },
    { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: 'bg-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsList.map((s) => (
        <div key={s.label} className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-4">
          <div className={`inline-flex p-2 mb-3 ${s.color} border-2 border-[#09090B]`}><s.icon size={16} /></div>
          <div className="font-mono text-2xl font-black text-[#09090B]">{s.value}</div>
          <div className="font-mono text-xs text-zinc-500 uppercase">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
