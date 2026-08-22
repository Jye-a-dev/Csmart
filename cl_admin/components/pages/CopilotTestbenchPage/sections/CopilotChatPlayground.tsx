'use client';

import { useRef, useEffect } from 'react';
import { ChatMessageDto } from '@/types/ai/copilot';
import { Activity, Bot, User, Send, RefreshCw } from 'lucide-react';

interface CopilotChatPlaygroundProps {
  messages: ChatMessageDto[];
  loading: boolean;
  inputMessage: string;
  setInputMessage: (val: string) => void;
  onSendMessage: () => void;
}

export function CopilotChatPlayground({
  messages,
  loading,
  inputMessage,
  setInputMessage,
  onSendMessage,
}: CopilotChatPlaygroundProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="border-2 border-[#09090B] bg-white p-6 shadow-[4px_4px_0px_0px_#09090B] flex flex-col h-120">
      <div className="flex items-center justify-between border-b-2 border-[#09090B] pb-3 mb-4">
        <h3 className="font-mono text-xs font-black uppercase text-[#09090B] flex items-center gap-2">
          <Activity size={14} className="text-emerald-500" />
          CHAT PLAYGROUND (SSE STREAMING)
        </h3>
        {loading && (
          <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-emerald-300 text-[#09090B] border border-[#09090B] animate-pulse">
            ● STREAMING LIVE
          </span>
        )}
      </div>

      {/* Chat Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 p-3 bg-[#FAFAFA] border-2 border-[#09090B] font-mono text-xs mb-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 bg-[#F97316] text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
            )}

            <div
              className={`max-w-[80%] p-3.5 border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] ${
                msg.role === 'user'
                  ? 'bg-[#09090B] text-white font-bold'
                  : 'bg-white text-[#09090B] font-medium whitespace-pre-wrap'
              }`}
            >
              {msg.content || (loading && idx === messages.length - 1 ? (
                <span className="italic text-zinc-400 flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" /> Đang nhận phản hồi...
                </span>
              ) : null)}
            </div>

            {msg.role === 'user' && (
              <div className="h-8 w-8 bg-zinc-900 text-white border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
          placeholder="Nhập câu hỏi thử nghiệm cho Copilot..."
          className="flex-1 p-3 font-mono text-xs border-2 border-[#09090B] bg-white text-[#09090B] focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
        />
        <button
          onClick={onSendMessage}
          disabled={loading || !inputMessage.trim()}
          className="px-5 py-3 font-mono text-xs font-black uppercase bg-[#F97316] text-white border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          Gửi
        </button>
      </div>
    </div>
  );
}
