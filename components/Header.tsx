'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // specific check to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDark(theme === 'dark' || (!theme && prefersDark));
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newDark = !prev;
      const newTheme = newDark ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newDark ? 'dark' : '');
      return newDark;
    });
  }, []);

  const navLinks = [
    { href: '/search', label: 'Search' },
    { href: '/saved', label: 'Library' },
    { href: '/api/health', label: 'Status' },
  ];

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div
        className={`relative transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isScrolled
          ? 'w-full max-w-4xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-lg backdrop-blur-xl rounded-2xl'
          : 'w-full max-w-7xl bg-transparent border-transparent'
          }`}
      >
        <nav className="flex items-center justify-between h-14 px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">ResearchArchive</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--bg-surface)]/50 p-1 rounded-full border border-[var(--border-subtle)] backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative ${isActive
                    ? 'text-[var(--brand-primary)] bg-white/80 dark:bg-white/10 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-surface-active)] transition-colors hover:rotate-12"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              )}
            </button>
            <a
              href="https://github.com/yourusername/research-archive"
              target="_blank"
              className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-page)] text-sm font-semibold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span>GitHub</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[var(--text-primary)]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl md:hidden animate-enter">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-[var(--border-subtle)] my-2" />
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium hover:bg-[var(--bg-surface-hover)] transition-colors text-left"
              >
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                {isDark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
