'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PaperCard from '@/components/PaperCard';
import type { Paper, SavedPaper } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function SavedPage() {
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('savedPapers');
    if (saved) {
      try {
        const papers = JSON.parse(saved);
        // Sort by saved date, newest first
        papers.sort((a: SavedPaper, b: SavedPaper) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
        setSavedPapers(papers);
      } catch {
        setSavedPapers([]);
      }
    }
    setIsLoading(false);
  }, []);

  const handleRemove = (paper: Paper) => {
    const updated = savedPapers.filter(sp => sp.paper.id !== paper.id);
    setSavedPapers(updated);
    localStorage.setItem('savedPapers', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all saved papers?')) {
      setSavedPapers([]);
      localStorage.removeItem('savedPapers');
    }
  };

  const handleExport = () => {
    // Export as BibTeX
    const bibtexEntries = savedPapers.map(sp => {
      const p = sp.paper;
      const authors = p.authors.map(a => a.name).join(' and ');
      const year = new Date(p.date).getFullYear();
      const key = `${p.authors[0]?.name.split(' ').pop()?.toLowerCase() || 'unknown'}${year}`;

      return `@article{${key},
  author = {${authors}},
  title = {${p.title}},
  year = {${year}},
  url = {${p.url}}${p.externalIds.doi ? `,\n  doi = {${p.externalIds.doi}}` : ''}
}`;
    }).join('\n\n');

    const blob = new Blob([bibtexEntries], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-papers.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-[var(--color-bg-tertiary)] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Saved Papers
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {savedPapers.length} paper{savedPapers.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {savedPapers.length > 0 && (
          <div className="flex gap-3">
            <button onClick={handleExport} className="btn btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export BibTeX
            </button>
            <button onClick={handleClearAll} className="btn btn-ghost text-red-600 hover:bg-red-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear All
            </button>
          </div>
        )}
      </div>

      {savedPapers.length === 0 ? (
        <div className="text-center py-16">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-tertiary)"
            strokeWidth="1.5"
            className="mx-auto mb-4"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            No saved papers yet
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Save papers while searching to build your reading list
          </p>
          <Link href="/search" className="btn btn-primary">
            Start Searching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPapers.map((sp) => (
            <div key={sp.paper.id} className="relative">
              <PaperCard
                paper={sp.paper}
                onSave={handleRemove}
                isSaved={true}
              />
              <div className="absolute top-4 right-4 text-xs text-[var(--color-text-tertiary)]">
                Saved {formatDate(sp.savedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
