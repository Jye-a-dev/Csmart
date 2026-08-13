'use client';

import { useRef } from 'react';
import { ChevronRight, Play } from 'lucide-react';

interface SqlConsoleInputProps {
  question: string;
  setQuestion: (q: string) => void;
  loading: boolean;
  onRun: () => void;
}

export function SqlConsoleInput({ question, setQuestion, loading, onRun }: SqlConsoleInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onRun();
    }
  };

  return (
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
          type="button"
          onClick={onRun}
          disabled={loading || !question.trim()}
          className="px-6 py-2.5 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={14} />
          {loading ? 'Đang xử lý...' : 'Chạy Query'}
        </button>
      </div>
    </div>
  );
}
