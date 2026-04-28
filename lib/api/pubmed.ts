import { XMLParser } from 'fast-xml-parser';
import type { Paper } from '@/lib/types';
import { cleanHtml, generatePaperId } from '@/lib/utils';
import { httpGet } from '@/lib/http';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ICITE_BASE = 'https://icite.od.nih.gov/api/pubs';
const API_KEY = process.env.PUBMED_API_KEY;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  trimValues: true,
});

interface ESearchResult {
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
  };
}

interface PubMedDate {
  Year: string | number;
  Month?: string | number;
  Day?: string | number;
  '@_PubStatus'?: string;
}

interface PubMedAuthor {
  LastName?: string;
  ForeName?: string;
  Initials?: string;
  CollectiveName?: string;
  AffiliationInfo?: { Affiliation: string }[] | { Affiliation: string };
}

interface PubMedArticle {
  MedlineCitation: {
    PMID: { '#text': string } | string;
    Article: {
      ArticleTitle: string | { '#text': string };
      Abstract?: {
        AbstractText:
          | string
          | { '#text': string; '@_Label'?: string }
          | (string | { '#text': string; '@_Label'?: string })[];
      };
      AuthorList?: { Author: PubMedAuthor | PubMedAuthor[] };
      Journal?: {
        Title?: string;
        ISOAbbreviation?: string;
        JournalIssue?: { PubDate?: PubMedDate };
      };
      ArticleDate?: PubMedDate | PubMedDate[];
      ELocationID?:
        | { '#text': string; '@_EIdType': string }
        | { '#text': string; '@_EIdType': string }[];
    };
    MeshHeadingList?: {
      MeshHeading?: { DescriptorName: { '#text': string } | string }[];
    };
    KeywordList?: {
      Keyword?: ({ '#text': string } | string) | ({ '#text': string } | string)[];
    };
  };
  PubmedData?: {
    ArticleIdList?: {
      ArticleId:
        | { '#text': string; '@_IdType': string }
        | { '#text': string; '@_IdType': string }[];
    };
    History?: { PubMedPubDate?: PubMedDate | PubMedDate[] };
  };
}

interface EFetchResult {
  PubmedArticleSet?: { PubmedArticle?: PubMedArticle | PubMedArticle[] };
}

const monthNames: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function pad(value: string | number | undefined, fallback: string): string {
  if (value == null) return fallback;
  const str = String(value).trim();
  if (!str) return fallback;
  const lower = str.toLowerCase().slice(0, 3);
  if (monthNames[lower]) return monthNames[lower];
  return str.padStart(2, '0');
}

function dateToIso(date: PubMedDate | undefined): string {
  if (!date?.Year) return '';
  return `${date.Year}-${pad(date.Month, '01')}-${pad(date.Day, '01')}`;
}

function pickPubDate(article: PubMedArticle): string {
  const articleDate = article.MedlineCitation.Article.ArticleDate;
  if (articleDate) {
    const first = Array.isArray(articleDate) ? articleDate[0] : articleDate;
    const iso = dateToIso(first);
    if (iso) return iso;
  }
  const journalDate = article.MedlineCitation.Article.Journal?.JournalIssue?.PubDate;
  if (journalDate) {
    const iso = dateToIso(journalDate);
    if (iso) return iso;
  }
  const history = article.PubmedData?.History?.PubMedPubDate;
  if (history) {
    const list = Array.isArray(history) ? history : [history];
    const pub = list.find(d => d['@_PubStatus'] === 'pubmed') || list[0];
    return dateToIso(pub);
  }
  return '';
}

function pickText(value: string | { '#text': string } | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value['#text'];
}

function articleToPaper(article: PubMedArticle, citations: number = 0): Paper {
  const citation = article.MedlineCitation;
  const pubdata = article.PubmedData;

  const pmid = typeof citation.PMID === 'string' ? citation.PMID : citation.PMID['#text'];

  let doi: string | undefined;
  const articleIds = pubdata?.ArticleIdList?.ArticleId;
  if (articleIds) {
    const list = Array.isArray(articleIds) ? articleIds : [articleIds];
    doi = list.find(id => id['@_IdType'] === 'doi')?.['#text'];
  }
  if (!doi) {
    const eloc = citation.Article.ELocationID;
    if (eloc) {
      const list = Array.isArray(eloc) ? eloc : [eloc];
      doi = list.find(e => e['@_EIdType'] === 'doi')?.['#text'];
    }
  }

  const authorRaw = citation.Article.AuthorList?.Author;
  const authors = authorRaw
    ? (Array.isArray(authorRaw) ? authorRaw : [authorRaw])
        .map(a => {
          if (a.CollectiveName) return { name: a.CollectiveName };
          const name = `${a.ForeName || a.Initials || ''} ${a.LastName || ''}`.trim();
          if (!name) return null;
          const aff = a.AffiliationInfo;
          const affList = aff ? (Array.isArray(aff) ? aff : [aff]) : [];
          return { name, affiliation: affList[0]?.Affiliation };
        })
        .filter((x): x is { name: string; affiliation?: string } => Boolean(x))
    : [];

  let abstract = '';
  const abstractData = citation.Article.Abstract?.AbstractText;
  if (abstractData) {
    const list = Array.isArray(abstractData) ? abstractData : [abstractData];
    abstract = list
      .map(part => {
        if (typeof part === 'string') return part;
        const label = part['@_Label'] ? `${part['@_Label']}: ` : '';
        return label + part['#text'];
      })
      .filter(Boolean)
      .join(' ');
  }

  const meshKeywords =
    citation.MeshHeadingList?.MeshHeading?.map(mh => pickText(mh.DescriptorName)).filter(Boolean) || [];
  const userKeywords = citation.KeywordList?.Keyword
    ? (Array.isArray(citation.KeywordList.Keyword) ? citation.KeywordList.Keyword : [citation.KeywordList.Keyword])
        .map(pickText)
        .filter(Boolean)
    : [];

  return {
    id: generatePaperId('pubmed', pmid),
    title: cleanHtml(pickText(citation.Article.ArticleTitle)),
    authors,
    abstract: cleanHtml(abstract),
    date: pickPubDate(article),
    source: 'pubmed',
    externalIds: { pmid, doi },
    citations,
    accessType: 'open',
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    pdfUrl: doi ? `https://doi.org/${doi}` : undefined,
    journal: citation.Article.Journal?.Title || citation.Article.Journal?.ISOAbbreviation,
    keywords: [...new Set([...userKeywords, ...meshKeywords])].slice(0, 10),
    discipline: 'Medicine',
  };
}

function appendApiKey(params: URLSearchParams): URLSearchParams {
  if (API_KEY) params.set('api_key', API_KEY);
  return params;
}

async function searchPubMedIds(
  query: string,
  retstart: number,
  retmax: number
): Promise<{ ids: string[]; total: number }> {
  const params = appendApiKey(
    new URLSearchParams({
      db: 'pubmed',
      term: query,
      retstart: String(retstart),
      retmax: String(retmax),
      retmode: 'json',
      sort: 'relevance',
    })
  );

  const response = await httpGet<ESearchResult>(`${EUTILS_BASE}/esearch.fcgi?${params}`);
  return {
    ids: response.data.esearchresult.idlist || [],
    total: parseInt(response.data.esearchresult.count, 10) || 0,
  };
}

async function fetchPubMedArticles(ids: string[]): Promise<PubMedArticle[]> {
  if (ids.length === 0) return [];
  const params = appendApiKey(
    new URLSearchParams({
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'xml',
      rettype: 'abstract',
    })
  );

  const response = await httpGet<string>(`${EUTILS_BASE}/efetch.fcgi?${params}`, {
    headers: { Accept: 'application/xml' },
    responseType: 'text',
  });

  const result: EFetchResult = parser.parse(response.data);
  const articles = result.PubmedArticleSet?.PubmedArticle;
  if (!articles) return [];
  return Array.isArray(articles) ? articles : [articles];
}

async function fetchCitationCounts(ids: string[]): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();
  try {
    const response = await httpGet<{ data: { pmid: number; citation_count: number }[] }>(
      `${ICITE_BASE}?pmids=${ids.join(',')}&fl=pmid,citation_count`,
      { timeout: 8000, retries: 0 }
    );
    const map = new Map<string, number>();
    for (const item of response.data.data || []) {
      map.set(String(item.pmid), item.citation_count || 0);
    }
    return map;
  } catch {
    return new Map();
  }
}

export async function searchPubMed(
  query: string,
  options: { start?: number; maxResults?: number } = {}
): Promise<{ papers: Paper[]; total: number }> {
  const { start = 0, maxResults = 20 } = options;
  const { ids, total } = await searchPubMedIds(query, start, maxResults);
  if (ids.length === 0) return { papers: [], total: 0 };

  const [articles, citations] = await Promise.all([fetchPubMedArticles(ids), fetchCitationCounts(ids)]);
  const papers = articles.map(article => {
    const pmid = typeof article.MedlineCitation.PMID === 'string'
      ? article.MedlineCitation.PMID
      : article.MedlineCitation.PMID['#text'];
    return articleToPaper(article, citations.get(pmid) || 0);
  });
  return { papers, total };
}

export async function getPubMedPaper(pmid: string): Promise<Paper | null> {
  try {
    const [articles, citations] = await Promise.all([fetchPubMedArticles([pmid]), fetchCitationCounts([pmid])]);
    if (articles.length === 0) return null;
    return articleToPaper(articles[0], citations.get(pmid) || 0);
  } catch (error) {
    console.error('PubMed getPaper error:', error);
    return null;
  }
}
