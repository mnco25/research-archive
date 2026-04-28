export function PaperCardSkeleton() {
  return (
    <div className="flex flex-col h-full min-w-0 p-5 md:p-6 rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] border border-[var(--border-primary)]">
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-14 skeleton rounded-full" />
        <div className="h-5 w-20 skeleton rounded-full" />
      </div>
      <div className="h-5 w-full skeleton mb-2 rounded-md" />
      <div className="h-5 w-3/4 skeleton mb-3 rounded-md" />
      <div className="h-3.5 w-1/2 skeleton mb-4 rounded-md" />
      <div className="space-y-2 mb-4">
        <div className="h-3.5 w-full skeleton rounded-md" />
        <div className="h-3.5 w-5/6 skeleton rounded-md" />
        <div className="h-3.5 w-3/4 skeleton rounded-md" />
      </div>
      <div className="flex-1" />
      <div className="flex justify-between pt-3 border-t border-[var(--border-secondary)]">
        <div className="flex gap-3">
          <div className="h-3.5 w-12 skeleton rounded-md" />
          <div className="h-3.5 w-16 skeleton rounded-md" />
        </div>
        <div className="h-3.5 w-10 skeleton rounded-md" />
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
    <div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-14 skeleton rounded-full" />
        <div className="h-5 w-20 skeleton rounded-full" />
      </div>
      <div className="h-7 w-3/4 skeleton mb-2 rounded-md" />
      <div className="h-7 w-1/2 skeleton mb-5 rounded-md" />
      <div className="h-4 w-2/5 skeleton mb-8 rounded-md" />
      <div className="space-y-2 mb-8">
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-3/4 skeleton rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 skeleton rounded-[var(--radius-md)]" />
        <div className="h-20 skeleton rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const px = { sm: 16, md: 22, lg: 32 }[size];
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
