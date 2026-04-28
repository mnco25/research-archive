import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const diffSec = (Date.now() - date.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const buckets: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [86400 * 7, 'day'],
    [86400 * 30, 'week'],
    [86400 * 365, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = diffSec;
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  let prev = 1;
  for (const [limit, candidate] of buckets) {
    if (Math.abs(diffSec) < limit) {
      value = diffSec / prev;
      unit = candidate;
      break;
    }
    prev = limit;
  }
  return rtf.format(-Math.round(value), unit);
}

export function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function generatePaperId(source: string, externalId: string): string {
  return `${source}:${externalId}`;
}

export function parsePaperId(id: string): { source: string; externalId: string } {
  const idx = id.indexOf(':');
  if (idx === -1) return { source: '', externalId: id };
  return { source: id.slice(0, idx), externalId: id.slice(idx + 1) };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function extractYear(dateString: string): number | null {
  const match = dateString.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

export function formatAuthors(authors: { name: string }[], maxAuthors: number = 3): string {
  if (!authors?.length) return 'Unknown Authors';
  if (authors.length <= maxAuthors) return authors.map(a => a.name).join(', ');
  return `${authors.slice(0, maxAuthors).map(a => a.name).join(', ')} et al.`;
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
  return debounced;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getDoiUrl(doi: string): string {
  const cleanDoi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
  return `https://doi.org/${cleanDoi}`;
}

export function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<jats:[^>]*>/gi, '')
    .replace(/<\/jats:[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateReadingTime(text: string): number {
  if (!text) return 0;
  const wordsPerMinute = 220;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function bestPaperLink(paper: { url?: string; pdfUrl?: string; externalIds: { doi?: string } }): string {
  if (paper.pdfUrl) return paper.pdfUrl;
  if (paper.externalIds.doi) return getDoiUrl(paper.externalIds.doi);
  return paper.url || '#';
}
