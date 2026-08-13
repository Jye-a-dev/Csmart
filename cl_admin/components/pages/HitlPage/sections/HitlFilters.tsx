'use client';

export const ENDPOINTS = ['classify-intent', 'extract-ner', 'text-to-sql', 'search/hybrid', 'ocr', 'ask-faq'];

interface HitlFiltersProps {
  endpointFilter: string;
  setEndpointFilter: (ep: string) => void;
  confidenceMax: number;
  setConfidenceMax: (val: number) => void;
}

export function HitlFilters({
  endpointFilter,
  setEndpointFilter,
  confidenceMax,
  setConfidenceMax,
}: HitlFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-[#09090B] bg-[#FAFAFA] shadow-[3px_3px_0px_0px_#09090B]">
      <div className="flex items-center gap-3 flex-1">
        <label className="font-mono text-xs font-black uppercase whitespace-nowrap">Endpoint:</label>
        <select
          value={endpointFilter}
          onChange={(e) => setEndpointFilter(e.target.value)}
          className="flex-1 border-2 border-[#09090B] font-mono text-xs px-3 py-2 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
        >
          <option value="ALL">Tất cả</option>
          {ENDPOINTS.map((ep) => <option key={ep} value={ep}>{ep}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3 flex-1">
        <label className="font-mono text-xs font-black uppercase whitespace-nowrap">
          Confidence ≤ {(confidenceMax * 100).toFixed(0)}%:
        </label>
        <input
          type="range"
          min={0} max={1} step={0.05}
          value={confidenceMax}
          onChange={(e) => setConfidenceMax(Number(e.target.value))}
          className="flex-1 accent-[#F97316]"
        />
      </div>
    </div>
  );
}
