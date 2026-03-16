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
    <article className="card p-5 group relative">
      {/* Top row: badges + save */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badges paper={paper} />
        </div>
        {onSave && (
          <button
            onClick={handleSave}
            className={`
              p-1.5 rounded-md transition-colors
              ${isSaved
                ? 'text-[hsl(var(--accent))]'
                : 'text-[var(--text-placeholder)] hover:text-[var(--text-secondary)]'
              }
            `}
            aria-label={isSaved ? 'Remove from saved' : 'Save paper'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Title */}
      <Link href={`/paper/${encodeURIComponent(paper.id)}`} className="block mb-2">
        <h3 className="text-heading text-[15px] text-[var(--text-primary)] line-clamp-2 group-hover:text-[hsl(var(--accent))] transition-colors">
          {paper.title}
        </h3>
      </Link>

      {/* Authors */}
      <p className="text-[13px] text-[var(--text-secondary)] mb-3 truncate">
        {formatAuthors(paper.authors, 3)}
      </p>

      {/* Abstract */}
      {paper.abstract && (
        <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed line-clamp-2 mb-4">
          {paper.abstract}
        </p>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-secondary)]">
        <div className="flex items-center gap-4 text-[12px] text-[var(--text-tertiary)]">
          <span>{formatDate(paper.date)}</span>
          {paper.citations > 0 && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
              {formatNumber(paper.citations)} cited
            </span>
          )}
        </div>
        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
          >
            PDF
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
          </a>
        )}
      </div>
    </article>
  );
}
