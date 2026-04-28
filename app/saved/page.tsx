'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PaperCard from '@/components/PaperCard';
import { useToast } from '@/components/Toast';
import type { Paper, SavedPaper, CitationFormat } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { formatCitations } from '@/lib/citation-formatter';
import { clearSavedPapers, toggleSavedPaper, useSavedPapers, writeSavedPapers } from '@/lib/saved-papers';

const EXPORTS: { format: CitationFormat; label: string; ext: string; mime: string }[] = [
  { format: 'bibtex', label: 'BibTeX', ext: 'bib', mime: 'application/x-bibtex' },
  { format: 'ris', label: 'RIS', ext: 'ris', mime: 'application/x-research-info-systems' },
  { format: 'apa', label: 'APA', ext: 'txt', mime: 'text/plain' },
  { format: 'mla', label: 'MLA', ext: 'txt', mime: 'text/plain' },
];

export default function SavedPage() {
  const papers = useSavedPapers();
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...papers].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(sp => {
      const p = sp.paper;
      return (
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.some(a => a.name.toLowerCase().includes(q)) ||
        (p.keywords || []).some(k => k.toLowerCase().includes(q)) ||
        (p.journal || '').toLowerCase().includes(q)
      );
    });
  }, [papers, search]);

  const handleRemove = (paper: Paper) => {
    toggleSavedPaper(paper);
    addToast('Removed from library', 'info');
  };

  const handleClearAll = () => {
    if (!confirm('Remove all saved papers? This cannot be undone.')) return;
    clearSavedPapers();
    addToast('Library cleared', 'info');
  };

  const handleExport = (format: CitationFormat, ext: string, mime: string) => {
    if (filtered.length === 0) return;
    const content = formatCitations(filtered.map(sp => sp.paper), format);
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-archive-library.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${filtered.length} papers as ${format.toUpperCase()}`, 'success');
  };

  const handleExportJson = () => {
    if (papers.length === 0) return;
    const blob = new Blob([JSON.stringify(papers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-archive-library.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Library exported as JSON', 'success');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const incoming = JSON.parse(text) as SavedPaper[];
      if (!Array.isArray(incoming)) throw new Error('Invalid file');
      const existingIds = new Set(papers.map(p => p.paper.id));
      const merged = [
        ...incoming.filter(item => item?.paper?.id && !existingIds.has(item.paper.id)),
        ...papers,
      ];
      const newCount = merged.length - papers.length;
      writeSavedPapers(merged);
      addToast(`Imported ${newCount} papers`, 'success');
    } catch {
      addToast('Failed to import library', 'error');
    }
  };

  if (!mounted) {
    return (
      <div className="container-app pt-24 pb-16">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app pt-24 pb-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-title text-[26px] md:text-[32px] tracking-tight mb-1">Library</h1>
          <p className="text-[13.5px] text-[var(--text-secondary)]">
            {papers.length} paper{papers.length !== 1 ? 's' : ''} saved · stored locally in your browser
          </p>
        </div>
        {papers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {EXPORTS.map(opt => (
              <button
                key={opt.format}
                onClick={() => handleExport(opt.format, opt.ext, opt.mime)}
                className="btn btn-sm btn-secondary"
                type="button"
              >
                Export {opt.label}
              </button>
            ))}
            <button onClick={handleExportJson} className="btn btn-sm btn-secondary" type="button">
              Export JSON
            </button>
            <button onClick={handleClearAll} className="btn btn-sm btn-ghost text-[var(--error)]" type="button">
              Clear all
            </button>
          </div>
        )}
      </header>

      {papers.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <input
            type="search"
            placeholder="Filter your library…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input max-w-md"
          />
          <label className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = '';
              }}
            />
            Import JSON
          </label>
        </div>
      )}

      {papers.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-heading text-[16px] mb-1">Your library is empty</h2>
          <p className="text-[13.5px] text-[var(--text-tertiary)] mb-5">
            Tap the bookmark icon on any paper to save it here.
          </p>
          <Link href="/search" className="btn btn-md btn-primary">Start searching</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[var(--text-tertiary)]">
            No saved papers match &ldquo;{search}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sp => (
            <div key={sp.paper.id}>
              <PaperCard paper={sp.paper} onSave={handleRemove} isSaved />
              <p className="text-[11.5px] text-[var(--text-tertiary)] mt-1.5 ml-1">
                Saved {formatDate(sp.savedAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
