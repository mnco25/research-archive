import axios from 'axios';
import type { Paper } from '@/lib/types';
import { cleanHtml, generatePaperId } from '@/lib/utils';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface ESearchResult {
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
    querytranslation?: string;
  };
}

interface PubMedArticle {
  MedlineCitation: {
    PMID: { '#text': string } | string;
    Article: {
      ArticleTitle: string;
      Abstract?: {
        AbstractText: string | { '#text': string }[] | { '#text': string };
      };
      AuthorList?: {
        Author: Array<{
          LastName?: string;
          ForeName?: string;
          Initials?: string;
          AffiliationInfo?: { Affiliation: string }[];
        }> | {
          LastName?: string;
          ForeName?: string;
          Initials?: string;
          AffiliationInfo?: { Affiliation: string }[];
        };
      };
      Journal?: {
        Title?: string;
        ISOAbbreviation?: string;
      };
      ArticleDate?: { Year: string; Month: string; Day: string }[];
      ELocationID?: { '#text': string; '@_EIdType': string }[] | { '#text': string; '@_EIdType': string };
    };
    DateRevised?: { Year: string; Month: string; Day: string };
    MeshHeadingList?: {
      MeshHeading?: Array<{
        DescriptorName: { '#text': string };
      }>;
    };
  };
  PubmedData?: {
    ArticleIdList?: {
      ArticleId: Array<{ '#text': string; '@_IdType': string }> | { '#text': string; '@_IdType': string };
    };
    PublicationStatus?: string;
    History?: {
      PubMedPubDate: Array<{ Year: string; Month: string; Day: string; '@_PubStatus': string }>;
    };
  };
}

interface EFetchResult {
  PubmedArticleSet?: {
    PubmedArticle?: PubMedArticle | PubMedArticle[];
  };
}

/**
 * Search PubMed and get paper UIDs
 */
async function searchPubMedIds(
  query: string,
  options: {
    retstart?: number;
    retmax?: number;
  } = {}
): Promise<{ ids: string[]; total: number }> {
  const { retstart = 0, retmax = 20 } = options;

  const url = `${EUTILS_BASE}/esearch.fcgi`;
  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retstart: retstart.toString(),
    retmax: retmax.toString(),
    retmode: 'json',
    sort: 'relevance',
  });

  try {
    const response = await axios.get(`${url}?${params}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine)',
      },
      timeout: 30000,
    });

    const result: ESearchResult = response.data;
    return {
      ids: result.esearchresult.idlist || [],
      total: parseInt(result.esearchresult.count, 10),
    };
  } catch (error) {
    console.error('PubMed search error:', error);
    throw new Error('Failed to search PubMed');
  }
}

/**
 * Fetch full article details from PubMed
 */
async function fetchPubMedArticles(ids: string[]): Promise<PubMedArticle[]> {
  if (ids.length === 0) return [];

  const url = `${EUTILS_BASE}/efetch.fcgi`;
  const params = new URLSearchParams({
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'xml',
    rettype: 'abstract',
  });

  try {
    const response = await axios.get(`${url}?${params}`, {
      headers: {
        'User-Agent': 'ResearchArchive/1.0 (Academic Search Engine)',
      },
      timeout: 30000,
    });

    // Parse XML response
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const result: EFetchResult = parser.parse(response.data);

    if (!result.PubmedArticleSet?.PubmedArticle) {
      return [];
    }

    const articles = result.PubmedArticleSet.PubmedArticle;
    return Array.isArray(articles) ? articles : [articles];
  } catch (error) {
    console.error('PubMed fetch error:', error);
    throw new Error('Failed to fetch PubMed articles');
  }
}

/**
 * Convert PubMed article to Paper format
 */
function articleToPaper(article: PubMedArticle): Paper {
  const citation = article.MedlineCitation;
  const pubdata = article.PubmedData;

  // Get PMID
  const pmid = typeof citation.PMID === 'string'
    ? citation.PMID
    : citation.PMID['#text'];

  // Get DOI
  let doi: string | undefined;
  if (pubdata?.ArticleIdList?.ArticleId) {
    const articleIds = Array.isArray(pubdata.ArticleIdList.ArticleId)
      ? pubdata.ArticleIdList.ArticleId
      : [pubdata.ArticleIdList.ArticleId];
    const doiEntry = articleIds.find(id => id['@_IdType'] === 'doi');
    doi = doiEntry?.['#text'];
  }

  // Get authors
  const authorList = citation.Article.AuthorList?.Author;
  const authors = authorList
    ? (Array.isArray(authorList) ? authorList : [authorList])
        .filter(a => a.LastName)
        .map(a => ({
          name: `${a.ForeName || ''} ${a.LastName || ''}`.trim(),
          affiliation: a.AffiliationInfo?.[0]?.Affiliation,
        }))
    : [];

  // Get abstract
  let abstract = '';
  const abstractData = citation.Article.Abstract?.AbstractText;
  if (abstractData) {
    if (typeof abstractData === 'string') {
      abstract = abstractData;
    } else if (Array.isArray(abstractData)) {
      abstract = abstractData.map(t => typeof t === 'string' ? t : t['#text']).join(' ');
    } else if (typeof abstractData === 'object' && '#text' in abstractData) {
      abstract = abstractData['#text'];
    }
  }

  // Get date
  let date = '';
  const pubDate = pubdata?.History?.PubMedPubDate?.find(
    d => d['@_PubStatus'] === 'pubmed'
  );
  if (pubDate) {
    date = `${pubDate.Year}-${pubDate.Month.padStart(2, '0')}-${pubDate.Day.padStart(2, '0')}`;
  } else if (citation.DateRevised) {
    const dr = citation.DateRevised;
    date = `${dr.Year}-${dr.Month.padStart(2, '0')}-${dr.Day.padStart(2, '0')}`;
  }

  // Get keywords from MeSH terms
  const keywords = citation.MeshHeadingList?.MeshHeading?.map(
    mh => mh.DescriptorName['#text']
  ) || [];

  return {
    id: generatePaperId('pubmed', pmid),
    title: cleanHtml(citation.Article.ArticleTitle),
    authors,
    abstract: cleanHtml(abstract),
    date,
    source: 'pubmed',
    externalIds: {
      pmid,
      doi,
    },
    citations: 0, // PubMed doesn't provide citation counts directly
    accessType: 'open', // Most PubMed abstracts are open
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    journal: citation.Article.Journal?.Title || citation.Article.Journal?.ISOAbbreviation,
    keywords,
    discipline: 'biomedicine',
  };
}

/**
 * Search PubMed for papers
 */
export async function searchPubMed(
  query: string,
  options: {
    start?: number;
    maxResults?: number;
  } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const { start = 0, maxResults = 20 } = options;

  try {
    // First get IDs
    const { ids, total } = await searchPubMedIds(query, {
      retstart: start,
      retmax: maxResults,
    });

    if (ids.length === 0) {
      return { papers: [], total: 0 };
    }

    // Then fetch full articles
    const articles = await fetchPubMedArticles(ids);
    const papers = articles.map(articleToPaper);

    return { papers, total };
  } catch (error) {
    console.error('PubMed search error:', error);
    throw new Error('Failed to search PubMed');
  }
}

/**
 * Get a specific paper from PubMed by PMID
 */
export async function getPubMedPaper(pmid: string): Promise<Paper | null> {
  try {
    const articles = await fetchPubMedArticles([pmid]);
    if (articles.length === 0) return null;
    return articleToPaper(articles[0]);
  } catch (error) {
    console.error('PubMed fetch error:', error);
    return null;
  }
}
