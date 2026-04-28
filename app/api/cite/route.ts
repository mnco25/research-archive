import { NextRequest, NextResponse } from 'next/server';
import { CiteRequestSchema } from '@/lib/types';
import { formatCitation } from '@/lib/citation-formatter';
import { parsePaperId } from '@/lib/utils';
import { getArxivPaper } from '@/lib/api/arxiv';
import { getPubMedPaper } from '@/lib/api/pubmed';
import { getCrossRefPaper } from '@/lib/api/crossref';
import { getOpenAlexPaper } from '@/lib/api/openalex';
import { paperCache, getPaperCacheKey } from '@/lib/cache';
import type { Paper } from '@/lib/types';

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
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CiteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid citation request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { paperId, format } = parsed.data;
    const cacheKey = getPaperCacheKey(paperId);
    let paper = paperCache.get<Paper>(cacheKey);

    if (!paper) {
      const { source, externalId } = parsePaperId(paperId);
      paper = await fetchPaper(source, externalId);
      if (!paper) {
        return NextResponse.json({ error: 'Not Found', message: 'Paper not found' }, { status: 404 });
      }
      paperCache.set(cacheKey, paper, 60 * 60 * 1000);
    }

    const citation = formatCitation(paper, format);
    return NextResponse.json({ citation, format });
  } catch (error) {
    console.error('Citation API error:', error);
    return NextResponse.json(
      { error: 'Server Error', message: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
