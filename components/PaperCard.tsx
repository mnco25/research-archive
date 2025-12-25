'use client';

import Link from 'next/link';
import type { Paper } from '@/lib/types';
import { formatDate, formatNumber, formatAuthors } from '@/lib/utils';
import Badges from './Badges';

interface PaperCardProps {
  paper: Paper;
  onSave?: (paper: Paper) => void;
  isSaved?: boolean;
}

export default function PaperCard({ paper, onSave, isSaved = false }: PaperCardProps) {
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(paper);
  };

  return (
    <article className="group p-5 md:p-6 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-xl hover:border-[var(--color-accent-primary)] hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col gap-3">
        {/* Header with source badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badges paper={paper} />
          </div>
          
          {/* Save button - always visible on mobile, hover on desktop */}
          <button
            onClick={handleSave}
            className={`
              flex-shrink-0 p-2 rounded-lg transition-all duration-200
              md:opacity-0 md:group-hover:opacity-100
              ${isSaved 
                ? 'bg-[var(--color-accent-primary)] text-white' 
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)]'
              }
            `}
            aria-label={isSaved ? 'Remove from saved' : 'Save paper'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <Link href={`/paper/${encodeURIComponent(paper.id)}`} className="block">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] leading-snug hover:text-[var(--color-accent-primary)] transition-colors line-clamp-2">
            {paper.title}
          </h3>
        </Link>

        {/* Authors */}
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1">
          {formatAuthors(paper.authors, 3)}
        </p>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(paper.date)}
          </span>
          {paper.journal && (
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="italic truncate">{paper.journal}</span>
            </span>
          )}
          {paper.citations > 0 && (
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {formatNumber(paper.citations)} citations
            </span>
          )}
        </div>

        {/* Abstract */}
        {paper.abstract && (
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
            {paper.abstract}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 mt-auto">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              PDF
            </a>
          )}
          
          <Link
            href={`/paper/${encodeURIComponent(paper.id)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent-primary)] transition-colors ml-auto"
          >
            View Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
