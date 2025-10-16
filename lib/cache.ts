/**
 * Client-side cache utilities for API responses
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 хвилин

/**
 * Get data from cache
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const item: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();

    if (now >= item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

/**
 * Set data to cache
 */
export function setCachedData<T>(
  key: string,
  data: T,
  duration: number = CACHE_DURATION
): void {
  if (typeof window === "undefined") return;

  try {
    const item: CacheItem<T> = {
      data,
      expiry: Date.now() + duration,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

/**
 * Clear specific cache key
 */
export function clearCache(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

/**
 * Clear all cache with a prefix
 */
export function clearCacheByPrefix(prefix: string): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

/**
 * Cached fetch wrapper
 */
export async function cachedFetch<T>(
  url: string,
  cacheKey?: string,
  duration?: number
): Promise<T> {
  const key = cacheKey || `cache_${url}`;

  // Try to get from cache first
  const cached = getCachedData<T>(key);
  if (cached) {
    console.log(`Using cached data for: ${url}`);
    return cached;
  }

  // Fetch from server
  console.log(`Fetching from server: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data: T = await response.json();

  // Save to cache
  setCachedData(key, data, duration);

  return data;
}

// Cache keys constants
export const CACHE_KEYS = {
  PRODUCTS: "cache_products",
  COLORS: "cache_colors",
  CATEGORIES: "cache_categories",
  PRODUCT: (id: number) => `cache_product_${id}`,
  PRODUCTS_CATEGORY: (category: string) => `cache_products_category_${category}`,
  PRODUCTS_SEASON: (season: string) => `cache_products_season_${season}`,
  PRODUCTS_SUBCATEGORY: (subcategory: string) =>
    `cache_products_subcategory_${subcategory}`,
};

