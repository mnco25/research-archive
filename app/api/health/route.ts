import { NextResponse } from 'next/server';
import axios from 'axios';
import type { HealthCheck } from '@/lib/types';

interface SourceHealth {
  status: 'up' | 'down' | 'slow';
  latencyMs?: number;
  lastCheck: string;
}

async function checkSource(
  name: string,
  url: string,
  timeout: number = 5000
): Promise<SourceHealth> {
  const startTime = Date.now();

  try {
    await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Health Check)',
      },
    });

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
    // Check all sources in parallel
    const [arxiv, pubmed, crossref, openalex] = await Promise.all([
      checkSource('arxiv', 'https://export.arxiv.org/api/query?search_query=test&max_results=1'),
      checkSource('pubmed', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=test&retmax=1&retmode=json'),
      checkSource('crossref', 'https://api.crossref.org/v1/works?query=test&rows=1'),
      checkSource('openalex', 'https://api.openalex.org/works?search=test&per_page=1'),
    ]);

    const sources = { arxiv, pubmed, crossref, openalex };

    // Determine overall status
    const statuses = Object.values(sources).map(s => s.status);
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (statuses.every(s => s === 'up')) {
      overallStatus = 'healthy';
    } else if (statuses.some(s => s === 'up')) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    const health: HealthCheck = {
      status: overallStatus,
      sources,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        sources: {},
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
