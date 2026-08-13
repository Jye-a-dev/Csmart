'use client';

import { Trash2 } from 'lucide-react';

export interface HistoryEntry {
  question: string;
  sql: string;
  timestamp: string;
  hasError: boolean;
}

interface SqlConsoleHistoryProps {
  history: HistoryEntry[];
  onSelectQuery: (q: string) => void;
  onClearHistory: () => void;
}

export function SqlConsoleHistory({ history, onSelectQuery, onClearHistory }: SqlConsoleHistoryProps) {
  return (
    <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] h-fit">
      <div className="bg-[#09090B] text-[#FAFAFA] px-4 py-2 font-mono text-xs font-black uppercase flex items-center justify-between">
        <span>Lịch sử Queries</span>
        {history.length > 0 && (
          <button onClick={onClearHistory} className="text-zinc-400 hover:text-rose-400 cursor-pointer flex items-center gap-1">
            <Trash2 size={12} /> Xóa
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="p-6 text-center font-mono text-xs text-zinc-400 italic">Chưa có query nào.</div>
      ) : (
        <div className="divide-y-2 divide-[#09090B] max-h-150 overflow-y-auto">
          {history.map((h, i) => (
            <button
              key={i}
              onClick={() => onSelectQuery(h.question)}
              className="w-full text-left p-3 hover:bg-zinc-50 transition-colors space-y-1 cursor-pointer"
            >
              <p className="font-mono text-xs font-black text-[#09090B] line-clamp-2">{h.question}</p>
              <p className="font-mono text-[10px] text-zinc-400 line-clamp-1 italic">{h.sql || 'No SQL'}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-400">{new Date(h.timestamp).toLocaleTimeString('vi-VN')}</span>
                {h.hasError && <span className="text-[10px] text-rose-500 font-black">ERR</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
