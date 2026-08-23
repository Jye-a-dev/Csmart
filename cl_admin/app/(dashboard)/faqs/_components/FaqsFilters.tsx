'use client';

import { Search } from 'lucide-react';

interface FaqsFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  topicFilter: string;
  setTopicFilter: (t: string) => void;
  topics: string[];
}

export function FaqsFilters({
  search,
  setSearch,
  topicFilter,
  setTopicFilter,
  topics,
}: FaqsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400"><Search size={14} /></div>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm câu hỏi, câu trả lời..." className="w-full pl-9 pr-4 py-2.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white shadow-[2px_2px_0px_0px_#09090B]" />
      </div>
      <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="border-2 border-[#09090B] font-mono text-xs px-3 py-2.5 bg-white focus:outline-none shadow-[2px_2px_0px_0px_#09090B]">
        {topics.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'Tất cả topic' : t}</option>)}
      </select>
    </div>
  );
}
