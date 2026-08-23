'use client';

import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessageDto } from '@/types/ai/copilot';

interface CopilotTabProps {
  messages: ChatMessageDto[];
  isTyping: boolean;
  typingRole: 'assistant' | 'user' | 'system';
  chatInput: string;
  setChatInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  loading: boolean;
}

export default function CopilotTab({
  messages,
  isTyping,
  typingRole,
  chatInput,
  setChatInput,
  onSubmit,
  chatContainerRef,
  loading
}: CopilotTabProps) {
  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Chat window */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-87.5 max-h-112.5 overflow-y-auto border-2 border-[#09090B] bg-white p-4 space-y-4 mb-4 font-sans"
      >
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
              <p className="text-sm text-[#09090B] leading-relaxed whitespace-pre-wrap text-left font-sans">
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
        
        {isTyping && (
          <div className={`flex gap-3 ${typingRole === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 border-2 border-[#09090B] max-w-[85%] shadow-[2px_2px_0px_0px_#09090B] ${
              typingRole === 'user' ? 'bg-[#F97316]/10 text-right' : 'bg-zinc-50'
            }`}>
              <div className="flex items-center gap-2 mb-2 text-[11px] font-mono text-zinc-500 font-semibold uppercase">
                {typingRole === 'user' ? (
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
              <div className="flex space-x-1.5 items-center py-1 px-2">
                <div className="w-2 h-2 bg-[#09090B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#09090B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#09090B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat form */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Gửi tin nhắn thử nghiệm (ví dụ: 'Thống kê đơn hàng', 'Tóm tắt doanh thu')..."
          className="flex-1 px-4 py-3 border-2 border-[#09090B] font-mono text-sm focus:outline-none focus:bg-zinc-50 bg-white"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !chatInput.trim()}
          className="btn-brutal bg-[#F97316] text-[#09090B] font-mono font-bold px-5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Send size={16} />
          Gửi
        </button>
      </form>
    </div>
  );
}
