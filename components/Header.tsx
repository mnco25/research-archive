'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-border-light)]">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[var(--color-accent-primary)]"
          >
            <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 12H22M10 16H22M10 20H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>ResearchArchive</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/search"
            className={`text-sm font-medium transition-colors ${
              pathname === '/search'
                ? 'text-[var(--color-accent-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Search
          </Link>
          <Link
            href="/saved"
            className={`text-sm font-medium transition-colors ${
              pathname === '/saved'
                ? 'text-[var(--color-accent-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Saved Papers
          </Link>
          <Link
            href="/api/health"
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            target="_blank"
          >
            API Status
          </Link>
        </nav>
      </div>
    </header>
  );
}
