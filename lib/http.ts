import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const APP_NAME = 'ResearchArchive';
const APP_VERSION = '2.0';
const CONTACT_EMAIL =
  process.env.RESEARCH_CONTACT_EMAIL ||
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
  'hello@research-archive.app';

export const USER_AGENT = `${APP_NAME}/${APP_VERSION} (Academic Search Engine; +mailto:${CONTACT_EMAIL})`;

const DEFAULT_TIMEOUT = 25000;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export interface RequestOptions extends AxiosRequestConfig {
  retries?: number;
  baseDelayMs?: number;
}

function isRetryable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const err = error as AxiosError;
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
    return true;
  }
  return err.response ? RETRYABLE_STATUS.has(err.response.status) : true;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function httpGet<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<AxiosResponse<T>> {
  const { retries = 2, baseDelayMs = 600, headers = {}, timeout = DEFAULT_TIMEOUT, ...rest } = options;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get<T>(url, {
        ...rest,
        timeout,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...headers },
      });
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryable(error)) break;
      await delay(baseDelayMs * Math.pow(2, attempt));
    }
  }
  throw lastError;
}
