import { NextRequest, NextResponse } from 'next/server';
import { autocompleteOpenAlex } from '@/lib/api/openalex';
import { searchCache } from '@/lib/cache';
import type { Suggestion } from '@/lib/types';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '6', 10) || 6, 10);

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] satisfies Suggestion[] });
  }

  const cacheKey = `suggest:${query.toLowerCase()}:${limit}`;
  const cached = searchCache.get<{ suggestions: Suggestion[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    });
  }

  const suggestions = await autocompleteOpenAlex(query, limit);
  const payload = { suggestions };
  searchCache.set(cacheKey, payload, 5 * 60 * 1000);

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
  });
}
