import axios from 'axios';
import type { Paper } from '@/lib/types';
import { cleanHtml, generatePaperId } from '@/lib/utils';

const CROSSREF_API_BASE = 'https://api.crossref.org/v1/works';

interface CrossRefAuthor {
  given?: string;
  family?: string;
  name?: string;
  affiliation?: { name: string }[];
  ORCID?: string;
}

interface CrossRefWork {
  DOI: string;
  title?: string[];
  author?: CrossRefAuthor[];
  abstract?: string;
  'published-print'?: { 'date-parts': number[][] };
  'published-online'?: { 'date-parts': number[][] };
  created?: { 'date-parts': number[][] };
  'is-referenced-by-count'?: number;
  type?: string;
  'container-title'?: string[];
  subject?: string[];
  link?: { URL: string; 'content-type'?: string }[];
  URL?: string;
  license?: { URL: string; 'content-version': string }[];
}

interface CrossRefResponse {
  status: string;
  'message-type': string;
  message: {
    items?: CrossRefWork[];
    'total-results'?: number;
    'items-per-page'?: number;
  } | CrossRefWork;
}

/**
 * Format date from CrossRef date-parts
 */
function formatDateParts(dateParts: number[][] | undefined): string {
  if (!dateParts || dateParts.length === 0 || !dateParts[0]) {
    return new Date().toISOString().split('T')[0];
  }

  const [year, month, day] = dateParts[0];
  const m = (month || 1).toString().padStart(2, '0');
  const d = (day || 1).toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Determine access type from license
 */
function getAccessType(work: CrossRefWork): 'open' | 'restricted' {
  if (work.license) {
    const openLicenses = ['creativecommons.org', 'open-access'];
    const hasOpenLicense = work.license.some(l =>
      openLicenses.some(ol => l.URL.includes(ol))
    );
    if (hasOpenLicense) return 'open';
  }
  return 'restricted';
}

/**
 * Convert CrossRef work to Paper format
 */
function workToPaper(work: CrossRefWork): Paper {
  const authors = (work.author || []).map(a => ({
    name: a.name || `${a.given || ''} ${a.family || ''}`.trim() || 'Unknown',
    affiliation: a.affiliation?.[0]?.name,
    orcid: a.ORCID,
  }));

  const date = formatDateParts(
    work['published-print']?.['date-parts'] ||
    work['published-online']?.['date-parts'] ||
    work.created?.['date-parts']
  );

  // Get PDF URL if available
  let pdfUrl: string | undefined;
  if (work.link) {
    const pdfLink = work.link.find(l =>
      l['content-type']?.includes('pdf') || l.URL.includes('.pdf')
    );
    pdfUrl = pdfLink?.URL;
  }

  return {
    id: generatePaperId('crossref', work.DOI),
    title: work.title?.[0] ? cleanHtml(work.title[0]) : 'Untitled',
    authors,
    abstract: work.abstract ? cleanHtml(work.abstract) : '',
    date,
    source: 'crossref',
    externalIds: {
      doi: work.DOI,
    },
    citations: work['is-referenced-by-count'] || 0,
    accessType: getAccessType(work),
    url: work.URL || `https://doi.org/${work.DOI}`,
    pdfUrl,
    journal: work['container-title']?.[0],
    keywords: work.subject,
    discipline: work.subject?.[0],
  };
}

/**
 * Search CrossRef for papers
 */
export async function searchCrossRef(
  query: string,
  options: {
    offset?: number;
    rows?: number;
    sort?: 'score' | 'relevance' | 'published' | 'is-referenced-by-count';
    order?: 'asc' | 'desc';
    filter?: {
      fromDate?: string;
      toDate?: string;
      hasAbstract?: boolean;
    };
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const {
    offset = 0,
    rows = 20,
    sort = 'score',
    order = 'desc',
    filter,
  } = options;

  const params = new URLSearchParams({
    query,
    offset: offset.toString(),
    rows: rows.toString(),
    sort: sort === 'relevance' ? 'score' : sort,
    order,
  });

  // Add filters
  const filters: string[] = [];
  if (filter?.fromDate) {
    filters.push(`from-pub-date:${filter.fromDate}`);
  }
  if (filter?.toDate) {
    filters.push(`until-pub-date:${filter.toDate}`);
  }
  if (filter?.hasAbstract) {
    filters.push('has-abstract:true');
  }
  if (filters.length > 0) {
    params.set('filter', filters.join(','));
  }

  try {
    const response = await axios.get(`${CROSSREF_API_BASE}?${params}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine; mailto:research@example.com)',
      },
      timeout: 30000,
    });

    const result: CrossRefResponse = response.data;
    const message = result.message as { items?: CrossRefWork[]; 'total-results'?: number };

    if (!message.items || message.items.length === 0) {
      return { papers: [], total: 0 };
    }

    const papers = message.items.map(workToPaper);
    const total = message['total-results'] || papers.length;

    return { papers, total };
  } catch (error) {
    console.error('CrossRef API error:', error);
    throw new Error('Failed to search CrossRef');
  }
}

/**
 * Get a specific paper from CrossRef by DOI
 */
export async function getCrossRefPaper(doi: string): Promise<Paper | null> {
  try {
    const response = await axios.get(`${CROSSREF_API_BASE}/${encodeURIComponent(doi)}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine; mailto:research@example.com)',
      },
      timeout: 30000,
    });

    const result: CrossRefResponse = response.data;
    const work = result.message as CrossRefWork;

    if (!work.DOI) {
      return null;
    }

    return workToPaper(work);
  } catch (error) {
    console.error('CrossRef API error:', error);
    return null;
  }
}

/**
 * Get citation count for a DOI
 */
export async function getCitationCount(doi: string): Promise<number> {
  try {
    const paper = await getCrossRefPaper(doi);
    return paper?.citations || 0;
  } catch {
    return 0;
  }
}
