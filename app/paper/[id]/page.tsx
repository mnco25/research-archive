'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Badges from '@/components/Badges';
import Citation from '@/components/Citation';
import PaperCard from '@/components/PaperCard';
import { PaperDetailSkeleton } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import type { PaperDetail } from '@/lib/types';
import { calculateReadingTime, formatDate, formatNumber } from '@/lib/utils';
import { readSavedPapers, toggleSavedPaper } from '@/lib/saved-papers';

export default function PaperPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/papers/${encodeURIComponent(resolvedParams.id)}`);
        if (!res.ok) throw new Error(res.status === 404 ? 'Paper not found' : 'Failed to load paper');
        const data: PaperDetail = await res.json();
        if (cancelled) return;
        setPaper(data);
        setIsSaved(readSavedPapers().some(sp => sp.paper.id === data.id));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  const handleSave = () => {
    if (!paper) return;
    const { saved } = toggleSavedPaper(paper);
    setIsSaved(saved);
    addToast(saved ? 'Added to your library' : 'Removed from library', saved ? 'success' : 'info');
  };

  const sharePaper = async () => {
    if (!paper) return;
    const url = `${window.location.origin}/paper/${encodeURIComponent(paper.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: paper.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        addToast('Link copied to clipboard', 'success');
      }
    } catch { /* user dismissed share */ }
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-heading text-[18px] mb-2">{error || 'Paper not found'}</h1>
        <p className="text-[14px] text-[var(--text-tertiary)] mb-6">The paper couldn&apos;t be loaded right now.</p>
        <Link href="/search" className="btn btn-md btn-primary">Back to search</Link>
      </div>
    );
  }

  const readingTime = paper.abstract ? calculateReadingTime(paper.abstract) : 0;
  const related = paper.relatedPapers || [];
  const citing = paper.citedBy || [];

  return (
    <article className="container-app pt-24 pb-16 max-w-5xl animate-in">
      <nav className="flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/search" className="hover:text-[var(--text-primary)] transition-colors">Search</Link>
        <span>/</span>
        <span className="text-[var(--text-secondary)] truncate max-w-[40ch]">{paper.title}</span>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badges paper={paper} showAll />
        </div>

        <h1 className="text-title text-[26px] md:text-[34px] text-[var(--text-primary)] leading-[1.2] mb-4 tracking-tight">
          {paper.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px] text-[var(--text-secondary)]">
          {paper.authors.length > 0 && (
            <span className="inline-flex flex-wrap gap-x-1 gap-y-1">
              {paper.authors.slice(0, 8).map((author, i) => (
                <span key={i}>
                  <Link
                    href={`/search?q=${encodeURIComponent(author.name)}`}
                    className="hover:text-[hsl(var(--accent))] transition-colors"
                  >
                    {author.name}
                  </Link>
                  {i < Math.min(paper.authors.length, 8) - 1 && ','}
                </span>
              ))}
              {paper.authors.length > 8 && <span className="text-[var(--text-tertiary)]">+{paper.authors.length - 8} more</span>}
            </span>
          )}
          {paper.date && <span className="text-[var(--text-tertiary)]">· {formatDate(paper.date)}</span>}
          {readingTime > 0 && <span className="text-[var(--text-tertiary)]">· {readingTime} min read</span>}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-10">
        {paper.pdfUrl && (
          <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-md btn-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Read PDF
          </a>
        )}
        <button onClick={handleSave} className={`btn btn-md ${isSaved ? 'btn-primary' : 'btn-secondary'}`} type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="btn btn-md btn-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open source
        </a>
        <button onClick={sharePaper} className="btn btn-md btn-ghost" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-heading text-[16px] mb-3 tracking-tight">Abstract</h2>
            <div className="prose-content">
              {paper.abstract ? (
                <p>{paper.abstract}</p>
              ) : (
                <p className="italic text-[var(--text-tertiary)]">No abstract available for this paper.</p>
              )}
            </div>
          </section>

          {paper.keywords && paper.keywords.length > 0 && (
            <section>
              <h2 className="text-heading text-[16px] mb-3 tracking-tight">Keywords</h2>
              <div className="flex flex-wrap gap-1.5">
                {paper.keywords.map((kw, i) => (
                  <Link
                    key={`${kw}-${i}`}
                    href={`/search?q=${encodeURIComponent(kw)}`}
                    className="badge badge-neutral hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-colors"
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-heading text-[16px] mb-3 tracking-tight">Cite this paper</h2>
            <Citation paper={paper} />
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-heading text-[16px] mb-3 tracking-tight">Related papers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map(p => <PaperCard key={p.id} paper={p} variant="compact" />)}
              </div>
            </section>
          )}

          {citing.length > 0 && (
            <section>
              <h2 className="text-heading text-[16px] mb-3 tracking-tight">Cited by</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {citing.map(p => <PaperCard key={p.id} paper={p} variant="compact" />)}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-5">
            <h3 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              Paper Info
            </h3>
            <dl className="space-y-3 text-[13px]">
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
                  <dd className="text-[var(--text-primary)] break-all text-[12px]">
                    <a
                      href={`https://doi.org/${paper.externalIds.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[hsl(var(--accent))]"
                    >
                      {paper.externalIds.doi}
                    </a>
                  </dd>
                </div>
              )}
              {paper.externalIds.arxivId && (
                <div>
                  <dt className="text-[var(--text-tertiary)] mb-0.5">arXiv ID</dt>
                  <dd className="text-[var(--text-primary)] text-[12px]">{paper.externalIds.arxivId}</dd>
                </div>
              )}
              {paper.externalIds.pmid && (
                <div>
                  <dt className="text-[var(--text-tertiary)] mb-0.5">PMID</dt>
                  <dd className="text-[var(--text-primary)] text-[12px]">{paper.externalIds.pmid}</dd>
                </div>
              )}
              <div>
                <dt className="text-[var(--text-tertiary)] mb-0.5">Source</dt>
                <dd className="text-[var(--text-primary)] capitalize">{paper.source}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <ToastContainer />
    </article>
  );
}
