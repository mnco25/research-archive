import { NextRequest, NextResponse } from 'next/server';
import { parsePaperId } from '@/lib/utils';
import { getArxivPaper } from '@/lib/api/arxiv';
import { getPubMedPaper } from '@/lib/api/pubmed';
import { getCrossRefPaper } from '@/lib/api/crossref';
import { getOpenAlexPaper, getRelatedPapers, getCitingPapers } from '@/lib/api/openalex';
import { paperCache, getPaperCacheKey, maybeCleanupCache } from '@/lib/cache';
import type { PaperDetail } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    maybeCleanupCache();

    // Check cache first
    const cacheKey = getPaperCacheKey(decodedId);
    const cached = paperCache.get<PaperDetail>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Parse the paper ID to get source and external ID
    const { source, externalId } = parsePaperId(decodedId);

    let paper = null;

    // Fetch paper from appropriate source
    switch (source) {
      case 'arxiv':
        paper = await getArxivPaper(externalId);
        break;
      case 'pubmed':
        paper = await getPubMedPaper(externalId);
        break;
      case 'crossref':
        paper = await getCrossRefPaper(externalId);
        break;
      case 'openalex':
        paper = await getOpenAlexPaper(externalId);
        break;
      default:
        // Try to guess the source from the ID format
        if (externalId.match(/^\d{4}\.\d{4,5}/)) {
          paper = await getArxivPaper(externalId);
        } else if (externalId.match(/^\d+$/)) {
          paper = await getPubMedPaper(externalId);
        } else if (externalId.includes('/')) {
          paper = await getCrossRefPaper(externalId);
        } else if (externalId.startsWith('W')) {
          paper = await getOpenAlexPaper(externalId);
        }
    }

    if (!paper) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Paper not found',
        },
        { status: 404 }
      );
    }

    // Try to get related papers and citations (best effort)
    let relatedPapers = undefined;
    let citedBy = undefined;

    // If we have an OpenAlex ID, get related papers
    if (paper.externalIds.openAlexId || source === 'openalex') {
      const openAlexId = paper.externalIds.openAlexId || externalId;
      try {
        [relatedPapers, citedBy] = await Promise.all([
          getRelatedPapers(openAlexId, 5),
          getCitingPapers(openAlexId, 5),
        ]);
      } catch {
        // Ignore errors for related papers
      }
    }

    const paperDetail: PaperDetail = {
      ...paper,
      relatedPapers,
      citedBy,
    };

    // Cache the result (1 hour)
    paperCache.set(cacheKey, paperDetail, 3600000);

    return NextResponse.json(paperDetail);
  } catch (error) {
    console.error('Paper API error:', error);

    return NextResponse.json(
      {
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
