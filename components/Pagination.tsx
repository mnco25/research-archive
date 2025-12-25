'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const maxVisiblePages = 5;

  // Calculate visible page range
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* First page + ellipsis */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="btn btn-ghost min-w-[40px]"
          >
            1
          </button>
          {startPage > 2 && (
            <span className="px-2 text-[var(--color-text-tertiary)]">...</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn min-w-[40px] ${
            page === currentPage ? 'btn-primary' : 'btn-ghost'
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* Last page + ellipsis */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-[var(--color-text-tertiary)]">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="btn btn-ghost min-w-[40px]"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </nav>
  );
}
