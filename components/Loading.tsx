export function PaperCardSkeleton() {
  return (
    <div className="flex flex-col h-full min-w-0 p-6 md:p-7 rounded-[1.8rem] bg-[var(--bg-elevated)]/20 border border-[var(--border-primary)]/40 overflow-hidden">
      <div className="flex gap-2 mb-5">
        <div className="h-6 w-16 skeleton rounded-full" />
        <div className="h-6 w-24 skeleton rounded-full" />
      </div>
      
      <div className="h-6 w-full skeleton mb-3 rounded-md" />
      <div className="h-6 w-3/4 skeleton mb-5 rounded-md" />
      
      <div className="h-4 w-1/2 skeleton mb-6 rounded-md" />
      
      <div className="space-y-3 mb-6">
        <div className="h-4 w-full skeleton rounded-md" />
        <div className="h-4 w-5/6 skeleton rounded-md" />
        <div className="h-4 w-4/6 skeleton rounded-md" />
      </div>

      <div className="flex-1" />
      
      <div className="flex justify-between pt-5 border-t border-[var(--border-secondary)]/50 mt-auto">
        <div className="flex gap-4">
          <div className="h-4 w-16 skeleton rounded-md" />
          <div className="h-4 w-20 skeleton rounded-md" />
        </div>
        <div className="h-4 w-10 skeleton rounded-md" />
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
      <div className="h-8 w-3/4 skeleton mb-3" />
      <div className="h-5 w-1/2 skeleton mb-6" />
      <div className="flex gap-2 mb-8">
        <div className="h-5 w-14 skeleton rounded-full" />
        <div className="h-5 w-20 skeleton rounded-full" />
      </div>
      <div className="space-y-2 mb-8">
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-3/4 skeleton" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 skeleton rounded-[var(--radius-md)]" />
        <div className="h-20 skeleton rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const px = { sm: 16, md: 24, lg: 36 }[size];
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-[var(--bg-overlay)] z-50 flex items-center justify-center animate-fade">
      <div className="flex flex-col items-center gap-3 bg-[var(--bg-elevated)] p-6 rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]">
        <Spinner size="lg" />
        <p className="text-[13px] text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}
