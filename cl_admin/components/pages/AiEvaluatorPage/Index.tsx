'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAiLogs, useAiTasks } from '@/hooks';
import { AiRequestLog } from '@/types/ai/log';
import {
  EvaluatorHeader,
  EvaluatorStats,
  EvaluatorRunJobSection,
  EvaluatorDatasetSection,
  EvaluatorBreakdownSection,
  EvaluatorDatasetPreview,
  EvaluatorSampleModal,
  ChatMLSample,
  ChatMLMessage,
} from './sections';

const evaluateSample = (parsed: { metadata?: { log_id?: string }; messages?: ChatMLMessage[] }, idx: number): ChatMLSample => {
  const id = parsed.metadata?.log_id ? String(parsed.metadata.log_id) : `SMP-${idx + 1}`;
  const messages: ChatMLMessage[] = Array.isArray(parsed.messages) ? parsed.messages : [];

  const hasUser = messages.some((m) => m.role === 'user' && m.content.trim().length > 0);
  const hasAssistant = messages.some((m) => m.role === 'assistant' && m.content.trim().length > 0);
  const assistantMsg = messages.find((m) => m.role === 'assistant')?.content ?? '';

  let score = 100;
  let notes = 'Cấu trúc thông điệp chuẩn xác.';
  let is_valid = true;

  if (!hasUser || !hasAssistant) {
    score = 30;
    is_valid = false;
    notes = 'Thiếu thông điệp từ User hoặc Assistant.';
  } else {
    // Check if assistant content is expected JSON and parses correctly
    if (assistantMsg.trim().startsWith('{') || assistantMsg.trim().startsWith('[')) {
      try {
        JSON.parse(assistantMsg.trim());
        score = 95;
        notes = 'Output chứa chuỗi JSON hợp lệ.';
      } catch {
        score = 60;
        notes = 'Assistant output chứa cú pháp JSON lỗi.';
      }
    }
  }

  const status: ChatMLSample['status'] = !is_valid ? 'invalid' : score >= 80 ? 'passed' : 'review_needed';

  return {
    id,
    messages,
    metadata: parsed.metadata,
    score,
    is_valid,
    status,
    notes,
  };
};

export default function AiEvaluatorPage() {
  const { loading: logsLoading, findAllLogs, createLog } = useAiLogs();
  const { loading: taskLoading, submitEvaluate, getStatus } = useAiTasks();

  const [logs, setLogs] = useState<AiRequestLog[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [showRawInput, setShowRawInput] = useState(false);
  const [savingToDb, setSavingToDb] = useState(false);

  // Imported Dataset Samples & Active Sample Modal state
  const [importedSamples, setImportedSamples] = useState<ChatMLSample[]>([]);
  const [selectedSample, setSelectedSample] = useState<ChatMLSample | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveToDbAndTrain = async () => {
    if (importedSamples.length === 0) {
      showToast('Không có sample nào để lưu vào DB', 'err');
      return;
    }
    setSavingToDb(true);
    try {
      let savedCount = 0;
      for (const sample of importedSamples) {
        const userMsg = sample.messages.find((m) => m.role === 'user')?.content ?? '';
        const assistantMsg = sample.messages.find((m) => m.role === 'assistant')?.content ?? '';
        const endpoint = sample.metadata?.endpoint || 'finetune/chatml';

        let parsedOutput: Record<string, unknown> = { response: assistantMsg };
        if (assistantMsg.trim().startsWith('{') || assistantMsg.trim().startsWith('[')) {
          try {
            parsedOutput = JSON.parse(assistantMsg.trim());
          } catch {
            // Fallback wrapper
          }
        }

        await createLog({
          endpoint,
          input_text: userMsg,
          output_json: parsedOutput,
          corrected_output: parsedOutput,
          confidence_score: sample.score / 100,
          flag_for_review: true,
        });
        savedCount++;
      }

      // Kích hoạt Pipeline AI học qua BullMQ eval job
      const res = await submitEvaluate();
      setJobId(res.jobId);
      setJobStatus('active');

      showToast(`Đã lưu ${savedCount} samples vào DB và kích hoạt Pipeline AI học (Job: ${res.jobId})!`);
      void load();
    } catch {
      showToast('Lỗi khi lưu dataset vào DB hoặc kích hoạt Pipeline', 'err');
    } finally {
      setSavingToDb(false);
    }
  };

  const handleImportContent = (content: string) => {
    try {
      const text = content.trim();
      let lines = text.split('\n').filter((l) => l.trim());
      if (text.startsWith('[') && text.endsWith(']')) {
        const parsedArray = JSON.parse(text);
        if (Array.isArray(parsedArray)) {
          lines = parsedArray.map((item) => JSON.stringify(item));
        }
      }
      const newSamples: ChatMLSample[] = [];
      lines.forEach((line, idx) => {
        try {
          const parsed = JSON.parse(line);
          if (parsed.messages && Array.isArray(parsed.messages)) {
            newSamples.push(evaluateSample(parsed, idx));
          }
        } catch {
          // ignore invalid lines
        }
      });

      if (newSamples.length === 0) {
        showToast('Không tìm thấy sample ChatML hợp lệ nào', 'err');
        return;
      }

      setImportedSamples(newSamples);
      showToast(`Đã import & đánh giá thành công ${newSamples.length} samples ChatML!`);
    } catch {
      showToast('Nội dung không đúng định dạng JSON/JSONL ChatML chuẩn', 'err');
    }
  };

  const handleImportTextJson = () => {
    if (!rawJsonInput.trim()) {
      showToast('Nội dung Text JSON/JSONL không được để trống', 'err');
      return;
    }
    handleImportContent(rawJsonInput);
    setRawJsonInput('');
    setShowRawInput(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleImportContent(text);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
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
      const targetAssistantContent = log.corrected_output
        ? (typeof log.corrected_output === 'string' ? log.corrected_output : JSON.stringify(log.corrected_output, null, 2))
        : (typeof log.output_json === 'string' ? log.output_json : JSON.stringify(log.output_json, null, 2));

      const entry = {
        messages: [
          { role: 'system', content: `You are an AI assistant for ${log.endpoint} endpoint.` },
          { role: 'user', content: log.input_text ?? '' },
          { role: 'assistant', content: targetAssistantContent },
        ],
        metadata: {
          log_id: log.id,
          endpoint: log.endpoint,
          confidence_score: log.confidence_score,
          execution_time_ms: log.execution_time_ms,
          created_at: log.created_at,
          is_corrected: !!log.corrected_output,
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

  const handleExportEvaluatedJsonl = () => {
    if (importedSamples.length === 0) return;
    const lines = importedSamples.map((s) => JSON.stringify({ messages: s.messages, metadata: s.metadata }));
    const blob = new Blob([lines.join('\n')], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csmart_evaluated_dataset_${new Date().toISOString().slice(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất ${importedSamples.length} samples ChatML đã qua kiểm định!`);
  };

  const handleDeleteSample = (id: string) => {
    setImportedSamples((prev) => prev.filter((s) => s.id !== id));
    showToast(`Đã xóa sample #${id}`);
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

      {/* Detail Sample Modal */}
      <EvaluatorSampleModal
        sample={selectedSample}
        onClose={() => setSelectedSample(null)}
        onDeleteSample={handleDeleteSample}
      />

      {/* Header Section */}
      <EvaluatorHeader logsLoading={logsLoading} onRefresh={load} />

      {/* Stats Cards Section */}
      <EvaluatorStats
        totalLogs={totalLogs}
        flaggedCount={flaggedLogs.length}
        flagRate={flagRate}
        avgConf={avgConf}
      />

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Run Evaluate Job Section */}
        <EvaluatorRunJobSection
          jobId={jobId}
          jobStatus={jobStatus}
          taskLoading={taskLoading}
          onRunEvaluate={handleRunEvaluate}
        />

        {/* Export & Import Fine-Tune Dataset Section */}
        <EvaluatorDatasetSection
          flaggedCount={flaggedLogs.length}
          totalLogs={totalLogs}
          onExportJsonl={handleExportJsonl}
          onImportFile={handleImportFile}
          showRawInput={showRawInput}
          setShowRawInput={setShowRawInput}
          rawJsonInput={rawJsonInput}
          setRawJsonInput={setRawJsonInput}
          onImportTextJson={handleImportTextJson}
        />
      </div>

      {/* Imported Dataset Preview & Evaluation Panel */}
      <EvaluatorDatasetPreview
        samples={importedSamples}
        onSelectSample={setSelectedSample}
        onDeleteSample={handleDeleteSample}
        onClearSamples={() => setImportedSamples([])}
        onExportEvaluatedJsonl={handleExportEvaluatedJsonl}
        onSaveToDbAndTrain={handleSaveToDbAndTrain}
        savingToDb={savingToDb}
      />

      {/* Breakdown by Endpoint Section */}
      <EvaluatorBreakdownSection
        endpointBreakdown={endpointBreakdown}
        flaggedByEndpoint={flaggedByEndpoint}
        totalLogs={totalLogs}
        flaggedCount={flaggedLogs.length}
      />
    </div>
  );
}
