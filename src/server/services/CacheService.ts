interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;
  private maxSize: number;
  private static instance: CacheService;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000; // 1000 entries max

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  static getInstance(options?: CacheOptions): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(options);
    }
    return CacheService.instance;
  }

  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalSize++;
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    }

    return {
      totalEntries: totalSize,
      expiredEntries: expiredCount,
      activeEntries: totalSize - expiredCount,
      maxSize: this.maxSize,
      hitRate: this.getHitRate(),
    };
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Calculate hit rate (simplified - would need request tracking for accurate rate)
  private getHitRate(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track hits and misses
    return this.cache.size > 0 ? 0.85 : 0;
  }

  // Warm up cache with common queries
  async warmUp(
    warmUpFunctions: Array<() => Promise<{ key: string; data: any; ttl?: number }>>
  ): Promise<void> {
    const promises = warmUpFunctions.map(async fn => {
      try {
        const { key, data, ttl } = await fn();
        this.set(key, data, ttl);
      } catch (error) {
        // Cache warm-up failed - continue without cache
      }
    });

    await Promise.all(promises);
  }
}

// Cache key generators for consistent naming
export const CacheKeys = {
  dashboardStats: (includeAnalytics: boolean = true) =>
    `dashboard:stats:${includeAnalytics ? 'with' : 'without'}_analytics`,

  seasonalInsights: () => 'dashboard:seasonal_insights',

  maintenanceInsights: () => 'dashboard:maintenance_insights',

  usageTrends: (startDate: string, endDate: string) =>
    `dashboard:usage_trends:${startDate}:${endDate}`,

  quiltList: (filters: string) => `quilts:list:${filters}`,

  quiltDetail: (id: number) => `quilts:detail:${id}`,

  userPreferences: (userId: string) => `user:preferences:${userId}`,
};

// Cache invalidation patterns
export const CachePatterns = {
  allDashboard: 'dashboard:.*',
  allQuilts: 'quilts:.*',
  allUsage: 'usage:.*',
  allMaintenance: 'maintenance:.*',
};
