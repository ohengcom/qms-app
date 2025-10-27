import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { dashboardStatsSchema } from '@/lib/validations/quilt';
import { CacheService, CacheKeys } from '@/server/services/CacheService';

export const dashboardRouter = createTRPCRouter({
  // Get comprehensive dashboard statistics with caching
  getStats: publicProcedure
    .input(dashboardStatsSchema.optional().default({ includeAnalytics: true, includeTrends: false }))
    .query(async ({ ctx, input }) => {
      const cache = CacheService.getInstance();
      const cacheKey = CacheKeys.dashboardStats(input.includeAnalytics);
      
      // Try to get from cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Basic counts
      const [
        totalQuilts,
        inUseCount,
        availableCount,
        storageCount,
        maintenanceCount,
      ] = await Promise.all([
        ctx.db.quilt.count(),
        ctx.db.quilt.count({ where: { currentStatus: 'IN_USE' } }),
        ctx.db.quilt.count({ where: { currentStatus: 'AVAILABLE' } }),
        ctx.db.quilt.count({ where: { currentStatus: 'STORAGE' } }),
        ctx.db.quilt.count({ where: { currentStatus: 'MAINTENANCE' } }),
      ]);

      // Seasonal distribution
      const seasonalDistribution = await ctx.db.quilt.groupBy({
        by: ['season'],
        _count: { season: true },
      });

      // Process seasonal distribution
      const seasonalStats = {
        WINTER: seasonalDistribution.find(item => item.season === 'WINTER')?._count.season || 0,
        SPRING_AUTUMN: seasonalDistribution.find(item => item.season === 'SPRING_AUTUMN')?._count.season || 0,
        SUMMER: seasonalDistribution.find(item => item.season === 'SUMMER')?._count.season || 0,
      };

      // Get recent activity (simplified)
      const recentActivity = await ctx.db.usagePeriod.findMany({
        include: {
          quilt: {
            select: {
              id: true,
              name: true,
              itemNumber: true,
              season: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Get top used quilts (simplified)
      const topUsedQuilts = await ctx.db.quilt.findMany({
        include: {
          usagePeriods: true,
          currentUsage: true,
        },
        take: 5,
      });

      const topUsedWithStats = topUsedQuilts
        .map(quilt => ({
          quilt: {
            id: quilt.id,
            name: quilt.name,
            itemNumber: quilt.itemNumber,
            season: quilt.season,
            currentStatus: quilt.currentStatus,
          },
          stats: {
            totalUsageDays: quilt.usagePeriods.reduce((total, period) => {
              return total + (period.durationDays || 0);
            }, 0),
            usageCount: quilt.usagePeriods.length,
            lastUsedDate: quilt.usagePeriods
              .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0]?.startDate || null,
            averageUsageDuration: quilt.usagePeriods.length > 0 
              ? quilt.usagePeriods.reduce((total, period) => total + (period.durationDays || 0), 0) / quilt.usagePeriods.length 
              : 0,
            isCurrentlyInUse: !!quilt.currentUsage,
          },
        }))
        .sort((a, b) => b.stats.usageCount - a.stats.usageCount)
        .slice(0, 5);

      const result = {
        overview: {
          totalQuilts,
          inUseCount,
          availableCount,
          storageCount,
          maintenanceCount,
        },
        distribution: {
          seasonal: seasonalStats,
          location: {},
          brand: {},
        },
        topUsedQuilts: topUsedWithStats,
        recentActivity: recentActivity.map(period => ({
          id: period.id,
          type: period.endDate ? 'usage_ended' : 'usage_started',
          date: period.endDate || period.startDate,
          quilt: period.quilt,
          duration: period.durationDays,
        })),
        lastUpdated: new Date(),
      };

      // Cache the result for 2 minutes
      cache.set(cacheKey, result, 2 * 60 * 1000);
      
      return result;
    }),



  // Get usage trends (placeholder for now)
  getUsageTrends: publicProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }).optional())
    .query(async () => {
      // Placeholder - will be implemented when analytics are added
      return {
        trends: [],
        summary: {
          totalUsageDays: 0,
          averageUsageDuration: 0,
        },
      };
    }),

  // Get seasonal insights (placeholder for now)
  getSeasonalInsights: publicProcedure
    .query(async () => {
      // Placeholder - will be implemented when seasonal analytics are added
      return {
        recommendations: [],
        currentSeason: 'WINTER',
      };
    }),

  // Get maintenance insights (placeholder for now)
  getMaintenanceInsights: publicProcedure
    .query(async () => {
      // Placeholder - will be implemented when maintenance tracking is added
      return {
        summary: {
          upcomingMaintenanceCount: 0,
          quiltsNeedingAttention: 0,
        },
        upcomingMaintenance: [],
      };
    }),

  // Cache management endpoints
  clearCache: publicProcedure
    .mutation(async () => {
      const cache = CacheService.getInstance();
      cache.clear();
      return { success: true, message: 'Cache cleared successfully' };
    }),

  getCacheStats: publicProcedure
    .query(async () => {
      const cache = CacheService.getInstance();
      return cache.getStats();
    }),
});