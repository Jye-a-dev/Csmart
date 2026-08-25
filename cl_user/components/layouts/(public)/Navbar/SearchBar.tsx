'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm thông minh (ví dụ: áo polo nam, tai nghe chống ồn)...',
}: SearchBarProps) {
  const [query, setQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || '';
    }
    return '';
  });
  const [, startTransition] = useTransition();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
        {/* Input box */}
        <div className="relative w-full flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full bg-zinc-100/70 hover:bg-zinc-100 focus:bg-white text-zinc-900 placeholder-zinc-400 font-sans text-sm pl-11 pr-20 py-2 rounded-full border border-zinc-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
          />

          {/* Left search icon button */}
          <button
            type="submit"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-600 transition-colors cursor-pointer p-0.5"
            title="Tìm kiếm"
          >
            <Search size={16} />
          </button>

          {/* Right action buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Tìm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
