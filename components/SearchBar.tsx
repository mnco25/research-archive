'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import type { Paper } from '@/lib/types';

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
  onSearch?: (query: string) => void;
  onLiveSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  initialQuery = '',
  large = false,
  onSearch,
  onLiveSearch,
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const liveSearchDebounced = useCallback(
    debounce((searchQuery: string) => {
      onLiveSearch?.(searchQuery);
    }, 500),
    [onLiveSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    fetchSuggestionsDebounced(value);
    liveSearchDebounced(value);
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
    setQuery('');
    router.push(`/paper/${encodeURIComponent(paper.id)}`);
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() 
        ? <span key={i} className="text-[hsl(var(--accent))] font-extrabold">{part}</span> 
        : part
    );
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

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [autoFocus]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center bg-[var(--bg-elevated)] border rounded-[var(--radius-lg)]
            transition-all duration-500 ease-out
            ${isFocused
              ? 'border-[hsl(var(--accent))] shadow-[0_0_0_4px_hsl(var(--accent)/0.15)] ring-1 ring-[hsl(var(--accent)/0.5)]'
              : 'border-[var(--border-primary)] shadow-[var(--shadow-sm)] hover:border-[var(--text-tertiary)] hover:shadow-md'
            }
          `}
        >
          {/* Icon with scale bounce on focus */}
          <div className={`pl-5 transition-all duration-500 ease-out flex items-center justify-center ${isFocused ? 'text-[hsl(var(--accent))] scale-110 drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]' : 'text-[var(--text-tertiary)] scale-100'}`}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width={large ? 22 : 18} height={large ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
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
              flex-1 bg-transparent border-none outline-none font-medium tracking-tight
              text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]
              transition-all duration-300
              ${large ? 'h-[60px] text-[17px] px-4' : 'h-[44px] text-[15px] px-3'}
            `}
            aria-label="Search papers"
          />

          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
              className="p-2 mr-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}

          {/* Keyboard shortcut indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[9px] font-bold text-[var(--text-tertiary)] mr-4 select-none group-hover:border-[var(--text-tertiary)] transition-colors">
             <span>⌘</span>
             <span>K</span>
          </div>
        </div>
      </form>

      {/* Suggestions dropdown - Clean & Scrollable */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-primary)]/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 overflow-hidden animate-in filter drop-shadow-xl">
          <div className="max-h-[380px] overflow-y-auto py-2">
            {isLoading ? (
              <div className="px-4 py-6 flex items-center justify-center gap-3 text-[var(--text-tertiary)]">
                <div className="w-4 h-4 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
                <span className="text-[13px] font-medium">Searching archive...</span>
              </div>
            ) : (
              <>
                <div className="px-4 py-2 border-b border-[var(--border-secondary)]/50 mb-1">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Suggestions</span>
                </div>
                <ul>
                  {suggestions.map((paper, idx) => (
                    <li
                      key={paper.id}
                      className={`
                        px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-3
                        ${idx === selectedIndex ? 'bg-[var(--bg-tertiary)] ring-1 ring-[hsl(var(--accent)/0.2)]' : 'hover:bg-[var(--bg-secondary)]/50'}
                      `}
                      onClick={() => handleSuggestionClick(paper)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className={`w-1 h-5 mt-0.5 rounded-full transition-all duration-300 ${idx === selectedIndex ? 'bg-[hsl(var(--accent))] opacity-100' : 'bg-transparent opacity-0'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[var(--text-primary)] text-[14px] leading-snug line-clamp-1 mb-0.5">
                          {highlightMatch(paper.title, query)}
                        </div>
                        <div className="text-[12px] text-[var(--text-tertiary)] font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                          <span className="truncate max-w-[150px] text-[var(--text-secondary)]">
                            {paper.authors[0]?.name || 'Unknown'}
                          </span>
                          <span className="opacity-30">/</span>
                          <span>{new Date(paper.date).getFullYear()}</span>
                          <span className="opacity-30">/</span>
                          <span className="text-[hsl(var(--accent))]">{paper.source}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                  {/* Quick Search Action at bottom */}
                  <li 
                    className="mt-1 px-4 py-3 bg-[var(--bg-tertiary)]/30 border-t border-[var(--border-secondary)]/50 cursor-pointer hover:bg-[var(--bg-tertiary)]/60 transition-colors flex items-center justify-between"
                    onClick={handleSubmit}
                  >
                    <span className="text-[13px] font-bold text-[var(--text-primary)]">Search for &ldquo;{query}&rdquo;</span>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-tighter opacity-60">↵ Enter</span>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
