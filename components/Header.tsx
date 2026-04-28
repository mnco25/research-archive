'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/theme';

const NAV_LINKS = [
  { href: '/search', label: 'Search' },
  { href: '/saved', label: 'Library' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function Header() {
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[var(--bg-primary)]/75 backdrop-blur-xl border-b border-[var(--border-primary)]/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="container-app relative flex items-center justify-between h-16 md:h-[68px]">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="ResearchArchive home">
          <div className="w-8 h-8 rounded-[10px] bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            ResearchArchive
          </span>
        </Link>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-[var(--bg-elevated)]/60 px-1.5 py-1 rounded-full border border-[var(--border-primary)]/60 backdrop-blur-md">
          {NAV_LINKS.map(link => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  active
                    ? 'text-[var(--text-primary)] bg-[var(--bg-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/60 transition-colors"
            aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
            type="button"
          >
            {mounted && theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setIsMobileOpen(v => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/60 transition-colors"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isMobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {isMobileOpen && (
        <div className="md:hidden border-t border-[var(--border-primary)] bg-[var(--bg-primary)] animate-fade">
          <div className="container-app py-2 flex flex-col">
            {NAV_LINKS.map(link => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors ${
                    active
                      ? 'text-[var(--text-primary)] bg-[var(--bg-tertiary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
