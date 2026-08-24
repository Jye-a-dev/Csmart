'use client';

import { useState, useRef, useTransition } from 'react';
import { Search, Camera, Loader2, X, Sparkles } from 'lucide-react';
import { useAiTasks } from '@/hooks';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm thông minh (ví dụ: áo polo nam, tai nghe chống ồn)...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const { submitOcr, getStatus } = useAiTasks();

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSearch) {
      startTransition(() => {
        onSearch(query.trim());
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsOcrLoading(true);
      setOcrStatusText('Đang tải ảnh lên hệ thống OCR...');

      // 1. Submit file to async OCR BullMQ queue
      const res = await submitOcr(file);
      const jobId = res.jobId;

      setOcrStatusText('AI đang nhận diện văn bản & sản phẩm...');

      // 2. Poll job status until completed
      let attempts = 0;
      const maxAttempts = 30; // 15 seconds max

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await getStatus('ocr', jobId);
          const state = statusRes.state || statusRes.status;

          if (state === 'completed') {
            clearInterval(pollInterval);
            setIsOcrLoading(false);
            setOcrStatusText(null);

            // Extract detected product name or raw text
            const resultData = statusRes.returnValue || statusRes.result;
            let detectedText = '';

            if (resultData && typeof resultData === 'object') {
              const resObj = resultData as {
                data?: { name?: string };
                entities?: { name?: string };
                raw_text?: string;
                extracted_words?: string[];
              };
              detectedText =
                resObj.data?.name ||
                resObj.entities?.name ||
                resObj.raw_text ||
                (resObj.extracted_words && resObj.extracted_words.join(' ')) ||
                '';
            }

            if (detectedText) {
              setQuery(detectedText);
              if (onSearch) onSearch(detectedText);
            }
          } else if (state === 'failed' || attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsOcrLoading(false);
            setOcrStatusText('Không thể nhận diện hình ảnh, vui lòng thử lại');
            setTimeout(() => setOcrStatusText(null), 3500);
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsOcrLoading(false);
            setOcrStatusText(null);
          }
        }
      }, 500);
    } catch {
      setIsOcrLoading(false);
      setOcrStatusText('Lỗi kết nối khi gửi ảnh OCR');
      setTimeout(() => setOcrStatusText(null), 3000);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
        {/* Hidden file input for OCR image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Input box */}
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-zinc-100/70 hover:bg-zinc-100 focus:bg-white text-zinc-900 placeholder-zinc-400 font-sans text-sm pl-11 pr-32 py-2 rounded-full border border-zinc-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
          />

          {/* Left search icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <Search size={16} />
          </div>

          {/* Right action buttons */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}

            {/* OCR Camera Upload button */}
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isOcrLoading}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                isOcrLoading
                  ? 'bg-orange-50 text-orange-700 border-orange-300 animate-pulse'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-sm active:scale-95'
              }`}
              title="Tìm kiếm sản phẩm bằng hình ảnh qua AI OCR"
            >
              {isOcrLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-orange-600" />
                  <span>OCR...</span>
                </>
              ) : (
                <>
                  <Camera size={13} className="text-orange-600" />
                  <span>Tìm bằng ảnh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* OCR processing toast message */}
      {ocrStatusText && (
        <div className="absolute top-full left-0 mt-2 z-50 flex items-center gap-2 bg-zinc-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg border border-zinc-700">
          <Sparkles size={14} className="text-orange-400 animate-spin" />
          <span>{ocrStatusText}</span>
        </div>
      )}
    </div>
  );
}
