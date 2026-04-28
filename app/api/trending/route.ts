import { NextRequest, NextResponse } from 'next/server';
import { getTrendingPapers } from '@/lib/api/openalex';
import { searchCache } from '@/lib/cache';
import type { Paper } from '@/lib/types';

export const runtime = 'nodejs';
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const days = Math.min(Math.max(parseInt(params.get('days') || '180', 10) || 180, 7), 365);
  const limit = Math.min(Math.max(parseInt(params.get('limit') || '8', 10) || 8, 1), 20);

  const cacheKey = `trending:${days}:${limit}`;
  const cached = searchCache.get<{ papers: Paper[] }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    });
  }

  const papers = await getTrendingPapers(days, limit);
  const payload = { papers };
  searchCache.set(cacheKey, payload, 30 * 60 * 1000);

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
  });
}
