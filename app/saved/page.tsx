'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PaperCard from '@/components/PaperCard';
import type { Paper, SavedPaper } from '@/lib/types';
import { formatDate } from '@/lib/utils';

function getSavedPapers(): SavedPaper[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('savedPapers');
  if (!saved) return [];
  try {
    const papers = JSON.parse(saved);
    papers.sort((a: SavedPaper, b: SavedPaper) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    return papers;
  } catch { return []; }
}

export default function SavedPage() {
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPapers(getSavedPapers());
  }, []);

  const handleRemove = (paper: Paper) => {
    const updated = papers.filter(sp => sp.paper.id !== paper.id);
    setPapers(updated);
    localStorage.setItem('savedPapers', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm('Remove all saved papers?')) {
      setPapers([]);
      localStorage.removeItem('savedPapers');
    }
  };

  const handleExport = () => {
    const bib = papers.map(sp => {
      const p = sp.paper;
      const authors = p.authors.map(a => a.name).join(' and ');
      const year = new Date(p.date).getFullYear();
      const key = `${p.authors[0]?.name.split(' ').pop()?.toLowerCase() || 'unknown'}${year}`;
      return `@article{${key},\n  author = {${authors}},\n  title = {${p.title}},\n  year = {${year}},\n  url = {${p.url}}${p.externalIds.doi ? `,\n  doi = {${p.externalIds.doi}}` : ''}\n}`;
    }).join('\n\n');

    const blob = new Blob([bib], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-papers.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return (
      <div className="container-app pt-24 pb-16">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 skeleton rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app pt-24 pb-16">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-title text-[24px] md:text-[28px] mb-1">Library</h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            {papers.length} paper{papers.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {papers.length > 0 && (
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn btn-sm btn-secondary">
              Export BibTeX
            </button>
            <button onClick={handleClearAll} className="btn btn-sm btn-ghost text-[var(--error)] hover:bg-[var(--error)]/5">
              Clear all
            </button>
          </div>
        )}
      </div>

      {papers.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-heading text-[16px] mb-1">No saved papers</h2>
          <p className="text-[13px] text-[var(--text-tertiary)] mb-6">Papers you save will appear here.</p>
          <Link href="/search" className="btn btn-md btn-primary">
            Start searching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map(sp => (
            <div key={sp.paper.id} className="relative">
              <PaperCard paper={sp.paper} onSave={handleRemove} isSaved />
              <span className="absolute top-5 right-14 text-[11px] text-[var(--text-tertiary)]">
                {formatDate(sp.savedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
