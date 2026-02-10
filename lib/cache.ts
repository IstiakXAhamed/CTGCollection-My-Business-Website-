/**
 * Simple in-memory cache for frequently accessed data
 * Reduces database queries and improves performance on both Vercel and cPanel
 * 
 * Features:
 * - TTL-based automatic expiration
 * - Type-safe cache keys
 * - Environment-agnostic (works everywhere)
 * - Zero external dependencies
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()
  
  /**
   * Get data from cache
   * @returns Cached data if available and not expired, null otherwise
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  /**
   * Store data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { data, expiresAt })
  }
  
  /**
   * Remove specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * Remove expired entries (automatic cleanup)
   */
  cleanup(): void {
    const now = Date.now()
    // Convert to array to avoid iterator issues
    const entries = Array.from(this.cache.entries())
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
  
  /**
   * Get cache statistics (for debugging)
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Singleton instance
export const cache = new SimpleCache()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

/**
 * Cache key constants for type safety and consistency
 */
export const CacheKeys = {
  // Categories
  CATEGORIES_ALL: 'categories:all',
  CATEGORIES_ACTIVE: 'categories:active',
  CATEGORY_BY_SLUG: (slug: string) => `category:slug:${slug}`,
  
  // Products
  PRODUCTS_FEATURED: 'products:featured',
  PRODUCTS_BESTSELLERS: 'products:bestsellers',
  PRODUCT_BY_SLUG: (slug: string) => `product:slug:${slug}`,
  
  // Site Settings
  SITE_SETTINGS: 'site:settings',
  LOYALTY_SETTINGS: 'loyalty:settings',
  
  // Flash Sales
  FLASH_SALES_ACTIVE: 'flash_sales:active',
} as const

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
  CATEGORIES: 10 * 60,        // 10 minutes (rarely change)
  PRODUCTS_LIST: 5 * 60,      // 5 minutes (moderate changes)
  PRODUCT_DETAIL: 3 * 60,     // 3 minutes (frequent changes)
  SITE_SETTINGS: 15 * 60,     // 15 minutes (rarely change)
  FLASH_SALES: 1 * 60,        // 1 minute (time-sensitive)
} as const

/**
 * Helper function to wrap database queries with caching
 * 
 * @example
 * const categories = await withCache(
 *   CacheKeys.CATEGORIES_ALL,
 *   CacheTTL.CATEGORIES,
 *   () => prisma.category.findMany()
 * )
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cache HIT: ${key}`)
    }
    return cached
  }
  
  // Cache miss - fetch from database
  if (process.env.NODE_ENV === 'development') {
    console.log(`❌ Cache MISS: ${key}`)
  }
  
  const data = await fetchFn()
  
  // Store in cache
  cache.set(key, data, ttlSeconds)
  
  return data
}

/**
 * Invalidate cache entries by pattern
 * Useful when data is updated and you need to clear related caches
 * 
 * @example
 * // After updating a product, clear all product caches
 * invalidateCache('product:')
 */
export function invalidateCache(pattern: string): void {
  const stats = cache.stats()
  const keysToDelete = stats.keys.filter(key => key.includes(pattern))
  
  keysToDelete.forEach(key => cache.delete(key))
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗑️  Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`)
  }
}
