'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import type { Suggestion } from '@/lib/types';

interface SearchBarProps {
  initialQuery?: string;
  large?: boolean;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showShortcut?: boolean;
}

export default function SearchBar({
  initialQuery = '',
  large = false,
  onSearch,
  placeholder = 'Search papers, authors, or topics…',
  autoFocus = false,
  showShortcut = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [lastInitial, setLastInitial] = useState(initialQuery);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  if (initialQuery !== lastInitial) {
    setLastInitial(initialQuery);
    setQuery(initialQuery);
  }

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (value: string) => {
        const trimmed = value.trim();
        if (trimmed.length < 2) {
          setSuggestions([]);
          setIsLoading(false);
          return;
        }
        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        try {
          const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}&limit=6`);
          if (!res.ok) throw new Error('failed');
          const data: { suggestions: Suggestion[] } = await res.json();
          if (requestId === requestIdRef.current) {
            setSuggestions(data.suggestions || []);
          }
        } catch {
          if (requestId === requestIdRef.current) setSuggestions([]);
        } finally {
          if (requestId === requestIdRef.current) setIsLoading(false);
        }
      }, 220),
    []
  );

  useEffect(() => () => fetchSuggestions.cancel(), [fetchSuggestions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    inputRef.current?.blur();
    if (onSearch) onSearch(trimmed);
    else router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(query);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    router.push(`/paper/${encodeURIComponent(suggestion.id)}`);
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
    const onClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
    const onGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [autoFocus]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search">
        <div
          className={`relative flex items-center bg-[var(--bg-elevated)] border rounded-[var(--radius-lg)] transition-all duration-200 ${
            isFocused
              ? 'border-[hsl(var(--accent))] shadow-[var(--shadow-focus)]'
              : 'border-[var(--border-primary)] hover:border-[var(--text-tertiary)]'
          }`}
        >
          <div className={`pl-4 flex items-center justify-center transition-colors ${isFocused ? 'text-[hsl(var(--accent))]' : 'text-[var(--text-tertiary)]'}`}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width={large ? 20 : 18} height={large ? 20 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              if (query.trim().length >= 2 && suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className={`flex-1 bg-transparent border-none outline-none font-medium text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] ${
              large ? 'h-[58px] text-[16px] px-3' : 'h-[44px] text-[14px] px-3'
            }`}
            aria-label="Search papers"
            aria-autocomplete="list"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-2 mr-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {showShortcut && !query && (
            <kbd className="hidden md:flex items-center gap-1 px-1.5 py-1 mr-3 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-primary)]/60 text-[10px] font-semibold text-[var(--text-tertiary)] select-none">
              <span>⌘</span><span>K</span>
            </kbd>
          )}
        </div>
      </form>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          id="search-suggestions"
          className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-50 overflow-hidden"
          role="listbox"
        >
          {isLoading && suggestions.length === 0 ? (
            <div className="px-4 py-5 flex items-center justify-center gap-2 text-[var(--text-tertiary)]">
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px]">Searching…</span>
            </div>
          ) : (
            <ul className="py-1.5 max-h-[420px] overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <li
                  key={suggestion.id}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className={`px-3 py-2.5 mx-1.5 rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                    idx === selectedIndex ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-[var(--bg-secondary)]'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="font-medium text-[var(--text-primary)] text-[13.5px] leading-snug line-clamp-2">
                    {suggestion.title}
                  </div>
                  {suggestion.hint && (
                    <div className="text-[11.5px] text-[var(--text-tertiary)] mt-0.5 line-clamp-1">
                      {suggestion.hint}
                    </div>
                  )}
                </li>
              ))}
              <li
                className="mx-1.5 mt-1 px-3 py-2.5 rounded-[var(--radius-md)] flex items-center justify-between cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors border-t border-[var(--border-secondary)]/60"
                onClick={() => submit(query)}
                role="option"
                aria-selected={false}
              >
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  Search for &ldquo;{query}&rdquo;
                </span>
                <span className="text-[10.5px] font-semibold text-[var(--text-tertiary)] tracking-wider">↵ ENTER</span>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
