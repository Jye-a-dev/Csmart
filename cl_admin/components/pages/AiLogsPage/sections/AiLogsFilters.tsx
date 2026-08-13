'use client';

import { Search } from 'lucide-react';

export const ENDPOINTS = ['ALL', 'classify-intent', 'extract-ner', 'text-to-sql', 'search/hybrid', 'ocr', 'ask-faq'];

interface AiLogsFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  endpointFilter: string;
  setEndpointFilter: (ep: string) => void;
  flagFilter: 'ALL' | 'FLAGGED' | 'CLEAN';
  setFlagFilter: (f: 'ALL' | 'FLAGGED' | 'CLEAN') => void;
}

export function AiLogsFilters({
  search,
  setSearch,
  endpointFilter,
  setEndpointFilter,
  flagFilter,
  setFlagFilter,
}: AiLogsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400"><Search size={14} /></div>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm endpoint, input text..." className="w-full pl-9 pr-4 py-2.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white shadow-[2px_2px_0px_0px_#09090B]" />
      </div>
      <select value={endpointFilter} onChange={(e) => setEndpointFilter(e.target.value)} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
        {ENDPOINTS.map((ep) => <option key={ep} value={ep}>{ep === 'ALL' ? 'Tất cả endpoint' : ep}</option>)}
      </select>
      <select value={flagFilter} onChange={(e) => setFlagFilter(e.target.value as typeof flagFilter)} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
        <option value="ALL">Tất cả</option>
        <option value="FLAGGED">🚩 Flagged</option>
        <option value="CLEAN">✓ Sạch</option>
      </select>
    </div>
  );
}
