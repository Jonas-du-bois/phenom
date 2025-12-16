import { useRef, useCallback } from 'react';

// ============================================
// API CACHE HOOK
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

interface CacheOptions {
  expiresIn?: number; // milliseconds, default 5 minutes
}

/**
 * Custom hook for caching API responses in memory
 * Helps reduce redundant API calls and improve performance
 */
export function useAPICache<T = any>() {
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  /**
   * Get cached data if valid, otherwise return null
   */
  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.expiresIn;

    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    console.log(`✅ Cache hit for key: ${key}`);
    return entry.data;
  }, []);

  /**
   * Set data in cache with optional expiration time
   */
  const set = useCallback((key: string, data: T, options?: CacheOptions) => {
    const expiresIn = options?.expiresIn || 5 * 60 * 1000; // Default 5 minutes
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });

    console.log(`💾 Cached data for key: ${key} (expires in ${expiresIn / 1000}s)`);
  }, []);

  /**
   * Clear specific cache entry
   */
  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key);
    console.log(`🗑️ Removed cache for key: ${key}`);
  }, []);

  /**
   * Clear all cache
   */
  const clear = useCallback(() => {
    cacheRef.current.clear();
    console.log('🗑️ Cleared all cache');
  }, []);

  /**
   * Check if key exists and is valid
   */
  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      return false;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.expiresIn;

    if (isExpired) {
      cacheRef.current.delete(key);
      return false;
    }

    return true;
  }, []);

  /**
   * Get cache size
   */
  const size = useCallback((): number => {
    return cacheRef.current.size;
  }, []);

  return {
    get,
    set,
    remove,
    clear,
    has,
    size
  };
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}
