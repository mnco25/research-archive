'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Badges from '@/components/Badges';
import Citation from '@/components/Citation';
import PaperCard from '@/components/PaperCard';
import { PaperDetailSkeleton } from '@/components/Loading';
import type { PaperDetail, Paper } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/papers/${encodeURIComponent(resolvedParams.id)}`);
        if (!res.ok) throw new Error(res.status === 404 ? 'Paper not found' : 'Failed to load paper');
        const data = await res.json();
        setPaper(data);
        const saved = localStorage.getItem('savedPapers');
        if (saved) {
          const papers = JSON.parse(saved);
          setIsSaved(papers.some((p: { paper: Paper }) => p.paper.id === data.id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [resolvedParams.id]);

  const handleSave = () => {
    if (!paper) return;
    const saved = localStorage.getItem('savedPapers');
    let papers: { paper: Paper; savedAt: string }[] = [];
    try { papers = saved ? JSON.parse(saved) : []; } catch { papers = []; }

    if (isSaved) {
      papers = papers.filter(p => p.paper.id !== paper.id);
      setIsSaved(false);
    } else {
      papers.push({ paper, savedAt: new Date().toISOString() });
      setIsSaved(true);
    }
    localStorage.setItem('savedPapers', JSON.stringify(papers));
  };

  if (isLoading) {
    return (
      <div className="container-app pt-24 pb-16 max-w-4xl">
        <PaperDetailSkeleton />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="container-app pt-32 pb-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-heading text-[18px] mb-2">{error || 'Paper not found'}</h1>
        <p className="text-[14px] text-[var(--text-tertiary)] mb-6">The paper couldn&apos;t be loaded.</p>
        <Link href="/search" className="btn btn-md btn-primary">Back to Search</Link>
      </div>
    );
  }

  return (
    <article className="container-app pt-24 pb-16 max-w-5xl animate-in">
      {/* Breadcrumb */}
      <nav className="text-[12px] text-[var(--text-tertiary)] mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-[var(--text-primary)] transition-colors">Search</Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)]">Paper</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badges paper={paper} showAll />
        </div>

        <h1 className="text-title text-[24px] md:text-[32px] text-[var(--text-primary)] leading-[1.2] mb-5">
          {paper.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[var(--text-secondary)]">
          <div className="flex flex-wrap gap-1">
            {paper.authors.map((author, i) => (
              <span key={i}>
                <Link
                  href={`/search?q=${encodeURIComponent(author.name)}`}
                  className="hover:text-[hsl(var(--accent))] transition-colors underline decoration-transparent hover:decoration-current"
                >
                  {author.name}
                </Link>
                {i < paper.authors.length - 1 && ', '}
              </span>
            ))}
          </div>
          {paper.date && (
            <span className="text-[var(--text-tertiary)]">{formatDate(paper.date)}</span>
          )}
        </div>
      </header>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-10">
        {paper.pdfUrl && (
          <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-md btn-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            Read PDF
          </a>
        )}
        <button onClick={handleSave} className={`btn btn-md ${isSaved ? 'btn-primary' : 'btn-secondary'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="btn btn-md btn-ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          Source
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2 space-y-10">
          {/* Abstract */}
          <section>
            <h2 className="text-heading text-[16px] mb-3">Abstract</h2>
            <div className="prose-content">
              {paper.abstract || <p className="italic text-[var(--text-tertiary)]">No abstract available.</p>}
            </div>
          </section>

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <section>
              <h2 className="text-heading text-[16px] mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-1.5">
                {paper.keywords.map((kw, i) => (
                  <Link
                    key={i}
                    href={`/search?q=${encodeURIComponent(kw)}`}
                    className="badge badge-neutral hover:border-[hsl(var(--accent)/0.5)] hover:text-[hsl(var(--accent))] transition-colors"
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Citation */}
          <section>
            <h2 className="text-heading text-[16px] mb-3">Cite this Paper</h2>
            <Citation paper={paper} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card p-5">
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border-secondary)]">
              Paper Info
            </h3>
            <dl className="space-y-4 text-[13px]">
              <div>
                <dt className="text-[var(--text-tertiary)] mb-0.5">Citations</dt>
                <dd className="font-semibold text-[var(--text-primary)] text-[18px]">{formatNumber(paper.citations)}</dd>
              </div>
              {paper.journal && (
                <div>
                  <dt className="text-[var(--text-tertiary)] mb-0.5">Journal</dt>
                  <dd className="text-[var(--text-primary)]">{paper.journal}</dd>
                </div>
              )}
              {paper.externalIds.doi && (
                <div>
                  <dt className="text-[var(--text-tertiary)] mb-0.5">DOI</dt>
                  <dd className="text-[var(--text-primary)] break-all text-[12px]">{paper.externalIds.doi}</dd>
                </div>
              )}
              <div>
                <dt className="text-[var(--text-tertiary)] mb-0.5">Source</dt>
                <dd className="text-[var(--text-primary)] capitalize">{paper.source}</dd>
              </div>
            </dl>
          </div>

          {paper.relatedPapers && paper.relatedPapers.length > 0 && (
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-3">Related</h3>
              <div className="space-y-3">
                {paper.relatedPapers.map(p => <PaperCard key={p.id} paper={p} />)}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
