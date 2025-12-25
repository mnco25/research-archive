import { NextRequest, NextResponse } from 'next/server';
import { SearchRequestSchema } from '@/lib/types';
import { unifiedSearch } from '@/lib/search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parseResult = SearchRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid search request',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const searchRequest = parseResult.data;

    // Perform unified search
    const result = await unifiedSearch(searchRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);

    return NextResponse.json(
      {
        error: 'Search Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Query parameter "q" is required',
      },
      { status: 400 }
    );
  }

  try {
    // Build search request from query params
    const searchRequest = {
      query,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
      sort: (searchParams.get('sort') as 'relevance' | 'date' | 'citations') || 'relevance',
      accessType: (searchParams.get('access') as 'open' | 'any') || undefined,
      sources: searchParams.get('sources')?.split(',') as ('arxiv' | 'pubmed' | 'crossref' | 'openalex')[] || undefined,
    };

    const result = await unifiedSearch(searchRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);

    return NextResponse.json(
      {
        error: 'Search Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
