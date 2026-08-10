'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCopilot, useAiTasks } from '@/hooks';
import { ChatMessageDto } from '@/types/ai/copilot';
import { Sparkles, Activity } from 'lucide-react';
import CopilotTab from './CopilotTab';
import JobQueueTab from './JobQueueTab';
import CircuitBreakerPanel from './CircuitBreakerPanel';

interface ActiveJob {
  id: string;
  type: 'ocr' | 'eval';
  status: string;
  progress?: number;
  result?: unknown;
  failedReason?: string;
}

export default function InteractiveAiDemo() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'copilot' | 'tasks'>('copilot');

  // Copilot Chat State
  const { loading: copilotLoading } = useCopilot();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingRole, setTypingRole] = useState<'assistant' | 'user'>('assistant');
  const timerRefs = useRef<(ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | number)[]>([]);
  const runSimulationRef = useRef<(stepNum: number) => void>(() => {});

  const SIMULATED_CONVERSATION = useRef<ChatMessageDto[]>([
    { role: 'assistant', content: 'Xin chào! Tôi là Csmart Copilot. Tôi có thể hỗ trợ gì cho bạn hôm nay?' },
    { role: 'user', content: 'Thống kê đơn hàng và doanh số hôm nay thế nào?' },
    { role: 'assistant', content: 'Hôm nay hệ thống ghi nhận 150 đơn hàng thành công. Doanh thu đạt 45.2M VND (tăng 12% so với ngày hôm qua). Có 3 đơn hàng gặp lỗi thanh toán cần xử lý gấp.' },
    { role: 'user', content: 'Chi tiết 3 đơn hàng lỗi là gì?' },
    { role: 'assistant', content: 'Danh sách đơn hàng lỗi:\n1. #ORD-9982 (Lỗi thẻ)\n2. #ORD-9975 (Cổng thanh toán bảo trì)\n3. #ORD-9961 (Timeout kết nối)\nTôi đã gửi cảnh báo đến kỹ thuật viên trực ban.' }
  ]);

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach((t) => {
      clearTimeout(t as number);
      clearInterval(t as number);
    });
    timerRefs.current = [];
  }, []);

  const runSimulation = useCallback((stepNum: number) => {
    if (stepNum >= SIMULATED_CONVERSATION.current.length) return;
    
    const currentMsg = SIMULATED_CONVERSATION.current[stepNum];
    setTypingRole(currentMsg.role);
    setIsTyping(true);
    
    const typeDelay = currentMsg.role === 'user' ? 1200 : 1500;
    
    const t1 = setTimeout(() => {
      setIsTyping(false);
      let charIndex = 0;
      const fullText = currentMsg.content;
      setMessages((prev) => [...prev, { role: currentMsg.role, content: '' }]);
      
      const interval = setInterval(() => {
        charIndex++;
        setMessages((prev) => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: fullText.slice(0, charIndex),
            };
          }
          return next;
        });
        
        if (charIndex >= fullText.length) {
          clearInterval(interval);
          const t2 = setTimeout(() => {
            runSimulationRef.current(stepNum + 1);
          }, 1800);
          timerRefs.current.push(t2);
        }
      }, 25);
      timerRefs.current.push(interval);
    }, typeDelay);
    
    timerRefs.current.push(t1);
  }, []);

  useEffect(() => {
    runSimulationRef.current = runSimulation;
  }, [runSimulation]);

  useEffect(() => {
    runSimulation(0);
    return () => {
      clearAllTimers();
    };
  }, [runSimulation, clearAllTimers]);

  // AI Tasks Hooks & State
  const { getCircuitStatus, loading: tasksLoading } = useAiTasks();
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [circuitState, setCircuitState] = useState<{
    state: string;
    failuresCount: number;
    lastFailureTime: number | null;
  } | null>(null);
  const [activeJobs] = useState<ActiveJob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat container only
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, copilotLoading, isTyping]);

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
        if (isMounted) setCircuitState(res);
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
    if (!chatInput.trim()) return;

    clearAllTimers();
    setIsTyping(false);

    const userText = chatInput;
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);

    let responseText = `Tôi đã nhận được yêu cầu: "${userText}". Để kết nối với cơ sở dữ liệu thật của hệ thống CSMART và thực hiện các thao tác quản trị viên, bạn vui lòng đăng nhập tài khoản nhé!`;
    const lowerText = userText.toLowerCase();
    if (lowerText.includes('doanh thu') || lowerText.includes('doanh số') || lowerText.includes('tiền')) {
      responseText = 'Doanh thu hôm nay đạt 45.2M VND, tăng 12% so với ngày hôm qua. Tất cả giao dịch thanh toán đều được xử lý thành công.';
    } else if (lowerText.includes('đơn hàng') || lowerText.includes('order')) {
      responseText = 'Hôm nay hệ thống ghi nhận 150 đơn hàng thành công và có 3 đơn hàng đang gặp lỗi thanh toán. Bạn có muốn tôi kiểm tra chi tiết không?';
    } else if (lowerText.includes('lỗi') || lowerText.includes('bug') || lowerText.includes('hỏng')) {
      responseText = 'Có 3 lỗi hệ thống được ghi nhận trong 24 giờ qua: lỗi cổng thanh toán, lỗi timeout kết nối và lỗi tải ảnh OCR. Đã thông báo tới đội ngũ Devops.';
    } else if (lowerText.includes('chào') || lowerText.includes('hello') || lowerText.includes('hi')) {
      responseText = 'Xin chào! Tôi là Csmart Copilot. Hôm nay tôi có thể hỗ trợ gì cho bạn trong việc quản lý hệ thống?';
    }

    setTypingRole('assistant');
    setIsTyping(true);

    const t = setTimeout(() => {
      setIsTyping(false);
      let charIndex = 0;
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const interval = setInterval(() => {
        charIndex++;
        setMessages((prev) => {
          const next = [...prev];
          if (next.length > 0) {
            next[next.length - 1] = {
              ...next[next.length - 1],
              content: responseText.slice(0, charIndex),
            };
          }
          return next;
        });

        if (charIndex >= responseText.length) {
          clearInterval(interval);
        }
      }, 25);
      timerRefs.current.push(interval);
    }, 1200);

    timerRefs.current.push(t);
  };

  const handleOcrSubmit = () => {
    router.push('/login');
  };

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

      {/* Tab Contents Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main interactive area: 8 cols */}
        <div className="lg:col-span-8 border-4 border-[#09090B] bg-[#FAFAFA] p-6 shadow-[8px_8px_0px_0px_#09090B] min-h-125 flex flex-col">
          {activeTab === 'copilot' ? (
            <CopilotTab
              messages={messages}
              isTyping={isTyping}
              typingRole={typingRole}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSubmit={handleSendChat}
              chatContainerRef={chatContainerRef}
              loading={copilotLoading}
            />
          ) : (
            <JobQueueTab
              ocrFile={ocrFile}
              fileInputRef={fileInputRef}
              onFileChange={setOcrFile}
              onOcrSubmit={handleOcrSubmit}
              onEvalSubmit={handleEvalSubmit}
              activeJobs={activeJobs}
              loading={tasksLoading}
            />
          )}
        </div>

        {/* Side Panel: Telemetry info: 4 cols */}
        <CircuitBreakerPanel
          circuitState={circuitState}
          onRefresh={refreshCircuit}
          loading={tasksLoading}
        />
      </div>
    </section>
  );
}
