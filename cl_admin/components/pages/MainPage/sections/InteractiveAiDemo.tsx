'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCopilot, useAiTasks } from '@/hooks';
import { ChatMessageDto } from '@/types/ai/copilot';
import {
  Send,
  Bot,
  User,
  Upload,
  Activity,
  ShieldAlert,
  Play,
  CheckCircle,
  RefreshCw,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function InteractiveAiDemo() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'copilot' | 'tasks'>('copilot');

  // Copilot Chat State
  const { loading: copilotLoading } = useCopilot();
  const [chatInput, setChatInput] = useState('');
  const [messages] = useState<ChatMessageDto[]>([
    { role: 'assistant', content: 'Xin chào! Tôi là Csmart Copilot. Tôi có thể hỗ trợ gì cho bạn hôm nay?' },
  ]);

  // AI Tasks State
  const {
    getCircuitStatus,
    loading: tasksLoading,
  } = useAiTasks();

  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [circuitState, setCircuitState] = useState<{
    state: string;
    failuresCount: number;
    lastFailureTime: number | null;
  } | null>(null);

  const [activeJobs] = useState<{
    id: string;
    type: 'ocr' | 'eval';
    status: string;
    progress?: number;
    result?: unknown;
    failedReason?: string;
  }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, copilotLoading]);

  // Fetch Circuit status on load
  const refreshCircuit = useCallback(async () => {
    try {
      const res = await getCircuitStatus();
      setCircuitState(res);
    } catch (err) {
      console.error('Failed to get circuit status', err);
    }
  }, [getCircuitStatus]);

  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      try {
        const res = await getCircuitStatus();
        if (isMounted) {
          setCircuitState(res);
        }
      } catch (err) {
        console.error('Failed to get circuit status', err);
      }
    };
    void loadState();
    return () => {
      isMounted = false;
    };
  }, [getCircuitStatus]);



  // Handle Send Chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/login');
  };

  // Handle OCR Submit
  const handleOcrSubmit = () => {
    router.push('/login');
  };

  // Handle Eval Submit
  const handleEvalSubmit = () => {
    router.push('/login');
  };

  return (
    <section id="interactive-ai-playground" className="mx-auto max-w-7xl px-6 py-12 md:px-12 w-full">
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-extrabold text-[#09090B] tracking-tight uppercase inline-block border-b-4 border-[#F97316] pb-2">
          Playground Trải Nghiệm AI Trực Tiếp
        </h2>
        <p className="text-zinc-600 mt-2 font-mono text-sm">
          Kiểm thử thời gian thực các dịch vụ Copilot Assistant & Hàng đợi Tác vụ Xử lý Bất đồng bộ.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-4 border-[#09090B] mb-8 bg-[#FAFAFA] shadow-[4px_4px_0px_0px_#09090B] overflow-hidden">
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 py-4 font-mono font-bold uppercase transition-colors flex items-center justify-center gap-2 border-r-4 border-[#09090B] ${
            activeTab === 'copilot' ? 'bg-[#F97316] text-[#FAFAFA]' : 'hover:bg-zinc-100 text-[#09090B]'
          }`}
        >
          <Sparkles size={18} />
          AI Copilot Chat (SSE Stream)
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-4 font-mono font-bold uppercase transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'tasks' ? 'bg-[#F97316] text-[#FAFAFA]' : 'hover:bg-zinc-100 text-[#09090B]'
          }`}
        >
          <Activity size={18} />
          AI Job Queue (BullMQ / Redis)
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main interactive area: 8 cols */}
        <div className="lg:col-span-8 border-4 border-[#09090B] bg-[#FAFAFA] p-6 shadow-[8px_8px_0px_0px_#09090B] min-h-125 flex flex-col">
          
          {activeTab === 'copilot' && (
            <div className="flex flex-col flex-1 h-full">
              {/* Chat window */}
              <div className="flex-1 min-h-87.5 max-h-112.5 overflow-y-auto border-2 border-[#09090B] bg-white p-4 space-y-4 mb-4 font-sans">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 border-2 border-[#09090B] max-w-[85%] shadow-[2px_2px_0px_0px_#09090B] ${
                      msg.role === 'user' ? 'bg-[#F97316]/10 text-right' : 'bg-zinc-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-zinc-500 font-semibold uppercase">
                        {msg.role === 'user' ? (
                          <>
                            <span>ADMIN USER</span>
                            <User size={12} className="text-[#F97316]" />
                          </>
                        ) : (
                          <>
                            <Bot size={12} className="text-[#F97316]" />
                            <span>CSMART COPILOT</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-[#09090B] leading-relaxed whitespace-pre-wrap text-left">
                        {msg.content || (
                          <span className="inline-flex items-center text-zinc-400">
                            <Loader2 className="animate-spin mr-1" size={14} />
                            Đang soạn thảo...
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat form */}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Gửi tin nhắn thử nghiệm (ví dụ: 'Thống kê đơn hàng', 'Tóm tắt doanh thu')..."
                  className="flex-1 px-4 py-3 border-2 border-[#09090B] font-mono text-sm focus:outline-none focus:bg-zinc-50"
                  disabled={copilotLoading}
                />
                <button
                  type="submit"
                  disabled={copilotLoading || !chatInput.trim()}
                  className="btn-brutal bg-[#F97316] text-[#09090B] font-mono font-bold px-5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send size={16} />
                  Gửi
                </button>
              </form>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#09090B] font-mono uppercase border-b-2 border-zinc-200 pb-2 flex items-center gap-2">
                <Play size={16} className="text-[#F97316]" />
                Trigger Background Processing Job
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task 1: OCR File parsing */}
                <div className="border-2 border-[#09090B] p-4 bg-white shadow-[3px_3px_0px_0px_#09090B]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-[#F97316]" size={20} />
                    <h4 className="font-bold text-[#09090B] font-mono uppercase text-sm">Task 01: Nhận diện OCR hình ảnh</h4>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                    Tải lên hóa đơn hoặc ảnh văn bản để phân tách nội dung qua hàng đợi OCR bất đồng bộ BullMQ.
                  </p>
                  
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setOcrFile(e.target.files?.[0] || null)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 border-2 border-dashed border-[#09090B] hover:bg-zinc-50 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      {ocrFile ? ocrFile.name : 'Chọn File hình ảnh'}
                    </button>
                    
                    <button
                      onClick={handleOcrSubmit}
                      disabled={!ocrFile || tasksLoading}
                      className="w-full py-2 bg-[#09090B] text-white hover:bg-zinc-800 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {tasksLoading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                      Bắt đầu xử lý OCR
                    </button>
                  </div>
                </div>

                {/* Task 2: Self-Evaluation */}
                <div className="border-2 border-[#09090B] p-4 bg-white shadow-[3px_3px_0px_0px_#09090B] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="text-[#F97316]" size={20} />
                      <h4 className="font-bold text-[#09090B] font-mono uppercase text-sm">Task 02: Tự đánh giá (Evaluation)</h4>
                    </div>
                    <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                      Kích hoạt tác vụ chạy hậu đài đánh giá sự chính xác, độ tin cậy và kiểm duyệt nội dung LLM.
                    </p>
                  </div>

                  <button
                    onClick={handleEvalSubmit}
                    disabled={tasksLoading}
                    className="w-full py-2 bg-[#09090B] text-white hover:bg-zinc-800 font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {tasksLoading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                    Chạy Đánh giá
                  </button>
                </div>
              </div>

              {/* Active Jobs Monitor */}
              <div className="mt-6 border-2 border-[#09090B] p-4 bg-zinc-50">
                <h4 className="font-bold font-mono text-xs uppercase mb-3 text-zinc-700 flex items-center gap-1.5">
                  <Activity size={14} /> Monitor các tác vụ đang chạy ({activeJobs.length})
                </h4>
                {activeJobs.length === 0 ? (
                  <p className="text-xs text-zinc-400 font-mono italic">Chưa có tác vụ nào được kích hoạt.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="bg-white border-2 border-[#09090B] p-3 text-xs font-mono shadow-[2px_2px_0px_0px_#09090B]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold uppercase text-[#09090B]">
                            {job.type === 'ocr' ? '📝 OCR Task' : '🛡️ Eval Task'} ({job.id})
                          </span>
                          <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                            job.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            job.status === 'failed' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          }`}>
                            {job.status.toUpperCase()}
                          </span>
                        </div>
                        {job.progress !== undefined && job.status === 'active' && (
                          <div className="w-full bg-zinc-200 h-1.5 mt-2 mb-1">
                            <div className="bg-[#F97316] h-1.5" style={{ width: `${job.progress}%` }}></div>
                          </div>
                        )}
                        {!!job.result && (
                          <div className="mt-2 bg-zinc-50 p-2 border border-zinc-200 text-[10px] text-zinc-600 max-h-24 overflow-y-auto whitespace-pre-wrap">
                            Kết quả: {JSON.stringify(job.result, null, 2)}
                          </div>
                        )}
                        {job.failedReason && (
                          <div className="mt-2 bg-rose-50 text-rose-700 p-2 border border-rose-200 text-[10px]">
                            Lỗi: {job.failedReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Side Panel: Telemetry info: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Circuit Breaker Status */}
          <div className="border-4 border-[#09090B] bg-zinc-950 text-emerald-400 p-6 shadow-[6px_6px_0px_0px_#09090B] font-mono text-xs relative overflow-hidden">
            {/* Scanline */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-size-[100%_4px] z-10 opacity-10" />

            <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3 mb-4">
              <span className="font-bold uppercase tracking-wider">CIRCUIT_BREAKER_TELEMETRY</span>
              <button onClick={refreshCircuit} className="text-emerald-500 hover:text-emerald-300 transition-colors">
                <RefreshCw size={14} className={tasksLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {circuitState ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Trạng thái Circuit:</span>
                  <span className={`px-2 py-0.5 border text-[10px] font-bold ${
                    circuitState.state === 'CLOSED' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' :
                    'bg-rose-950/40 text-rose-400 border-rose-800'
                  }`}>
                    {circuitState.state}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lỗi liên tiếp:</span>
                  <span>{circuitState.failuresCount} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span>Lần lỗi cuối:</span>
                  <span className="text-zinc-500 text-[10px]">
                    {circuitState.lastFailureTime ? new Date(circuitState.lastFailureTime).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 italic">Không có dữ liệu telemetry.</p>
            )}
          </div>

          {/* Quick instructions / Help */}
          <div className="border-4 border-[#09090B] bg-[#FAFAFA] p-5 shadow-[6px_6px_0px_0px_#09090B]">
            <h4 className="font-bold font-mono text-sm uppercase text-[#09090B] mb-3 flex items-center gap-1.5 border-b-2 border-zinc-200 pb-1.5">
              <CheckCircle size={16} className="text-[#F97316]" /> Hướng dẫn Test nhanh
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 leading-relaxed font-sans">
              <li>
                <strong className="text-[#09090B] font-mono">1. Thử chat Copilot:</strong> Gõ nội dung để nhận stream trực tiếp từ pipeline_ai qua backend.
              </li>
              <li>
                <strong className="text-[#09090B] font-mono">2. Thử OCR image:</strong> Chọn ảnh (vd: JPEG/PNG) chứa chữ, hàng đợi BullMQ sẽ tự động xử lý và cập nhật kết quả dạng JSON.
              </li>
              <li>
                <strong className="text-[#09090B] font-mono">3. Thử Đánh giá:</strong> Chạy mô phỏng kiểm thử tự động, lưu log chi tiết vào database PostgreSQL.
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
