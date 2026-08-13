'use client';

interface EvaluatorBreakdownSectionProps {
  endpointBreakdown: [string, number][];
  flaggedByEndpoint: [string, number][];
  totalLogs: number;
  flaggedCount: number;
}

export function EvaluatorBreakdownSection({
  endpointBreakdown,
  flaggedByEndpoint,
  totalLogs,
  flaggedCount,
}: EvaluatorBreakdownSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-5">
        <h3 className="font-mono font-black text-xs uppercase mb-4 text-[#09090B] border-b-2 border-[#09090B] pb-2">Phân bổ Calls / Endpoint</h3>
        <div className="space-y-2">
          {endpointBreakdown.map(([ep, count]) => (
            <div key={ep} className="flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-500 w-36 truncate">{ep}</span>
              <div className="flex-1 bg-zinc-100 h-5 border border-zinc-200 relative overflow-hidden">
                <div className="h-full bg-[#09090B] transition-all" style={{ width: `${(count / (totalLogs || 1)) * 100}%` }} />
              </div>
              <span className="font-mono text-xs font-black text-[#09090B] w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-5">
        <h3 className="font-mono font-black text-xs uppercase mb-4 text-rose-600 border-b-2 border-[#09090B] pb-2">Flagged / Endpoint</h3>
        {flaggedByEndpoint.length === 0 ? (
          <p className="font-mono text-xs text-zinc-400 italic">Không có logs flagged nào.</p>
        ) : (
          <div className="space-y-2">
            {flaggedByEndpoint.map(([ep, count]) => (
              <div key={ep} className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-500 w-36 truncate">{ep}</span>
                <div className="flex-1 bg-zinc-100 h-5 border border-zinc-200 relative overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all" style={{ width: `${(count / (flaggedCount || 1)) * 100}%` }} />
                </div>
                <span className="font-mono text-xs font-black text-rose-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
