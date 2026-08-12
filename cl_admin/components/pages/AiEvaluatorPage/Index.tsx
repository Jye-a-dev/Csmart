'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAiLogs, useAiTasks } from '@/hooks';
import { AiRequestLog } from '@/types/ai/log';
import { FlaskConical, RefreshCw, Play, Download, CheckCircle, AlertTriangle, TrendingDown, Loader2 } from 'lucide-react';

export default function AiEvaluatorPage() {
  // AI Evaluator component with ChatML dataset manager
  const { loading: logsLoading, findAllLogs } = useAiLogs();
  const { loading: taskLoading, submitEvaluate, getStatus } = useAiTasks();

  const [logs, setLogs] = useState<AiRequestLog[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [showRawInput, setShowRawInput] = useState(false);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImportTextJson = () => {
    if (!rawJsonInput.trim()) {
      showToast('Nội dung Text JSON/JSONL không được để trống', 'err');
      return;
    }
    try {
      const text = rawJsonInput.trim();
      let lines = text.split('\n').filter((l) => l.trim());
      if (text.startsWith('[') && text.endsWith(']')) {
        const parsedArray = JSON.parse(text);
        if (Array.isArray(parsedArray)) {
          lines = parsedArray.map((item) => JSON.stringify(item));
        }
      }
      let validCount = 0;
      lines.forEach((line) => {
        const parsed = JSON.parse(line);
        if (parsed.messages && Array.isArray(parsed.messages)) validCount++;
      });
      showToast(`Đã import thành công ${validCount}/${lines.length} samples ChatML JSONL từ Text Input`);
      setRawJsonInput('');
      setShowRawInput(false);
    } catch {
      showToast('Nội dung không đúng định dạng JSON/JSONL ChatML chuẩn', 'err');
    }
  };

  const load = useCallback(async () => {
    try {
      const data = await findAllLogs({ limit: 1000 });
      setLogs(data || []);
    } catch {
      console.error('Failed to load logs for evaluator');
    }
  }, [findAllLogs]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  // Poll job status when jobId is set
  useEffect(() => {
    if (!jobId) return;
    const poll = setInterval(async () => {
      try {
        const res = await getStatus('eval', jobId);
        setJobStatus(res.status);
        if (res.status === 'completed' || res.status === 'failed') {
          clearInterval(poll);
          showToast(res.status === 'completed' ? 'Evaluate job hoàn thành!' : `Job thất bại: ${res.failedReason}`, res.status === 'completed' ? 'ok' : 'err');
        }
      } catch {
        clearInterval(poll);
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [jobId, getStatus]);

  const handleRunEvaluate = async () => {
    try {
      const res = await submitEvaluate();
      setJobId(res.jobId);
      setJobStatus('active');
      showToast(`Đã khởi động evaluate job: ${res.jobId}`);
    } catch {
      showToast('Không thể khởi động evaluate job', 'err');
    }
  };

  // Build ChatML JSONL format for flagged or available logs
  const handleExportJsonl = () => {
    const targetLogs = logs.filter((l) => l.flag_for_review);
    const exportLogs = targetLogs.length > 0 ? targetLogs : logs;
    if (exportLogs.length === 0) {
      showToast('Không có log nào để export', 'err');
      return;
    }
    const lines = exportLogs.map((log) => {
      const entry = {
        messages: [
          { role: 'system', content: `You are an AI assistant for ${log.endpoint} endpoint.` },
          { role: 'user', content: log.input_text ?? '' },
          { role: 'assistant', content: typeof log.output_json === 'string' ? log.output_json : JSON.stringify(log.output_json) },
        ],
        metadata: {
          log_id: log.id,
          endpoint: log.endpoint,
          confidence_score: log.confidence_score,
          execution_time_ms: log.execution_time_ms,
          created_at: log.created_at,
        },
      };
      return JSON.stringify(entry);
    });
    const blob = new Blob([lines.join('\n')], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csmart_finetune_${new Date().toISOString().slice(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã export ${exportLogs.length} samples dạng ChatML JSONL`);
  };

  const totalLogs = logs.length;
  const flaggedLogs = logs.filter((l) => l.flag_for_review);
  const flagRate = totalLogs ? ((flaggedLogs.length / totalLogs) * 100).toFixed(1) : '0';
  const avgConf = totalLogs ? (logs.reduce((s, l) => s + (l.confidence_score ?? 0), 0) / totalLogs * 100).toFixed(1) : '0';
  const endpointBreakdown = Object.entries(
    logs.reduce((acc, l) => {
      acc[l.endpoint] = (acc[l.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const flaggedByEndpoint = Object.entries(
    flaggedLogs.reduce((acc, l) => {
      acc[l.endpoint] = (acc[l.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#09090B] text-[#F97316]"><FlaskConical size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">AI Evaluator</h1>
          </div>
          <p className="font-mono text-xs text-zinc-500">Fine-Tuning Hub — Đánh giá độ chính xác & xuất dữ liệu huấn luyện</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
            <RefreshCw size={15} className={logsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng Logs', value: totalLogs, icon: CheckCircle, color: 'bg-blue-400' },
          { label: 'Flagged', value: flaggedLogs.length, icon: AlertTriangle, color: 'bg-amber-400' },
          { label: 'Tỷ lệ lỗi', value: `${flagRate}%`, icon: TrendingDown, color: 'bg-rose-400' },
          { label: 'Avg Confidence', value: `${avgConf}%`, icon: FlaskConical, color: 'bg-purple-400' },
        ].map((s) => (
          <div key={s.label} className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-4">
            <div className={`inline-flex p-2 mb-3 ${s.color} border-2 border-[#09090B]`}><s.icon size={16} /></div>
            <div className="font-mono text-2xl font-black text-[#09090B]">{s.value}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Run Evaluate Job */}
        <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Play size={18} className="text-[#F97316]" />
            <h2 className="font-mono font-black text-sm uppercase text-[#09090B]">Chạy Evaluate Job</h2>
          </div>
          <p className="font-mono text-xs text-zinc-500">Khởi động background job đánh giá toàn bộ logs trong queue BullMQ. Job sẽ cập nhật metrics confidence và flag bất thường.</p>
          {jobId && (
            <div className="p-3 border-2 border-[#09090B] bg-zinc-50 font-mono text-xs space-y-1">
              <div className="text-zinc-500">Job ID: <span className="font-black text-[#09090B]">{jobId}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Status:</span>
                {jobStatus === 'active' || jobStatus === 'waiting' ? (
                  <span className="flex items-center gap-1 text-amber-600 font-black"><Loader2 size={12} className="animate-spin" />{jobStatus?.toUpperCase()}</span>
                ) : jobStatus === 'completed' ? (
                  <span className="text-emerald-600 font-black">COMPLETED ✓</span>
                ) : (
                  <span className="text-rose-600 font-black">{jobStatus?.toUpperCase()}</span>
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleRunEvaluate}
            disabled={taskLoading || jobStatus === 'active' || jobStatus === 'waiting'}
            className="w-full py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {taskLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Chạy Evaluate
          </button>
        </div>

        {/* Export & Import Fine-Tune Dataset */}
        <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[#F97316]" />
            <h2 className="font-mono font-black text-sm uppercase text-[#09090B]">Fine-Tune Dataset Manager</h2>
          </div>
          <p className="font-mono text-xs text-zinc-500">
            Xuất dữ liệu <span className="font-black text-amber-600">{flaggedLogs.length} flagged</span> / <span className="font-black text-[#09090B]">{totalLogs} tổng logs</span> dạng ChatML <code className="bg-zinc-100 px-1">.jsonl</code> để fine-tune Qwen2.5 local, hoặc import dataset bên ngoài.
          </p>
          
          <div className="p-3 border-2 border-dashed border-zinc-300 font-mono text-[10px] text-zinc-400 bg-zinc-50">
            <div>{'{ "messages": ['}</div>
            <div className="pl-4">{'{ "role": "system", "content": "..." },'}</div>
            <div className="pl-4">{'{ "role": "user", "content": "input_text" },'}</div>
            <div className="pl-4">{'{ "role": "assistant", "content": "output_json" }'}</div>
            <div>{'] }  // ChatML format'}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExportJsonl}
              disabled={totalLogs === 0}
              className="py-3 border-2 border-[#09090B] bg-[#09090B] text-white font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Export Dataset (.jsonl)
            </button>

            <label className="py-3 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 text-center">
              <Download size={14} className="rotate-180" />
              Import File (.jsonl)
              <input
                type="file"
                accept=".jsonl,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const text = event.target?.result as string;
                      const lines = text.split('\n').filter((l) => l.trim());
                      let validCount = 0;
                      lines.forEach((line) => {
                        const parsed = JSON.parse(line);
                        if (parsed.messages && Array.isArray(parsed.messages)) validCount++;
                      });
                      showToast(`Đã import thành công ${validCount}/${lines.length} samples ChatML JSONL`);
                    } catch {
                      showToast('File không đúng định dạng .jsonl ChatML chuẩn', 'err');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          {/* Raw Text JSON/JSONL Direct Input */}
          <div className="pt-2">
            <button
              onClick={() => setShowRawInput(!showRawInput)}
              className="font-mono text-xs font-black uppercase text-[#F97316] hover:underline cursor-pointer flex items-center gap-1"
            >
              {showRawInput ? '▲ Ẩn Nhập Text JSON' : '▼ Nhập Trực Tiếp Text JSON / JSONL'}
            </button>

            {showRawInput && (
              <div className="mt-3 space-y-3 p-3 border-2 border-[#09090B] bg-zinc-50 shadow-[2px_2px_0px_0px_#09090B]">
                <textarea
                  value={rawJsonInput}
                  onChange={(e) => setRawJsonInput(e.target.value)}
                  placeholder={`Dán chuỗi JSON/JSONL ChatML vào đây...\nVí dụ:\n{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}`}
                  rows={5}
                  className="w-full p-3 font-mono text-xs bg-white border-2 border-[#09090B] focus:outline-none resize-y"
                />
                <button
                  onClick={handleImportTextJson}
                  className="w-full py-2 bg-[#09090B] text-white font-mono font-black text-xs uppercase border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#F97316] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  Validate & Import Text JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown by Endpoint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-[#09090B] bg-white shadow-[4px_4px_0px_0px_#09090B] p-5">
          <h3 className="font-mono font-black text-xs uppercase mb-4 text-[#09090B] border-b-2 border-[#09090B] pb-2">Phân bổ Calls / Endpoint</h3>
          <div className="space-y-2">
            {endpointBreakdown.map(([ep, count]) => (
              <div key={ep} className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-500 w-36 truncate">{ep}</span>
                <div className="flex-1 bg-zinc-100 h-5 border border-zinc-200 relative overflow-hidden">
                  <div className="h-full bg-[#09090B] transition-all" style={{ width: `${(count / totalLogs) * 100}%` }} />
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
                    <div className="h-full bg-rose-500 transition-all" style={{ width: `${(count / (flaggedLogs.length || 1)) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs font-black text-rose-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
