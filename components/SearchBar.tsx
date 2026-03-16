'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import type { Paper } from '@/lib/types';

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  initialQuery = '',
  large = false,
  onSearch,
  placeholder = 'Search papers, authors, topics...',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Paper[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestionsDebounced = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.papers || []);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    fetchSuggestionsDebounced(value);
    setShowSuggestions(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (paper: Paper) => {
    setShowSuggestions(false);
    router.push(`/paper/${encodeURIComponent(paper.id)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center bg-[var(--bg-elevated)] border rounded-[var(--radius-lg)]
            transition-all
            ${isFocused
              ? 'border-[hsl(var(--accent))] shadow-[var(--shadow-focus)]'
              : 'border-[var(--border-primary)] shadow-[var(--shadow-sm)]'
            }
          `}
          style={{ transitionDuration: 'var(--duration-fast)' }}
        >
          {/* Icon */}
          <div className={`pl-4 transition-colors ${isFocused ? 'text-[hsl(var(--accent))]' : 'text-[var(--text-tertiary)]'}`}>
            <svg width={large ? 20 : 16} height={large ? 20 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              setIsFocused(true);
              if (query.length >= 2) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              flex-1 bg-transparent border-none outline-none
              text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]
              ${large ? 'h-[52px] text-[15px] px-3' : 'h-[40px] text-[14px] px-3'}
            `}
            aria-label="Search papers"
          />

          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
              className="p-1.5 mr-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}

          <button
            type="submit"
            className={`
              flex-shrink-0 bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium
              hover:opacity-85 active:scale-[0.97] transition-all mr-2
              ${large ? 'px-6 h-[42px] rounded-[var(--radius-md)] text-[14px]' : 'px-4 h-[32px] rounded-[var(--radius-sm)] text-[13px]'}
            `}
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-fade">
          {isLoading ? (
            <div className="px-4 py-6 flex items-center justify-center gap-3 text-[var(--text-tertiary)]">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px]">Searching...</span>
            </div>
          ) : (
            <>
              <div className="px-3 py-2">
                <span className="text-label">Results</span>
              </div>
              <ul>
                {suggestions.map((paper, idx) => (
                  <li
                    key={paper.id}
                    className={`
                      px-3 py-2.5 cursor-pointer transition-colors text-[13px]
                      ${idx === selectedIndex ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-[var(--bg-secondary)]'}
                    `}
                    onClick={() => handleSuggestionClick(paper)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="font-medium text-[var(--text-primary)] line-clamp-1 mb-0.5">
                      {paper.title}
                    </div>
                    <div className="text-[12px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                      <span className="truncate max-w-[200px]">
                        {paper.authors.slice(0, 2).map(a => a.name).join(', ')}
                      </span>
                      <span>·</span>
                      <span>{new Date(paper.date).getFullYear()}</span>
                      <span>·</span>
                      <span className="capitalize">{paper.source}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-3 py-2 border-t border-[var(--border-secondary)] flex justify-between text-[11px] text-[var(--text-tertiary)]">
                <span>↑↓ Navigate</span>
                <span>↵ Select · Esc Close</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
