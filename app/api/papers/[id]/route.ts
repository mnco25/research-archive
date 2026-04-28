import { NextRequest, NextResponse } from 'next/server';
import { parsePaperId } from '@/lib/utils';
import { getArxivPaper } from '@/lib/api/arxiv';
import { getPubMedPaper } from '@/lib/api/pubmed';
import { getCrossRefPaper } from '@/lib/api/crossref';
import { getOpenAlexPaper, getRelatedPapers, getCitingPapers } from '@/lib/api/openalex';
import { paperCache, getPaperCacheKey, maybeCleanupCache } from '@/lib/cache';
import type { Paper, PaperDetail } from '@/lib/types';

export const runtime = 'nodejs';

async function fetchPaper(source: string, externalId: string): Promise<Paper | null> {
  switch (source) {
    case 'arxiv':
      return getArxivPaper(externalId);
    case 'pubmed':
      return getPubMedPaper(externalId);
    case 'crossref':
      return getCrossRefPaper(externalId);
    case 'openalex':
      return getOpenAlexPaper(externalId);
    default:
      // Best-effort identification by id pattern
      if (/^\d{4}\.\d{4,5}/.test(externalId)) return getArxivPaper(externalId);
      if (/^W\d+$/.test(externalId)) return getOpenAlexPaper(externalId);
      if (/^\d+$/.test(externalId)) return getPubMedPaper(externalId);
      if (externalId.includes('/')) return getCrossRefPaper(externalId);
      return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    maybeCleanupCache();

    const cacheKey = getPaperCacheKey(decodedId);
    const cached = paperCache.get<PaperDetail>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const { source, externalId } = parsePaperId(decodedId);
    const paper = await fetchPaper(source, externalId);

    if (!paper) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Paper not found' },
        { status: 404 }
      );
    }

    let relatedPapers: Paper[] | undefined;
    let citedBy: Paper[] | undefined;
    const openAlexId = paper.externalIds.openAlexId || (source === 'openalex' ? externalId : undefined);

    if (openAlexId) {
      const [related, citing] = await Promise.all([
        getRelatedPapers(openAlexId, 5).catch(() => []),
        getCitingPapers(openAlexId, 5).catch(() => []),
      ]);
      relatedPapers = related.length ? related : undefined;
      citedBy = citing.length ? citing : undefined;
    }

    const paperDetail: PaperDetail = { ...paper, relatedPapers, citedBy };
    paperCache.set(cacheKey, paperDetail, 60 * 60 * 1000);
    return NextResponse.json(paperDetail);
  } catch (error) {
    console.error('Paper API error:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
