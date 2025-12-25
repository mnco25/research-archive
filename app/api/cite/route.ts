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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = CiteRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid citation request',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { paperId, format } = parseResult.data;

    // Check cache first
    const cacheKey = getPaperCacheKey(paperId);
    let paper = paperCache.get<Paper>(cacheKey);

    if (!paper) {
      // Fetch paper
      const { source, externalId } = parsePaperId(paperId);

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
          return NextResponse.json(
            {
              error: 'Not Found',
              message: 'Unknown paper source',
            },
            { status: 404 }
          );
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
    }

    // Generate citation
    const citation = formatCitation(paper, format);

    return NextResponse.json({
      citation,
      format,
    });
  } catch (error) {
    console.error('Citation API error:', error);

    return NextResponse.json(
      {
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
