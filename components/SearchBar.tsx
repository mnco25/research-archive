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
  placeholder = 'Search 250M+ papers...',
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
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative z-20">
        <div
          className={`
            relative group flex items-center bg-[var(--bg-surface)] 
            rounded-2xl transition-all duration-300 ease-[var(--ease-spring)]
            ${isFocused || query ? 'shadow-2xl translate-y-[-2px]' : 'shadow-lg'}
            ${large ? 'p-2' : 'p-1.5'}
            border border-[var(--border-subtle)]
          `}
        >
          {/* Search Icon */}
          <div className="pl-4 text-[var(--text-tertiary)] group-focus-within:text-[var(--brand-primary)] transition-colors">
            <svg
              width={large ? '24' : '20'}
              height={large ? '24' : '20'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
              text-[var(--text-primary)] placeholder-[var(--text-quaternary)]
              ${large ? 'h-14 text-lg px-4' : 'h-10 text-base px-3'}
            `}
            aria-label="Search papers"
          />

          <button
            type="submit"
            className={`
              flex-shrink-0 bg-[var(--text-primary)] text-[var(--bg-page)] font-medium
              hover:opacity-90 active:scale-95
              transition-all duration-200
              ${large ? 'px-6 h-14 rounded-xl text-base' : 'px-4 h-10 rounded-lg text-sm'}
            `}
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          className="absolute top-full left-0 right-0 mt-4 bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-10 overflow-hidden animate-enter origin-top"
        >
          {isLoading ? (
            <div className="p-8 flex flex-col items-center justify-center text-[var(--text-tertiary)] gap-3">
              <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Scanning 250M+ papers...</span>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-[var(--text-quaternary)] uppercase tracking-wider">
                Suggested Papers
              </div>
              <ul>
                {suggestions.map((paper, idx) => (
                  <li
                    key={paper.id}
                    className={`
                      px-4 py-3 cursor-pointer
                      transition-colors duration-200 border-l-2
                      ${idx === selectedIndex
                        ? 'bg-[var(--bg-surface-active)] border-[var(--brand-primary)]'
                        : 'border-transparent hover:bg-[var(--bg-surface-hover)]'
                      }
                    `}
                    onClick={() => handleSuggestionClick(paper)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                          ${paper.source === 'arxiv' ? 'bg-red-100 text-red-600' :
                            paper.source === 'pubmed' ? 'bg-blue-100 text-blue-600' :
                              'bg-violet-100 text-violet-600'}
                        `}>
                          {paper.source === 'arxiv' ? 'Ax' : paper.source === 'pubmed' ? 'Pm' : 'Ra'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                          {paper.title}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-2">
                          <span className="truncate max-w-[200px]">
                            {paper.authors.slice(0, 2).map(a => a.name).join(', ')}
                          </span>
                          <span>•</span>
                          <span>{new Date(paper.date).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]/30 text-xs text-[var(--text-quaternary)] flex justify-between">
                <span>Press ↵ to select</span>
                <span>ESC to close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
