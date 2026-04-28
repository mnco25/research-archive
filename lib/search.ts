import type { Paper, PaperSource, SearchRequest, SearchResult, SourceError } from '@/lib/types';
import { PAPER_SOURCES } from '@/lib/types';
import { searchArxiv } from '@/lib/api/arxiv';
import { searchPubMed } from '@/lib/api/pubmed';
import { searchCrossRef } from '@/lib/api/crossref';
import { searchOpenAlex, getTrendingPapers } from '@/lib/api/openalex';
import { searchCache, getSearchCacheKey, maybeCleanupCache } from '@/lib/cache';
import disciplines from '@/data/disciplines.json';

const SOURCE_LIMIT_FLOOR = 6;
const SOURCE_LIMIT_CAP = 25;

interface SourceResult {
  source: PaperSource;
  papers: Paper[];
  total: number;
  error?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function perSourceLimit(limit: number, sources: number): number {
  return clamp(Math.ceil(limit / Math.max(sources, 1)) + 2, SOURCE_LIMIT_FLOOR, SOURCE_LIMIT_CAP);
}

function disciplineToQuery(disciplineId?: string): string | null {
  if (!disciplineId) return null;
  const found = (disciplines as { id: string; query: string }[]).find(d => d.id === disciplineId);
  return found?.query || null;
}

function paperScore(paper: Paper): number {
  const abstractScore = (paper.abstract?.length || 0) / 50;
  const authorScore = paper.authors.length * 4;
  const citationScore = Math.log10((paper.citations || 0) + 1) * 8;
  return abstractScore + authorScore + citationScore;
}

function mergePapers(into: Paper, from: Paper): Paper {
  return {
    ...into,
    abstract: into.abstract.length >= from.abstract.length ? into.abstract : from.abstract,
    authors: into.authors.length >= from.authors.length ? into.authors : from.authors,
    citations: Math.max(into.citations, from.citations),
    pdfUrl: into.pdfUrl || from.pdfUrl,
    journal: into.journal || from.journal,
    discipline: into.discipline || from.discipline,
    keywords: into.keywords?.length ? into.keywords : from.keywords,
    accessType: into.accessType === 'open' || from.accessType === 'open' ? 'open' : into.accessType,
    externalIds: { ...from.externalIds, ...into.externalIds },
  };
}

function deduplicatePapers(papers: Paper[]): Paper[] {
  const byDoi = new Map<string, Paper>();
  const byTitle = new Map<string, Paper>();
  const orphans: Paper[] = [];

  const titleKey = (title: string) => title.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();

  for (const paper of papers) {
    const doi = paper.externalIds.doi?.toLowerCase();
    if (doi) {
      const existing = byDoi.get(doi);
      if (existing) {
        const winner = paperScore(existing) >= paperScore(paper) ? existing : paper;
        const loser = winner === existing ? paper : existing;
        byDoi.set(doi, mergePapers(winner, loser));
      } else {
        byDoi.set(doi, paper);
      }
      continue;
    }
    const tk = titleKey(paper.title);
    if (tk.length > 12) {
      const existing = byTitle.get(tk);
      if (existing) {
        const winner = paperScore(existing) >= paperScore(paper) ? existing : paper;
        const loser = winner === existing ? paper : existing;
        byTitle.set(tk, mergePapers(winner, loser));
        continue;
      }
      byTitle.set(tk, paper);
      continue;
    }
    orphans.push(paper);
  }

  return [...byDoi.values(), ...byTitle.values(), ...orphans];
}

function sortPapers(papers: Paper[], sortBy: 'relevance' | 'date' | 'citations'): Paper[] {
  const sorted = [...papers];
  switch (sortBy) {
    case 'date':
      sorted.sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      });
      break;
    case 'citations':
      sorted.sort((a, b) => (b.citations || 0) - (a.citations || 0));
      break;
    case 'relevance':
    default: {
      // Combine source rank with a small freshness/citation boost
      const now = Date.now();
      const score = (p: Paper, originalIndex: number) => {
        const recencyDays = p.date ? (now - new Date(p.date).getTime()) / 86400000 : 365 * 5;
        const recencyBoost = Math.max(0, 1 - recencyDays / (365 * 5)) * 4;
        const citationBoost = Math.log10((p.citations || 0) + 1) * 1.5;
        return -originalIndex + recencyBoost + citationBoost;
      };
      const indexed = sorted.map((p, i) => ({ p, i, s: score(p, i) }));
      indexed.sort((a, b) => b.s - a.s);
      return indexed.map(x => x.p);
    }
  }
  return sorted;
}

function filterPapers(
  papers: Paper[],
  options: {
    accessType?: 'open' | 'any';
    citationMin?: number;
    dateRange?: { from: string; to: string };
  }
): Paper[] {
  let filtered = papers;
  if (options.accessType === 'open') {
    filtered = filtered.filter(p => p.accessType === 'open');
  }
  if (options.citationMin !== undefined && options.citationMin > 0) {
    filtered = filtered.filter(p => p.citations >= options.citationMin!);
  }
  if (options.dateRange) {
    const fromDate = new Date(options.dateRange.from);
    const toDate = new Date(options.dateRange.to);
    filtered = filtered.filter(p => {
      if (!p.date) return false;
      const t = new Date(p.date).getTime();
      return t >= fromDate.getTime() && t <= toDate.getTime();
    });
  }
  return filtered;
}

async function searchSource(
  source: PaperSource,
  query: string,
  page: number,
  perSource: number,
  filters: { accessType?: 'open' | 'any'; dateRange?: { from: string; to: string }; citationMin?: number }
): Promise<SourceResult> {
  const offset = (page - 1) * perSource;
  try {
    switch (source) {
      case 'arxiv': {
        const result = await searchArxiv(query, { start: offset, maxResults: perSource });
        return { source, papers: result.papers, total: result.total };
      }
      case 'pubmed': {
        const result = await searchPubMed(query, { start: offset, maxResults: perSource });
        return { source, papers: result.papers, total: result.total };
      }
      case 'crossref': {
        const result = await searchCrossRef(query, {
          offset,
          rows: perSource,
          filter: {
            fromDate: filters.dateRange?.from,
            toDate: filters.dateRange?.to,
            hasAbstract: true,
          },
        });
        return { source, papers: result.papers, total: result.total };
      }
      case 'openalex': {
        const result = await searchOpenAlex(query, {
          page,
          perPage: perSource,
          filter: {
            fromDate: filters.dateRange?.from,
            toDate: filters.dateRange?.to,
            isOa: filters.accessType === 'open' ? true : undefined,
            citedByCountMin: filters.citationMin && filters.citationMin > 0 ? filters.citationMin - 1 : undefined,
          },
        });
        return { source, papers: result.papers, total: result.total };
      }
      default:
        return { source, papers: [], total: 0, error: 'Unknown source' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[search/${source}]`, message);
    return { source, papers: [], total: 0, error: message };
  }
}

export async function unifiedSearch(request: SearchRequest): Promise<SearchResult> {
  const startTime = Date.now();
  maybeCleanupCache();

  const baseQuery = request.query.trim();
  const disciplineQuery = disciplineToQuery(request.discipline);
  const finalQuery = disciplineQuery ? `${baseQuery} ${disciplineQuery}` : baseQuery;

  const sources: PaperSource[] = (request.sources && request.sources.length > 0)
    ? request.sources
    : PAPER_SOURCES;

  const page = request.page || 1;
  const limit = request.limit || 20;
  const sort = request.sort || 'relevance';

  const cacheKey = getSearchCacheKey(finalQuery, {
    sources, page, limit, sort,
    accessType: request.accessType,
    citationMin: request.citationMin,
    dateRange: request.dateRange,
  });

  const cached = searchCache.get<SearchResult>(cacheKey);
  if (cached) {
    return { ...cached, searchTimeMs: Date.now() - startTime };
  }

  const perSource = perSourceLimit(limit, sources.length);
  const filters = {
    accessType: request.accessType,
    dateRange: request.dateRange,
    citationMin: request.citationMin,
  };

  const results = await Promise.all(
    sources.map(source => searchSource(source, finalQuery, page, perSource, filters))
  );

  let allPapers: Paper[] = [];
  let totalFromAllSources = 0;
  const errors: SourceError[] = [];

  for (const result of results) {
    allPapers = allPapers.concat(result.papers);
    totalFromAllSources += result.total;
    if (result.error) errors.push({ source: result.source, message: result.error });
  }

  const deduplicated = deduplicatePapers(allPapers);
  const filtered = filterPapers(deduplicated, filters);
  const sorted = sortPapers(filtered, sort);
  const paginated = sorted.slice(0, limit);

  const result: SearchResult = {
    papers: paginated,
    total: totalFromAllSources,
    page,
    pages: Math.max(1, Math.ceil(totalFromAllSources / limit)),
    searchTimeMs: Date.now() - startTime,
    sourcesQueried: sources,
    errors: errors.length ? errors : undefined,
  };

  searchCache.set(cacheKey, result, 15 * 60 * 1000);
  return result;
}

export async function quickSearch(query: string, limit: number = 5): Promise<Paper[]> {
  if (!query.trim()) return [];
  try {
    const result = await searchOpenAlex(query, { perPage: limit });
    return result.papers;
  } catch {
    try {
      const result = await searchArxiv(query, { maxResults: limit });
      return result.papers;
    } catch {
      return [];
    }
  }
}

export async function getFeaturedPapers(limit: number = 8): Promise<Paper[]> {
  return getTrendingPapers(180, limit);
}
