'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const EVENT_NAME = 'research-archive:theme-change';

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

export function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return null;
}

function detectActualTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  const stored = readStoredTheme();
  if (stored) return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onChange = () => callback();
  window.addEventListener(EVENT_NAME, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT_NAME, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    detectActualTheme,
    () => 'light' as Theme
  );

  const mounted = typeof window !== 'undefined';

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }, []);

  const toggle = useCallback(() => {
    const current = detectActualTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return { theme, setTheme, toggle, mounted };
}
