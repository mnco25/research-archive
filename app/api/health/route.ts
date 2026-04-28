import { NextResponse } from 'next/server';
import { httpGet } from '@/lib/http';
import type { HealthCheck } from '@/lib/types';

export const runtime = 'nodejs';
export const revalidate = 30;

interface SourceHealth {
  status: 'up' | 'down' | 'slow';
  latencyMs?: number;
  lastCheck: string;
}

async function checkSource(url: string, timeout: number = 5000): Promise<SourceHealth> {
  const startTime = Date.now();
  try {
    await httpGet(url, { timeout, retries: 0 });
    const latencyMs = Date.now() - startTime;
    return {
      status: latencyMs > 3000 ? 'slow' : 'up',
      latencyMs,
      lastCheck: new Date().toISOString(),
    };
  } catch {
    return {
      status: 'down',
      latencyMs: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
    };
  }
}

export async function GET() {
  try {
    const [arxiv, pubmed, crossref, openalex] = await Promise.all([
      checkSource('https://export.arxiv.org/api/query?search_query=all:test&max_results=1'),
      checkSource('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=test&retmax=1&retmode=json'),
      checkSource('https://api.crossref.org/v1/works?query=test&rows=1'),
      checkSource('https://api.openalex.org/works?search=test&per_page=1'),
    ]);

    const sources = { arxiv, pubmed, crossref, openalex };
    const statuses = Object.values(sources).map(s => s.status);
    const upCount = statuses.filter(s => s === 'up').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (upCount === statuses.length) overallStatus = 'healthy';
    else if (upCount > 0) overallStatus = 'degraded';
    else overallStatus = 'unhealthy';

    const health: HealthCheck = {
      status: overallStatus,
      sources,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    };

    return NextResponse.json(health, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        sources: {},
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
