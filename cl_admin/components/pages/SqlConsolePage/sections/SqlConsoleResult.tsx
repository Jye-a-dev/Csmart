'use client';

import { Clock, Copy, AlertTriangle } from 'lucide-react';

export interface SqlResult {
  generated_sql: string;
  result?: unknown[];
  guardrail_warnings?: string[];
  error?: string;
  execution_time_ms?: number;
}

interface SqlConsoleResultProps {
  result: SqlResult | null;
  copied: boolean;
  onCopySql: () => void;
}

export function SqlConsoleResult({ result, copied, onCopySql }: SqlConsoleResultProps) {
  if (!result) return null;

  return (
    <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] space-y-0">
      {/* Generated SQL */}
      <div className="border-b-2 border-[#09090B]">
        <div className="bg-[#09090B] text-emerald-400 px-4 py-2 font-mono text-xs font-black flex items-center justify-between">
          <span>Generated SQL</span>
          <div className="flex items-center gap-3">
            {result.execution_time_ms && (
              <span className="flex items-center gap-1 text-zinc-400"><Clock size={11} />{result.execution_time_ms}ms</span>
            )}
            <button onClick={onCopySql} className="flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer">
              <Copy size={11} />{copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <pre className="p-4 bg-[#09090B] text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {result.generated_sql || 'Không có SQL được tạo'}
        </pre>
      </div>

      {/* Guardrail Warnings */}
      {result.guardrail_warnings && result.guardrail_warnings.length > 0 && (
        <div className="border-b-2 border-[#09090B] p-4 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber-600" />
            <span className="font-mono text-xs font-black text-amber-700 uppercase">Guardrail Warnings</span>
          </div>
          <ul className="space-y-1">
            {result.guardrail_warnings.map((w, i) => (
              <li key={i} className="font-mono text-xs text-amber-700 flex items-start gap-1">
                <span className="mt-0.5">⚠</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error */}
      {result.error && (
        <div className="border-b-2 border-[#09090B] p-4 bg-rose-50">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-rose-600" />
            <span className="font-mono text-xs font-black text-rose-700 uppercase">Lỗi</span>
          </div>
          <p className="font-mono text-xs text-rose-600">{result.error}</p>
        </div>
      )}

      {/* Query Result */}
      {result.result && result.result.length > 0 && (
        <div>
          <div className="bg-zinc-100 border-b-2 border-[#09090B] px-4 py-2 font-mono text-xs font-black text-zinc-600 uppercase">
            Kết quả — {result.result.length} rows
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full font-mono text-xs">
              <thead className="sticky top-0 bg-zinc-50 border-b-2 border-[#09090B]">
                <tr>
                  {Object.keys(result.result[0] as object).map((k) => (
                    <th key={k} className="px-3 py-2 text-left font-black text-[#09090B] whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.result.map((row, i) => (
                  <tr key={i} className={`border-t border-zinc-200 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}`}>
                    {Object.values(row as object).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-zinc-600 max-w-50 truncate">{String(val ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
