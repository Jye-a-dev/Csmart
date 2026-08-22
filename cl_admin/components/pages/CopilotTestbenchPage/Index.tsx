'use client';

import { useState } from 'react';
import { useCopilot } from '@/hooks/useCopilot';
import { ChatMessageDto } from '@/types/ai/copilot';
import {
  CopilotHeader,
  CopilotTuningPanel,
  CopilotChatPlayground,
  CopilotDiagnosticsInspector,
} from './sections';

const DEFAULT_SYSTEM_PROMPT = `Bạn là CSMART AI Assistant - Trợ lý bán hàng và hỗ trợ khách hàng thông minh cho sàn thương mại điện tử CSMART. BẮT BUỘC luôn trả lời hoàn toàn 100% bằng Tiếng Việt thân thiện, chính xác, lịch sự và ngắn gọn.`;

export default function CopilotTestbenchPage() {
  const { loading, chatPostStream } = useCopilot();
  const [messages, setMessages] = useState<ChatMessageDto[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là CSMART AI Copilot Testbench. Bạn có thể thử nghiệm đặt câu hỏi để kiểm tra luồng phản hồi streaming của mô hình.',
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');

  // Hyperparameter Tuning States
  const [temperature, setTemperature] = useState<number>(0.7);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.75);
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);

  // Diagnostics Metrics
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [streamChunksCount, setStreamChunksCount] = useState<number>(0);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Sanitize past messages: strip out past connection error artifacts and empty bubbles
    const sanitizedHistory: ChatMessageDto[] = messages
      .filter((m) => m.content && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role,
        content: m.content.replace(/\n?\[Lỗi kết nối Copilot Stream\]/g, '').trim(),
      }))
      .filter((m) => m.content.length > 0);

    const newHistory: ChatMessageDto[] = [
      ...sanitizedHistory,
      { role: 'user', content: userText },
    ];

    setMessages([...sanitizedHistory, { role: 'user', content: userText }, { role: 'assistant', content: '' }]);

    const startTime = Date.now();
    let chunks = 0;

    try {
      await chatPostStream(
        {
          messages: newHistory,
          temperature,
          confidence_threshold: confidenceThreshold,
          system_prompt: systemPrompt,
        },
        (chunkData: string) => {
          chunks++;
          setStreamChunksCount(chunks);

          let textChunk = chunkData;
          try {
            const parsed = JSON.parse(chunkData);
            if (typeof parsed === 'object' && parsed !== null) {
              if (parsed.text !== undefined) textChunk = String(parsed.text);
              else if (parsed.content !== undefined) textChunk = String(parsed.content);
              else if (parsed.delta !== undefined) textChunk = String(parsed.delta);
              else if (parsed.error !== undefined) textChunk = `\n[Lỗi: ${parsed.error}]`;
            }
          } catch {
            // Raw text chunk
          }

          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: updated[lastIdx].content + textChunk,
              };
            }
            return updated;
          });
        },
        () => {
          setLastLatencyMs(Date.now() - startTime);
        }
      );
    } catch {
      // Local fallback stream when backend server (port 3000) is unreachable
      const fallbackText = `Xin chào! Tôi là CSMART AI Copilot (Chế độ dự phòng). Tôi đã nhận được câu hỏi: "${userText}". \n\n[Lưu ý]: Để nhận phản hồi trực tiếp từ mô hình Qwen2.5 & cơ sở dữ liệu thật, vui lòng chạy lệnh "npm run dev" trong thư mục server.`;

      let charIdx = 0;
      const interval = setInterval(() => {
        charIdx += 5;
        const slice = fallbackText.slice(0, charIdx);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: slice,
            };
          }
          return updated;
        });
        setStreamChunksCount((c) => c + 1);

        if (charIdx >= fallbackText.length) {
          clearInterval(interval);
          setLastLatencyMs(Date.now() - startTime);
        }
      }, 25);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Đã xóa lịch sử hội thoại. Bắt đầu phiên thử nghiệm mới.',
      },
    ]);
    setLastLatencyMs(null);
    setStreamChunksCount(0);
  };

  return (
    <div className="space-y-8 font-sans">
      <CopilotHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <CopilotTuningPanel
            temperature={temperature}
            setTemperature={setTemperature}
            confidenceThreshold={confidenceThreshold}
            setConfidenceThreshold={setConfidenceThreshold}
            onClearChat={handleClearChat}
          />

          <CopilotChatPlayground
            messages={messages}
            loading={loading}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendMessage}
          />
        </div>

        <div className="lg:col-span-5">
          <CopilotDiagnosticsInspector
            lastLatencyMs={lastLatencyMs}
            streamChunksCount={streamChunksCount}
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            temperature={temperature}
            confidenceThreshold={confidenceThreshold}
            messages={messages}
          />
        </div>
      </div>
    </div>
  );
}
