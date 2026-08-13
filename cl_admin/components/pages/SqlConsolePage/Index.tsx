'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/libs/api-client';
import {
  SqlConsoleHeader,
  SqlConsoleInput,
  SqlConsoleResult,
  SqlConsoleHistory,
  SqlResult,
  HistoryEntry,
} from './sections';

const HISTORY_KEY = 'csmart_sql_console_history';

export default function SqlConsolePage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<SqlResult | null>(null);
  const [loading, setLoading] = useState(false);
  const isExecutingRef = useRef(false);
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

  const saveHistory = (entries: HistoryEntry[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 20)));
  };

  const handleRun = async () => {
    if (!question.trim() || isExecutingRef.current) return;
    isExecutingRef.current = true;
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
      setHistory((prev) => {
        const updated = [entry, ...prev];
        saveHistory(updated);
        return updated;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setResult({ generated_sql: '', error: msg });
    } finally {
      isExecutingRef.current = false;
      setLoading(false);
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
      {/* Header Section */}
      <SqlConsoleHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input + Result */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Input Section */}
          <SqlConsoleInput
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            onRun={handleRun}
          />

          {/* Result Section */}
          <SqlConsoleResult
            result={result}
            copied={copied}
            onCopySql={handleCopySql}
          />
        </div>

        {/* Right Column: History Section */}
        <SqlConsoleHistory
          history={history}
          onSelectQuery={setQuestion}
          onClearHistory={handleClearHistory}
        />
      </div>
    </div>
  );
}
