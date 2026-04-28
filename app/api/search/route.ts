import { NextRequest, NextResponse } from 'next/server';
import { SearchRequestSchema, type PaperSource } from '@/lib/types';
import { unifiedSearch } from '@/lib/search';

export const runtime = 'nodejs';

const VALID_SOURCES = new Set<PaperSource>(['arxiv', 'pubmed', 'crossref', 'openalex']);

function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: 'Validation Error', message, details },
    { status: 400 }
  );
}

function serverError(error: unknown) {
  console.error('Search API error:', error);
  return NextResponse.json(
    { error: 'Search Error', message: error instanceof Error ? error.message : 'Unexpected error' },
    { status: 500 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SearchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Invalid search request', parsed.error.flatten());
    }
    const result = await unifiedSearch(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const query = sp.get('q');
  if (!query) return badRequest('Query parameter "q" is required');

  const sourcesParam = sp.get('sources');
  const sources = sourcesParam
    ? (sourcesParam.split(',').map(s => s.trim().toLowerCase()).filter(s => VALID_SOURCES.has(s as PaperSource)) as PaperSource[])
    : undefined;

  const dateFrom = sp.get('from');
  const dateTo = sp.get('to');
  const dateRange = dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined;

  const candidate = {
    query,
    page: parseInt(sp.get('page') || '1', 10),
    limit: parseInt(sp.get('limit') || '20', 10),
    sort: (sp.get('sort') as 'relevance' | 'date' | 'citations') || 'relevance',
    accessType: (sp.get('access') as 'open' | 'any') || undefined,
    citationMin: sp.get('citationMin') ? parseInt(sp.get('citationMin')!, 10) : undefined,
    discipline: sp.get('discipline') || undefined,
    sources,
    dateRange,
  };

  const parsed = SearchRequestSchema.safeParse(candidate);
  if (!parsed.success) return badRequest('Invalid search request', parsed.error.flatten());

  try {
    const result = await unifiedSearch(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return serverError(error);
  }
}
