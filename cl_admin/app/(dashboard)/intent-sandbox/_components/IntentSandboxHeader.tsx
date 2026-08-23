'use client';

import { Target } from 'lucide-react';

export function IntentSandboxHeader() {
  return (
    <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-[#F97316] text-[#09090B] p-2 border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B]">
            <Target size={20} />
          </div>
          <h1 className="font-mono text-2xl font-black uppercase tracking-tight text-[#09090B]">
            INTENT CLASSIFICATION SANDBOX
          </h1>
        </div>
        <p className="font-mono text-xs text-zinc-600 font-bold">
          Thử nghiệm và đánh giá khả năng nhận diện ý định (Intent) & bóc tách Entity
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-black bg-[#FAFAFA] border-2 border-[#09090B] px-3 py-1.5 shadow-[2px_2px_0px_0px_#09090B]">
          ENDPOINT: POST /ai/intent
        </span>
      </div>
    </div>
  );
}
