'use client';

import { useState, useEffect, useRef, useTransition, useCallback, ChangeEvent } from 'react';
import { Search, X, Camera, Loader2, Sparkles } from 'lucide-react';
import { useOcrRecords } from '@/hooks';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Tìm sản phẩm thông minh (ví dụ: áo polo nam, tai nghe chống ồn)...',
}: SearchBarProps) {
  const [query, setQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { submitImage, loading: ocrLoading } = useOcrRecords();
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Sync state when external search events are fired
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleExternalSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const val = customEvent.detail ?? '';
      setQuery(val);
    };

    window.addEventListener('csmart-search', handleExternalSearch);
    return () => window.removeEventListener('csmart-search', handleExternalSearch);
  }, []);

  const triggerSearch = useCallback(
    (text: string, shouldScroll = false) => {
      const trimmed = text.trim();

      // 1. Invoke onSearch prop if provided
      if (onSearch) {
        startTransition(() => {
          onSearch(trimmed);
        });
      }

      // 2. Sync URL query parameter without full reload
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (trimmed) {
          params.set('q', trimmed);
        } else {
          params.delete('q');
        }
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);

        // 3. Dispatch global custom event for main page listener
        window.dispatchEvent(new CustomEvent('csmart-search', { detail: trimmed }));

        // 4. Smooth scroll to products section
        if (shouldScroll) {
          const el = document.getElementById('featured-products');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    },
    [onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      triggerSearch(val, false);
    }, 350);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    triggerSearch(query, true);
  };

  const handleClear = () => {
    setQuery('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    triggerSearch('', false);
  };

  // OCR Image search handler
  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const res = await submitImage(file);
      // If OCR recognizes text or keywords
      const detectedText =
        (res as { text?: string; result?: string; query?: string }).text ||
        (res as { text?: string; result?: string; query?: string }).result ||
        (res as { text?: string; result?: string; query?: string }).query ||
        file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      if (detectedText) {
        setQuery(detectedText);
        triggerSearch(detectedText, true);
      }
    } catch {
      // Graceful fallback to filename search on backend mock
      const fallbackQuery = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setQuery(fallbackQuery);
      triggerSearch(fallbackQuery, true);
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full group">
        <div className="relative w-full flex items-center">
          {/* Left search icon button */}
          <button
            type="submit"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-600 transition-colors cursor-pointer p-0.5"
            title="Tìm kiếm"
          >
            <Search size={16} />
          </button>

          {/* Search Input Box */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white text-zinc-900 placeholder-zinc-400 font-sans text-xs sm:text-sm pl-10 pr-28 py-2.5 rounded-full border border-zinc-200/90 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all shadow-xs"
          />

          {/* Hidden File Input for OCR Search */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            id="ocr-image-upload"
          />

          {/* Right action controls */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer rounded-full"
                title="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}

            {/* OCR Camera Action Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading || isProcessingImage}
              className="p-1.5 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all cursor-pointer relative group/ocr"
              title="Tìm kiếm bằng hình ảnh (AI OCR)"
            >
              {ocrLoading || isProcessingImage ? (
                <Loader2 size={15} className="animate-spin text-orange-600" />
              ) : (
                <div className="relative">
                  <Camera size={15} />
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange-500 rounded-full ring-1 ring-white" />
                </div>
              )}
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover/ocr:scale-100 transition-transform bg-zinc-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap pointer-events-none shadow-md flex items-center gap-1">
                <Sparkles size={10} className="text-orange-400" />
                Tìm bằng ảnh
              </span>
            </button>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Tìm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
