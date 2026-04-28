import { XMLParser } from 'fast-xml-parser';
import type { Paper } from '@/lib/types';
import { cleanHtml, generatePaperId, sleep } from '@/lib/utils';
import { httpGet } from '@/lib/http';

const ARXIV_API_BASE = 'https://export.arxiv.org/api/query';
const RATE_LIMIT_MS = 3000;

let lastRequestAt = 0;
let pendingRateLimit: Promise<void> = Promise.resolve();

interface ArxivLink {
  '@_href': string;
  '@_type'?: string;
  '@_title'?: string;
}

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  author: { name: string; 'arxiv:affiliation'?: string } | { name: string; 'arxiv:affiliation'?: string }[];
  published: string;
  updated?: string;
  'arxiv:primary_category'?: { '@_term': string };
  category?: { '@_term': string } | { '@_term': string }[];
  link?: ArxivLink | ArxivLink[];
  'arxiv:doi'?: string | { '#text': string };
  'arxiv:journal_ref'?: string;
}

interface ArxivResponse {
  feed: {
    entry?: ArxivEntry | ArxivEntry[];
    'opensearch:totalResults'?: string | number | { '#text': string };
    'opensearch:startIndex'?: string;
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  trimValues: true,
});

async function rateLimit(): Promise<void> {
  pendingRateLimit = pendingRateLimit.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < RATE_LIMIT_MS) await sleep(RATE_LIMIT_MS - elapsed);
    lastRequestAt = Date.now();
  });
  return pendingRateLimit;
}

function parseArxivId(url: string): string {
  const match = url.match(/abs\/(.+?)(v\d+)?$/);
  if (match) return match[1];
  const fallback = url.match(/abs\/(.+)$/);
  return fallback ? fallback[1] : url;
}

function extractDoi(value: ArxivEntry['arxiv:doi']): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value['#text'];
}

function extractTotal(raw: ArxivResponse['feed']['opensearch:totalResults']): number {
  if (raw == null) return 0;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') return parseInt(raw, 10) || 0;
  return parseInt(raw['#text'] || '0', 10) || 0;
}

function entryToPaper(entry: ArxivEntry): Paper {
  const arxivId = parseArxivId(entry.id);
  const authors = (Array.isArray(entry.author) ? entry.author : [entry.author])
    .filter(Boolean)
    .map(a => ({ name: a.name, affiliation: a['arxiv:affiliation'] }));

  let pdfUrl: string | undefined;
  if (entry.link) {
    const links = Array.isArray(entry.link) ? entry.link : [entry.link];
    const pdfLink = links.find(l => l['@_title'] === 'pdf' || l['@_type'] === 'application/pdf');
    pdfUrl = pdfLink?.['@_href'];
  }

  const primaryCategory = entry['arxiv:primary_category']?.['@_term'];

  return {
    id: generatePaperId('arxiv', arxivId),
    title: cleanHtml(entry.title.replace(/\s+/g, ' ').trim()),
    authors,
    abstract: cleanHtml(entry.summary.replace(/\s+/g, ' ').trim()),
    date: entry.published,
    source: 'arxiv',
    externalIds: {
      arxivId,
      doi: extractDoi(entry['arxiv:doi']),
    },
    citations: 0,
    accessType: 'open',
    url: entry.id.replace('http://', 'https://'),
    pdfUrl: pdfUrl?.replace('http://', 'https://') || `https://arxiv.org/pdf/${arxivId}.pdf`,
    journal: entry['arxiv:journal_ref'],
    discipline: primaryCategory,
    keywords: [],
  };
}

function buildQuery(query: string, start: number, max: number, sortBy: string, sortOrder: string): string {
  const params = new URLSearchParams({
    search_query: `all:${query}`,
    start: String(start),
    max_results: String(max),
    sortBy,
    sortOrder,
  });
  return `${ARXIV_API_BASE}?${params}`;
}

export async function searchArxiv(
  query: string,
  options: {
    start?: number;
    maxResults?: number;
    sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
    sortOrder?: 'ascending' | 'descending';
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const { start = 0, maxResults = 20, sortBy = 'relevance', sortOrder = 'descending' } = options;
  await rateLimit();

  const url = buildQuery(query, start, Math.min(maxResults, 100), sortBy, sortOrder);
  const response = await httpGet<string>(url, {
    headers: { Accept: 'application/atom+xml' },
    responseType: 'text',
  });

  const result: ArxivResponse = parser.parse(response.data);
  if (!result.feed?.entry) return { papers: [], total: 0 };

  const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];
  return {
    papers: entries.map(entryToPaper),
    total: extractTotal(result.feed['opensearch:totalResults']),
  };
}

export async function getArxivPaper(arxivId: string): Promise<Paper | null> {
  await rateLimit();
  const url = `${ARXIV_API_BASE}?id_list=${encodeURIComponent(arxivId)}`;

  try {
    const response = await httpGet<string>(url, {
      headers: { Accept: 'application/atom+xml' },
      responseType: 'text',
    });
    const result: ArxivResponse = parser.parse(response.data);
    if (!result.feed?.entry) return null;
    const entry = Array.isArray(result.feed.entry) ? result.feed.entry[0] : result.feed.entry;
    return entryToPaper(entry);
  } catch (error) {
    console.error('arXiv getPaper error:', error);
    return null;
  }
}
