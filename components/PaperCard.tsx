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
    <article className="group relative flex flex-col p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl hover:border-[var(--brand-primary)] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 to-[var(--brand-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

      {/* Header with Badges and Save */}
      <div className="relative flex items-center justify-between mb-4 z-10">
        <Badges paper={paper} />

        <button
          onClick={handleSave}
          className={`
            p-2 rounded-full transition-all duration-200
            ${isSaved
              ? 'bg-[var(--brand-primary)] text-white shadow-md'
              : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }
          `}
          aria-label={isSaved ? 'Remove from saved' : 'Save paper'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow">
        <Link href={`/paper/${encodeURIComponent(paper.id)}`} className="block group-hover:text-[var(--brand-primary)] transition-colors">
          <h3 className="font-display font-semibold text-xl leading-snug mb-2 line-clamp-2">
            {paper.title}
          </h3>
        </Link>

        <div className="flex items-center text-sm text-[var(--text-secondary)] mb-4">
          <span className="truncate">{formatAuthors(paper.authors, 2)}</span>
        </div>

        {paper.abstract && (
          <p className="text-sm text-[var(--text-tertiary)] leading-relaxed line-clamp-3 mb-4">
            {paper.abstract}
          </p>
        )}
      </div>

      {/* Footer Metadata */}
      <div className="relative z-10 mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--text-quaternary)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {formatDate(paper.date)}
          </span>
          {paper.citations > 0 && (
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              {formatNumber(paper.citations)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="uppercase">PDF</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
