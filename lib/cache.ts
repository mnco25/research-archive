interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Simple in-memory cache with TTL support
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set item in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMs Time to live in milliseconds (default: 1 hour)
   */
  set<T>(key: string, data: T, ttlMs: number = 3600000): void {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxEntries: number } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
    };
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

// Global cache instances
export const searchCache = new MemoryCache(500);
export const paperCache = new MemoryCache(1000);

// Cache key generators
export function getSearchCacheKey(query: string, options: Record<string, unknown>): string {
  const sorted = Object.keys(options)
    .sort()
    .map(key => `${key}:${JSON.stringify(options[key])}`)
    .join('|');
  return `search:${query}:${sorted}`;
}

export function getPaperCacheKey(id: string): string {
  return `paper:${id}`;
}

// Periodic cleanup (call this in API routes)
let lastCleanup = 0;
const CLEANUP_INTERVAL = 300000; // 5 minutes

export function maybeCleanupCache(): void {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    searchCache.cleanup();
    paperCache.cleanup();
    lastCleanup = now;
  }
}
