'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  if (totalPages <= 1) return null;

  const btnClass = (active: boolean) => `
    min-w-[36px] h-[36px] flex items-center justify-center text-[13px] font-medium
    rounded-[var(--radius-sm)] transition-colors
    ${active
      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
    }
  `;

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-sm btn-ghost disabled:opacity-30 disabled:cursor-not-allowed p-2"
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btnClass(false)}>1</button>
          {start > 2 && <span className="px-1 text-[var(--text-tertiary)]">…</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={btnClass(page === currentPage)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-[var(--text-tertiary)]">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={btnClass(false)}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-sm btn-ghost disabled:opacity-30 disabled:cursor-not-allowed p-2"
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </nav>
  );
}
