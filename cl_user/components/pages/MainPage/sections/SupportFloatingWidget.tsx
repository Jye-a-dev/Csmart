'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Headphones,
  Bot,
  User as UserIcon,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useCopilot } from '@/hooks';
import { useAuthModal } from '@/contexts/AuthModalContext';
import type { ChatMessageDto } from '@/types/ai/copilot';

interface SupportFloatingWidgetProps {
  activeRole?: 'CUSTOMER' | 'SUPPORT';
  onOpenSupportConsole?: () => void;
}

export default function SupportFloatingWidget({
  activeRole = 'CUSTOMER',
  onOpenSupportConsole,
}: SupportFloatingWidgetProps) {
  const { requireAuth } = useAuthModal();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageDto[]>([
    {
      role: 'assistant',
      content:
        'Xin chào quý khách! Tôi là Trợ lý AI Copilot của CSMART Store. Tôi có thể hỗ trợ bạn tìm kiếm sản phẩm, gợi ý size, hoặc giải đáp chính sách mua sắm!',
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chatPostStream } = useCopilot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    requireAuth(async () => {
      const userMessage: ChatMessageDto = { role: 'user', content: textToSend.trim() };
      const newMessages = [...messages, userMessage];

      setMessages(newMessages);
      setInputMessage('');
      setIsStreaming(true);

      const assistantIndex = newMessages.length;
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      try {
        await chatPostStream(
          {
            messages: newMessages,
            temperature: 0.7,
          },
          (chunkText: string) => {
            let cleanChunk = chunkText;
            try {
              const parsed = JSON.parse(chunkText);
              if (parsed && typeof parsed.text === 'string') {
                cleanChunk = parsed.text;
              }
            } catch {
              // Raw text chunk
            }

            setMessages((prev) => {
              const updated = [...prev];
              if (updated[assistantIndex]) {
                updated[assistantIndex] = {
                  ...updated[assistantIndex],
                  content: updated[assistantIndex].content + cleanChunk,
                };
              }
              return updated;
            });
          },
          () => {
            setIsStreaming(false);
          }
        );
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantIndex]) {
            updated[assistantIndex] = {
              ...updated[assistantIndex],
              content:
                updated[assistantIndex].content ||
                'Xin lỗi, hiện tại kết nối đến AI Copilot đang bận. Bạn vui lòng thử lại sau giây lát!',
            };
          }
          return updated;
        });
        setIsStreaming(false);
      }
    }, 'Vui lòng đăng nhập để trò chuyện cùng Trợ lý AI Copilot');
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Đã làm mới cuộc hội thoại. Tôi có thể hỗ trợ gì thêm cho quý khách hôm nay?',
      },
    ]);
  };

  const handleToggleWidget = () => {
    if (!isOpen) {
      requireAuth(() => {
        setIsOpen(true);
      }, 'Vui lòng đăng nhập để trò chuyện và nhận tư vấn từ CSMART AI Copilot');
    } else {
      setIsOpen(false);
    }
  };

  const quickPrompts = [
    'Tư vấn áo polo cho nam 1m75 nặng 68kg',
    'Chính sách đổi trả hàng như thế nào?',
    'Có voucher freeship cho đơn hàng mới không?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="card-brutal mb-4 w-90 sm:w-105 h-130 max-h-[80vh] bg-white border-2 border-[#09090B] flex flex-col overflow-hidden shadow-[6px_6px_0px_0px_#09090B] animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Chat Header */}
          <div className="bg-[#09090B] text-white p-4 border-b-2 border-[#09090B] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#F97316] text-[#09090B] p-1.5 border border-white">
                <Bot size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-mono font-black text-xs uppercase tracking-tight text-white flex items-center gap-1.5">
                  CSMART AI Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <span className="font-mono text-[10px] text-zinc-400">
                  Trợ lý tư vấn mua sắm 24/7
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Làm mới cuộc trò chuyện"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng chat"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF7F2] font-sans text-xs">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-none border border-[#09090B] flex items-center justify-center shrink-0 ${
                      isUser ? 'bg-[#09090B] text-white' : 'bg-[#F97316] text-[#09090B]'
                    }`}
                  >
                    {isUser ? <UserIcon size={14} /> : <Bot size={14} />}
                  </div>

                  <div
                    className={`p-3 max-w-[80%] border border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] leading-relaxed ${
                      isUser
                        ? 'bg-[#F97316] text-white font-medium'
                        : 'bg-white text-[#09090B]'
                    }`}
                  >
                    {msg.content || (
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Loader2 size={12} className="animate-spin" />
                        Đang suy nghĩ...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Prompts */}
          <div className="p-2.5 bg-zinc-100 border-t border-b border-[#09090B] flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isStreaming}
                className="text-[10px] font-mono bg-white px-2.5 py-1 border border-[#09090B] shadow-[1px_1px_0px_0px_#09090B] hover:bg-orange-50 hover:text-orange-600 active:scale-95 transition-all text-left cursor-pointer disabled:opacity-50"
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
            className="p-3 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập câu hỏi cho trợ lý AI..."
              disabled={isStreaming}
              className="flex-1 px-3 py-2 border-2 border-[#09090B] text-xs font-mono focus:outline-none focus:bg-zinc-50 bg-[#FAFAFA]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className="p-2.5 bg-[#F97316] text-[#09090B] border-2 border-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:bg-[#ea580c] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Gửi câu hỏi"
            >
              {isStreaming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>

        </div>
      )}

      {/* Floating Buttons Group */}
      <div className="flex items-center gap-3">
        {/* Support Console Launcher if in SUPPORT role */}
        {activeRole === 'SUPPORT' && (
          <button
            type="button"
            onClick={() => {
              requireAuth(() => {
                if (onOpenSupportConsole) onOpenSupportConsole();
              }, 'Vui lòng đăng nhập tài khoản Support để mở Console CSKH');
            }}
            className="btn-brutal inline-flex items-center gap-2 bg-amber-400 text-[#09090B] font-mono text-xs font-black px-4 py-3 uppercase shadow-[4px_4px_0px_0px_#09090B] cursor-pointer hover:bg-amber-500"
          >
            <Headphones size={18} />
            <span>Console CSKH</span>
          </button>
        )}

        {/* Main Floating Trigger Button */}
        <button
          type="button"
          onClick={handleToggleWidget}
          className="btn-brutal relative inline-flex items-center gap-2 bg-[#F97316] text-[#09090B] font-mono text-xs font-black px-5 py-3.5 uppercase shadow-[4px_4px_0px_0px_#09090B] hover:bg-[#ea580c] hover:text-white transition-all cursor-pointer"
          title="Mở trợ lý AI Copilot"
        >
          <Bot size={20} className="stroke-[2.5]" />
          <span>AI Copilot</span>
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#09090B] rounded-full animate-ping" />
          )}
        </button>
      </div>

    </div>
  );
}
