import { type ClassValue, clsx } from 'clsx';

/**
 * Combines class names with conditional support
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format large numbers with K, M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Clean and normalize search query
 */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Generate unique ID for papers
 */
export function generatePaperId(source: string, externalId: string): string {
  return `${source}:${externalId}`;
}

/**
 * Parse paper ID to get source and external ID
 */
export function parsePaperId(id: string): { source: string; externalId: string } {
  const [source, ...rest] = id.split(':');
  return { source, externalId: rest.join(':') };
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Extract year from date string
 */
export function extractYear(dateString: string): number | null {
  const match = dateString.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Format authors for display
 */
export function formatAuthors(authors: { name: string }[], maxAuthors: number = 3): string {
  if (authors.length === 0) return 'Unknown Authors';
  if (authors.length <= maxAuthors) {
    return authors.map(a => a.name).join(', ');
  }
  return `${authors.slice(0, maxAuthors).map(a => a.name).join(', ')} et al.`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get DOI URL from DOI string
 */
export function getDoiUrl(doi: string): string {
  const cleanDoi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
  return `https://doi.org/${cleanDoi}`;
}

/**
 * Clean HTML from text (for abstracts)
 */
export function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Calculate reading time (rough estimate)
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
