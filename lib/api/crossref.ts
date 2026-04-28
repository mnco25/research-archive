import type { Paper } from '@/lib/types';
import { cleanHtml, generatePaperId } from '@/lib/utils';
import { httpGet } from '@/lib/http';

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
  issued?: { 'date-parts': number[][] };
  created?: { 'date-parts': number[][] };
  'is-referenced-by-count'?: number;
  type?: string;
  'container-title'?: string[];
  subject?: string[];
  link?: { URL: string; 'content-type'?: string }[];
  URL?: string;
  license?: { URL: string }[];
}

interface CrossRefSearchResponse {
  message: { items: CrossRefWork[]; 'total-results': number };
}

interface CrossRefSingleResponse {
  message: CrossRefWork;
}

function formatDateParts(dateParts?: number[][]): string {
  if (!dateParts?.[0]?.[0]) return '';
  const [year, month, day] = dateParts[0];
  return `${year}-${String(month || 1).padStart(2, '0')}-${String(day || 1).padStart(2, '0')}`;
}

function pickDate(work: CrossRefWork): string {
  return (
    formatDateParts(work['published-print']?.['date-parts']) ||
    formatDateParts(work['published-online']?.['date-parts']) ||
    formatDateParts(work.issued?.['date-parts']) ||
    formatDateParts(work.created?.['date-parts'])
  );
}

const OPEN_LICENSE_HINTS = ['creativecommons.org', '/cc-by', '/cc0', '/publicdomain', 'open-access'];

function getAccessType(work: CrossRefWork): 'open' | 'restricted' {
  if (!work.license?.length) return 'restricted';
  const isOpen = work.license.some(l => OPEN_LICENSE_HINTS.some(hint => l.URL.toLowerCase().includes(hint)));
  return isOpen ? 'open' : 'restricted';
}

function workToPaper(work: CrossRefWork): Paper {
  const authors = (work.author || []).map(a => ({
    name: a.name || `${a.given || ''} ${a.family || ''}`.trim() || 'Unknown',
    affiliation: a.affiliation?.[0]?.name,
    orcid: a.ORCID?.replace(/^https?:\/\/orcid\.org\//, ''),
  }));

  let pdfUrl: string | undefined;
  if (work.link) {
    const pdfLink = work.link.find(l => l['content-type']?.includes('pdf') || l.URL.toLowerCase().endsWith('.pdf'));
    pdfUrl = pdfLink?.URL;
  }

  return {
    id: generatePaperId('crossref', work.DOI),
    title: work.title?.[0] ? cleanHtml(work.title[0]) : 'Untitled',
    authors,
    abstract: work.abstract ? cleanHtml(work.abstract) : '',
    date: pickDate(work),
    source: 'crossref',
    externalIds: { doi: work.DOI },
    citations: work['is-referenced-by-count'] || 0,
    accessType: getAccessType(work),
    url: work.URL || `https://doi.org/${work.DOI}`,
    pdfUrl,
    journal: work['container-title']?.[0],
    keywords: work.subject?.slice(0, 10),
    discipline: work.subject?.[0],
  };
}

export async function searchCrossRef(
  query: string,
  options: {
    offset?: number;
    rows?: number;
    sort?: 'score' | 'relevance' | 'published' | 'is-referenced-by-count';
    order?: 'asc' | 'desc';
    filter?: { fromDate?: string; toDate?: string; hasAbstract?: boolean };
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const { offset = 0, rows = 20, sort = 'score', order = 'desc', filter } = options;

  const params = new URLSearchParams({
    query,
    offset: String(offset),
    rows: String(Math.min(rows, 100)),
    sort: sort === 'relevance' ? 'score' : sort,
    order,
    select: 'DOI,title,author,abstract,published-print,published-online,issued,created,is-referenced-by-count,type,container-title,subject,link,URL,license',
  });

  const filters: string[] = [];
  if (filter?.fromDate) filters.push(`from-pub-date:${filter.fromDate}`);
  if (filter?.toDate) filters.push(`until-pub-date:${filter.toDate}`);
  if (filter?.hasAbstract) filters.push('has-abstract:true');
  if (filters.length) params.set('filter', filters.join(','));

  const response = await httpGet<CrossRefSearchResponse>(`${CROSSREF_API_BASE}?${params}`);
  const items = response.data.message?.items || [];
  return {
    papers: items.map(workToPaper),
    total: response.data.message?.['total-results'] || items.length,
  };
}

export async function getCrossRefPaper(doi: string): Promise<Paper | null> {
  try {
    const cleaned = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
    const response = await httpGet<CrossRefSingleResponse>(
      `${CROSSREF_API_BASE}/${encodeURIComponent(cleaned)}`
    );
    const work = response.data.message;
    if (!work?.DOI) return null;
    return workToPaper(work);
  } catch (error) {
    console.error('CrossRef getPaper error:', error);
    return null;
  }
}
