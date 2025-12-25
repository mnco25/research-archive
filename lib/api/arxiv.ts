import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import type { Paper } from '@/lib/types';
import { sleep, cleanHtml, generatePaperId } from '@/lib/utils';

const ARXIV_API_BASE = 'https://export.arxiv.org/api/query';
const RATE_LIMIT_MS = 3000; // 1 request per 3 seconds

let lastRequestTime = 0;

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  author: { name: string } | { name: string }[];
  published: string;
  updated?: string;
  'arxiv:primary_category'?: { '@_term': string };
  category?: { '@_term': string } | { '@_term': string }[];
  link?: { '@_href': string; '@_type'?: string; '@_title'?: string } | { '@_href': string; '@_type'?: string; '@_title'?: string }[];
  'arxiv:doi'?: string;
}

interface ArxivResponse {
  feed: {
    entry?: ArxivEntry | ArxivEntry[];
    'opensearch:totalResults'?: string;
    'opensearch:startIndex'?: string;
  };
}

/**
 * Ensure we don't exceed rate limits
 */
async function rateLimitedRequest(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();
}

/**
 * Parse arXiv ID from full URL
 */
function parseArxivId(url: string): string {
  const match = url.match(/abs\/(.+)$/);
  return match ? match[1] : url;
}

/**
 * Convert arXiv entry to Paper format
 */
function entryToPaper(entry: ArxivEntry): Paper {
  const arxivId = parseArxivId(entry.id);
  const authors = Array.isArray(entry.author)
    ? entry.author.map(a => ({ name: a.name }))
    : [{ name: entry.author.name }];

  // Find PDF link
  let pdfUrl: string | undefined;
  if (entry.link) {
    const links = Array.isArray(entry.link) ? entry.link : [entry.link];
    const pdfLink = links.find(l => l['@_title'] === 'pdf' || l['@_href']?.includes('/pdf/'));
    pdfUrl = pdfLink?.['@_href'];
  }

  // Get primary category
  const primaryCategory = entry['arxiv:primary_category']?.['@_term'] || 'unknown';

  return {
    id: generatePaperId('arxiv', arxivId),
    title: cleanHtml(entry.title.replace(/\n/g, ' ').trim()),
    authors,
    abstract: cleanHtml(entry.summary.replace(/\n/g, ' ').trim()),
    date: entry.published,
    source: 'arxiv',
    externalIds: {
      arxivId,
      doi: entry['arxiv:doi'] || undefined,
    },
    citations: 0, // arXiv doesn't provide citation counts
    accessType: 'open',
    url: entry.id,
    pdfUrl: pdfUrl || `https://arxiv.org/pdf/${arxivId}.pdf`,
    discipline: primaryCategory,
    keywords: [],
  };
}

/**
 * Search arXiv for papers
 */
export async function searchArxiv(
  query: string,
  options: {
    start?: number;
    maxResults?: number;
    sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
    sortOrder?: 'ascending' | 'descending';
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const {
    start = 0,
    maxResults = 20,
    sortBy = 'relevance',
    sortOrder = 'descending',
  } = options;

  await rateLimitedRequest();

  // Build search query
  const searchQuery = encodeURIComponent(query);
  const url = `${ARXIV_API_BASE}?search_query=all:${searchQuery}&start=${start}&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine)',
      },
      timeout: 30000,
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const result: ArxivResponse = parser.parse(response.data);

    // Handle empty results
    if (!result.feed.entry) {
      return { papers: [], total: 0 };
    }

    const entries = Array.isArray(result.feed.entry)
      ? result.feed.entry
      : [result.feed.entry];

    const papers = entries.map(entryToPaper);
    const total = parseInt(result.feed['opensearch:totalResults'] || '0', 10);

    return { papers, total };
  } catch (error) {
    console.error('arXiv API error:', error);
    throw new Error('Failed to search arXiv');
  }
}

/**
 * Get a specific paper from arXiv by ID
 */
export async function getArxivPaper(arxivId: string): Promise<Paper | null> {
  await rateLimitedRequest();

  const url = `${ARXIV_API_BASE}?id_list=${arxivId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine)',
      },
      timeout: 30000,
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const result: ArxivResponse = parser.parse(response.data);

    if (!result.feed.entry) {
      return null;
    }

    const entry = Array.isArray(result.feed.entry)
      ? result.feed.entry[0]
      : result.feed.entry;

    return entryToPaper(entry);
  } catch (error) {
    console.error('arXiv API error:', error);
    return null;
  }
}

/**
 * Search arXiv by category
 */
export async function searchArxivByCategory(
  category: string,
  options: {
    start?: number;
    maxResults?: number;
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const { start = 0, maxResults = 20 } = options;

  await rateLimitedRequest();

  const url = `${ARXIV_API_BASE}?search_query=cat:${category}&start=${start}&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine)',
      },
      timeout: 30000,
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const result: ArxivResponse = parser.parse(response.data);

    if (!result.feed.entry) {
      return { papers: [], total: 0 };
    }

    const entries = Array.isArray(result.feed.entry)
      ? result.feed.entry
      : [result.feed.entry];

    const papers = entries.map(entryToPaper);
    const total = parseInt(result.feed['opensearch:totalResults'] || '0', 10);

    return { papers, total };
  } catch (error) {
    console.error('arXiv API error:', error);
    throw new Error('Failed to search arXiv by category');
  }
}
