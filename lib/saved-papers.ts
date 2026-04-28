'use client';

import { useMemo, useSyncExternalStore } from 'react';
import type { Paper, SavedPaper } from '@/lib/types';

const STORAGE_KEY = 'savedPapers';
const CHANGE_EVENT = 'saved-papers:change';

export function readSavedPapers(): SavedPaper[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedPaper =>
        !!item && typeof item === 'object' && 'paper' in item && 'savedAt' in item
    );
  } catch {
    return [];
  }
}

export function writeSavedPapers(papers: SavedPaper[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch { /* storage may be full or disabled */ }
}

export function isSaved(papers: SavedPaper[], id: string): boolean {
  return papers.some(p => p.paper.id === id);
}

export function toggleSavedPaper(paper: Paper): { saved: boolean; papers: SavedPaper[] } {
  const list = readSavedPapers();
  const existingIndex = list.findIndex(sp => sp.paper.id === paper.id);
  let nextList: SavedPaper[];
  let saved: boolean;

  if (existingIndex >= 0) {
    nextList = list.filter((_, i) => i !== existingIndex);
    saved = false;
  } else {
    nextList = [{ paper, savedAt: new Date().toISOString() }, ...list];
    saved = true;
  }
  writeSavedPapers(nextList);
  return { saved, papers: nextList };
}

export function clearSavedPapers(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

let cachedList: SavedPaper[] | null = null;

function getSnapshot(): SavedPaper[] {
  const list = readSavedPapers();
  if (
    cachedList &&
    cachedList.length === list.length &&
    cachedList.every((sp, i) => sp.paper.id === list[i]?.paper.id && sp.savedAt === list[i]?.savedAt)
  ) {
    return cachedList;
  }
  cachedList = list;
  return list;
}

function getServerSnapshot(): SavedPaper[] {
  return [];
}

function subscribeStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => {
    cachedList = null;
    callback();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function useSavedPapers(): SavedPaper[] {
  return useSyncExternalStore(subscribeStore, getSnapshot, getServerSnapshot);
}

export function useSavedIds(): Set<string> {
  const list = useSavedPapers();
  return useMemo(() => new Set(list.map(sp => sp.paper.id)), [list]);
}
