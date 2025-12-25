import type { Paper, PaperSource, SearchRequest, SearchResult } from '@/lib/types';
import { searchArxiv } from '@/lib/api/arxiv';
import { searchPubMed } from '@/lib/api/pubmed';
import { searchCrossRef } from '@/lib/api/crossref';
import { searchOpenAlex } from '@/lib/api/openalex';
import { searchCache, getSearchCacheKey, maybeCleanupCache } from '@/lib/cache';

interface SourceResult {
  source: PaperSource;
  papers: Paper[];
  total: number;
  error?: string;
}

/**
 * Calculate pagination offsets for each source
 */
function calculateSourcePagination(
  page: number,
  limit: number,
  sourcesCount: number
): { offset: number; perSource: number } {
  const perSource = Math.ceil(limit / sourcesCount);
  const offset = (page - 1) * perSource;
  return { offset, perSource };
}

/**
 * Deduplicate papers by DOI (prefer papers with more information)
 */
function deduplicatePapers(papers: Paper[]): Paper[] {
  const doiMap = new Map<string, Paper>();
  const nonDoiPapers: Paper[] = [];

  for (const paper of papers) {
    const doi = paper.externalIds.doi;

    if (doi) {
      const existing = doiMap.get(doi);
      if (!existing) {
        doiMap.set(doi, paper);
      } else {
        // Keep paper with more information (longer abstract, more authors, has citations)
        const existingScore = (existing.abstract?.length || 0) + existing.authors.length * 100 + existing.citations;
        const newScore = (paper.abstract?.length || 0) + paper.authors.length * 100 + paper.citations;

        if (newScore > existingScore) {
          // Keep track of all sources
          const mergedPaper: Paper = {
            ...paper,
            // Merge external IDs
            externalIds: {
              ...existing.externalIds,
              ...paper.externalIds,
            },
          };
          doiMap.set(doi, mergedPaper);
        }
      }
    } else {
      nonDoiPapers.push(paper);
    }
  }

  return [...doiMap.values(), ...nonDoiPapers];
}

/**
 * Sort papers based on criteria
 */
function sortPapers(papers: Paper[], sortBy: 'relevance' | 'date' | 'citations'): Paper[] {
  const sorted = [...papers];

  switch (sortBy) {
    case 'date':
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
    case 'citations':
      sorted.sort((a, b) => b.citations - a.citations);
      break;
    case 'relevance':
    default:
      // Keep original order (APIs return by relevance)
      break;
  }

  return sorted;
}

/**
 * Filter papers based on criteria
 */
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

  if (options.citationMin !== undefined) {
    filtered = filtered.filter(p => p.citations >= options.citationMin!);
  }

  if (options.dateRange) {
    const fromDate = new Date(options.dateRange.from);
    const toDate = new Date(options.dateRange.to);
    filtered = filtered.filter(p => {
      const paperDate = new Date(p.date);
      return paperDate >= fromDate && paperDate <= toDate;
    });
  }

  return filtered;
}

/**
 * Search a single source with error handling
 */
async function searchSource(
  source: PaperSource,
  query: string,
  offset: number,
  limit: number
): Promise<SourceResult> {
  try {
    switch (source) {
      case 'arxiv': {
        const result = await searchArxiv(query, { start: offset, maxResults: limit });
        return { source, papers: result.papers, total: result.total };
      }
      case 'pubmed': {
        const result = await searchPubMed(query, { start: offset, maxResults: limit });
        return { source, papers: result.papers, total: result.total };
      }
      case 'crossref': {
        const result = await searchCrossRef(query, { offset, rows: limit });
        return { source, papers: result.papers, total: result.total };
      }
      case 'openalex': {
        const page = Math.floor(offset / limit) + 1;
        const result = await searchOpenAlex(query, { page, perPage: limit });
        return { source, papers: result.papers, total: result.total };
      }
      default:
        return { source, papers: [], total: 0, error: 'Unknown source' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error searching ${source}:`, message);
    return { source, papers: [], total: 0, error: message };
  }
}

/**
 * Unified search across all sources
 */
export async function unifiedSearch(request: SearchRequest): Promise<SearchResult> {
  const startTime = Date.now();

  // Check cache first
  maybeCleanupCache();
  const cacheKey = getSearchCacheKey(request.query, {
    sources: request.sources,
    page: request.page,
    limit: request.limit,
    sort: request.sort,
    accessType: request.accessType,
  });

  const cached = searchCache.get<SearchResult>(cacheKey);
  if (cached) {
    return {
      ...cached,
      searchTimeMs: Date.now() - startTime,
    };
  }

  // Determine which sources to search
  const sources: PaperSource[] = request.sources || ['arxiv', 'pubmed', 'crossref', 'openalex'];
  const { offset, perSource } = calculateSourcePagination(
    request.page || 1,
    request.limit || 20,
    sources.length
  );

  // Search all sources in parallel
  const searchPromises = sources.map(source =>
    searchSource(source, request.query, offset, perSource)
  );

  const results = await Promise.all(searchPromises);

  // Combine results
  let allPapers: Paper[] = [];
  let totalFromAllSources = 0;
  const errors: string[] = [];

  for (const result of results) {
    allPapers = [...allPapers, ...result.papers];
    totalFromAllSources += result.total;
    if (result.error) {
      errors.push(`${result.source}: ${result.error}`);
    }
  }

  // Deduplicate
  const deduplicated = deduplicatePapers(allPapers);

  // Filter
  const filtered = filterPapers(deduplicated, {
    accessType: request.accessType,
    citationMin: request.citationMin,
    dateRange: request.dateRange,
  });

  // Sort
  const sorted = sortPapers(filtered, request.sort || 'relevance');

  // Paginate final results
  const limit = request.limit || 20;
  const page = request.page || 1;
  const startIndex = 0; // Already paginated at source level
  const paginated = sorted.slice(startIndex, startIndex + limit);

  const result: SearchResult = {
    papers: paginated,
    total: totalFromAllSources,
    page,
    pages: Math.ceil(totalFromAllSources / limit),
    searchTimeMs: Date.now() - startTime,
  };

  // Cache the result (15 minutes TTL)
  searchCache.set(cacheKey, result, 900000);

  return result;
}

/**
 * Quick search (single source for autocomplete)
 */
export async function quickSearch(query: string, limit: number = 5): Promise<Paper[]> {
  try {
    // Use OpenAlex for quick search (fastest, most comprehensive)
    const result = await searchOpenAlex(query, { perPage: limit });
    return result.papers;
  } catch {
    // Fallback to arXiv
    try {
      const result = await searchArxiv(query, { maxResults: limit });
      return result.papers;
    } catch {
      return [];
    }
  }
}

/**
 * Get featured papers (trending/most cited)
 */
export async function getFeaturedPapers(limit: number = 8): Promise<Paper[]> {
  try {
    const { getTrendingPapers } = await import('@/lib/api/openalex');
    return await getTrendingPapers(90, limit);
  } catch {
    return [];
  }
}
