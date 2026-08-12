'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/libs/api-client';
import { DatabaseZap, Play, Trash2, Clock, AlertTriangle, ChevronRight, Copy } from 'lucide-react';

interface SqlResult {
  generated_sql: string;
  result?: unknown[];
  guardrail_warnings?: string[];
  error?: string;
  execution_time_ms?: number;
}

interface HistoryEntry {
  question: string;
  sql: string;
  timestamp: string;
  hasError: boolean;
}

const HISTORY_KEY = 'csmart_sql_console_history';

export default function SqlConsolePage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<SqlResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? (JSON.parse(stored) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const saveHistory = (entries: HistoryEntry[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 20)));
  };

  const handleRun = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await apiClient<SqlResult>('/ai/sql', {
        method: 'POST',
        body: { question: question.trim() },
      });
      setResult(res);
      const entry: HistoryEntry = {
        question: question.trim(),
        sql: res.generated_sql ?? '',
        timestamp: new Date().toISOString(),
        hasError: !!res.error,
      };
      const updated = [entry, ...history];
      setHistory(updated);
      saveHistory(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setResult({ generated_sql: '', error: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleRun();
    }
  };

  const handleCopySql = async () => {
    if (!result?.generated_sql) return;
    await navigator.clipboard.writeText(result.generated_sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#09090B] text-[#F97316]"><DatabaseZap size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">SQL Console</h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">Text-to-SQL Sandbox — Nhập tiếng Việt tự nhiên, nhận SQL tức thì</p>
        </div>
        <div className="hidden md:flex items-center gap-2 border-2 border-[#09090B] px-3 py-1.5 bg-[#FAFAFA] shadow-[2px_2px_0px_0px_#09090B] font-mono text-[10px] font-black text-zinc-600">
          <kbd className="bg-zinc-200 px-1.5 py-0.5 border border-zinc-300">Ctrl</kbd>+<kbd className="bg-zinc-200 px-1.5 py-0.5 border border-zinc-300">Enter</kbd>
          <span>để chạy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input + Result */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Input */}
          <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B]">
            <div className="bg-[#09090B] text-[#FAFAFA] px-4 py-2 font-mono text-xs font-black uppercase flex items-center gap-2">
              <ChevronRight size={14} className="text-[#F97316]" />
              Câu hỏi tiếng Việt
            </div>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="VD: Cho tôi biết 10 sản phẩm bán chạy nhất tháng này&#10;VD: Danh sách đơn hàng bị hủy trong tuần qua&#10;VD: Tổng doanh thu theo từng phương thức thanh toán"
              rows={5}
              className="w-full p-4 font-mono text-sm bg-white focus:outline-none resize-none text-[#09090B] placeholder:text-zinc-400"
            />
            <div className="border-t-2 border-[#09090B] p-3 flex justify-end">
              <button
                onClick={handleRun}
                disabled={loading || !question.trim()}
                className="px-6 py-2.5 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={14} />
                {loading ? 'Đang xử lý...' : 'Chạy Query'}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] space-y-0">
              {/* Generated SQL */}
              <div className="border-b-2 border-[#09090B]">
                <div className="bg-[#09090B] text-emerald-400 px-4 py-2 font-mono text-xs font-black flex items-center justify-between">
                  <span>Generated SQL</span>
                  <div className="flex items-center gap-3">
                    {result.execution_time_ms && (
                      <span className="flex items-center gap-1 text-zinc-400"><Clock size={11} />{result.execution_time_ms}ms</span>
                    )}
                    <button onClick={handleCopySql} className="flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer">
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
          )}
        </div>

        {/* Right: Query History */}
        <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] h-fit">
          <div className="bg-[#09090B] text-[#FAFAFA] px-4 py-2 font-mono text-xs font-black uppercase flex items-center justify-between">
            <span>Lịch sử Queries</span>
            {history.length > 0 && (
              <button onClick={handleClearHistory} className="text-zinc-400 hover:text-rose-400 cursor-pointer flex items-center gap-1">
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
                  onClick={() => setQuestion(h.question)}
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
      </div>
    </div>
  );
}
