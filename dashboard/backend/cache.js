/**
 * Simple in-memory cache for Firestore data to reduce quota usage
 * Cache entries expire after a configurable TTL (Time To Live)
 */

class FirestoreCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 60 * 1000; // 1 minute default TTL
  }

  /**
   * Get a cached value
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if expired/missing
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set a cache value
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      cachedAt: Date.now()
    });
  }

  /**
   * Invalidate a cache entry
   * @param {string} key - Cache key or pattern
   */
  invalidate(key) {
    if (key.includes('*')) {
      // Pattern matching - invalidate all matching keys
      const pattern = new RegExp('^' + key.replace(/\*/g, '.*') + '$');
      for (const cacheKey of this.cache.keys()) {
        if (pattern.test(cacheKey)) {
          this.cache.delete(cacheKey);
        }
      }
    } else {
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries
    };
  }
}

// Singleton instance
const cache = new FirestoreCache();

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
  SHORT: 30 * 1000,      // 30 seconds - for frequently changing data
  MEDIUM: 2 * 60 * 1000, // 2 minutes - for moderately changing data
  LONG: 5 * 60 * 1000,   // 5 minutes - for rarely changing data
  ANALYTICS: 3 * 60 * 1000 // 3 minutes - for analytics data
};

module.exports = { cache, CACHE_TTL };
