import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-16 text-center">
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-text-tertiary)"
        strokeWidth="1.5"
        className="mx-auto mb-6"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>

      <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
        404
      </h1>

      <h2 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">
        Page Not Found
      </h2>

      <p className="text-[var(--color-text-tertiary)] mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn btn-primary">
          Go Home
        </Link>
        <Link href="/search" className="btn btn-secondary">
          Search Papers
        </Link>
      </div>
    </div>
  );
}
