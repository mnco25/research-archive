export function PaperCardSkeleton() {
  return (
    <div className="p-5 bg-white border border-[var(--color-border-light)] rounded-lg animate-pulse">
      <div className="space-y-3">
        {/* Title skeleton */}
        <div className="h-6 bg-[var(--color-bg-tertiary)] rounded w-3/4 skeleton" />
        <div className="h-6 bg-[var(--color-bg-tertiary)] rounded w-1/2 skeleton" />

        {/* Authors skeleton */}
        <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-1/3 skeleton" />

        {/* Metadata skeleton */}
        <div className="flex gap-2">
          <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-24 skeleton" />
          <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-32 skeleton" />
        </div>

        {/* Abstract skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-full skeleton" />
          <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-full skeleton" />
          <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-2/3 skeleton" />
        </div>

        {/* Badges skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-[var(--color-bg-tertiary)] rounded w-16 skeleton" />
          <div className="h-6 bg-[var(--color-bg-tertiary)] rounded w-20 skeleton" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PaperCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PaperDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Title */}
      <div className="h-10 bg-[var(--color-bg-tertiary)] rounded w-3/4 mb-4 skeleton" />

      {/* Authors */}
      <div className="h-5 bg-[var(--color-bg-tertiary)] rounded w-1/2 mb-6 skeleton" />

      {/* Badges */}
      <div className="flex gap-2 mb-6">
        <div className="h-6 bg-[var(--color-bg-tertiary)] rounded w-16 skeleton" />
        <div className="h-6 bg-[var(--color-bg-tertiary)] rounded w-24 skeleton" />
        <div className="h-6 bg-[var(--color-bg-tertiary)] rounded w-20 skeleton" />
      </div>

      {/* Abstract */}
      <div className="space-y-2 mb-8">
        <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-full skeleton" />
        <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-full skeleton" />
        <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-full skeleton" />
        <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-full skeleton" />
        <div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-3/4 skeleton" />
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-[var(--color-bg-tertiary)] rounded skeleton" />
        <div className="h-20 bg-[var(--color-bg-tertiary)] rounded skeleton" />
        <div className="h-20 bg-[var(--color-bg-tertiary)] rounded skeleton" />
        <div className="h-20 bg-[var(--color-bg-tertiary)] rounded skeleton" />
      </div>
    </div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}
