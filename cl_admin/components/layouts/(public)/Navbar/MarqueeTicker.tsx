'use client';

export default function MarqueeTicker() {
  const items = [
    "PIPELINE ENGINE: ONLINE (FastAPI / Qwen2.5-1.5B)",
    "TEXT-TO-SQL: SELECT-ONLY GUARDRAIL ENABLED",
    "HITL QUEUE: 5 REQUESTS PENDING",
    "CLUSTER STATUS: LOCAL MONOREPO ACTIVE",
  ];

  const tickerText = items.join("   //   ");

  return (
    <div className="w-full overflow-hidden bg-zinc-950 text-[#FAFAFA] font-mono text-xs border-b-2 border-zinc-950 py-2.5 uppercase tracking-wider select-none">
      <div className="flex w-full">
        <div className="animate-marquee whitespace-nowrap flex gap-12">
          <span>{tickerText}</span>
          <span>{tickerText}</span>
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>
    </div>
  );
}
