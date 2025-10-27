import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { dashboardStatsSchema } from '@/lib/validations/quilt';
import { CacheService } from '@/server/services/CacheService';
import { db } from '@/lib/neon';

export const dashboardRouter = createTRPCRouter({
  // Get comprehensive dashboard statistics with caching
  getStats: publicProcedure
    .input(dashboardStatsSchema.optional().default({ includeAnalytics: true, includeTrends: false }))
    .query(async ({ ctx, input }) => {
      try {
        console.log('Dashboard getStats: Starting query...');
        
        // Get total quilts count
        console.log('Dashboard getStats: Getting total quilts count...');
        const totalQuilts = await db.countQuilts();
        console.log('Dashboard getStats: Total quilts:', totalQuilts);
        
        // Get all quilts to calculate status counts
        console.log('Dashboard getStats: Getting all quilts...');
        const allQuilts = await db.getQuilts({ limit: 1000 }); // Get all quilts
        console.log('Dashboard getStats: Retrieved quilts:', allQuilts?.length || 0);
        console.log('Dashboard getStats: First quilt status:', allQuilts?.[0]?.currentStatus);
        
        // Calculate status counts
        const inUseCount = allQuilts.filter(q => q.currentStatus === 'IN_USE').length;
        const availableCount = allQuilts.filter(q => q.currentStatus === 'AVAILABLE').length;
        const storageCount = allQuilts.filter(q => q.currentStatus === 'STORAGE').length;
        const maintenanceCount = allQuilts.filter(q => q.currentStatus === 'MAINTENANCE').length;
        
        console.log('Dashboard getStats: Status counts:', { inUseCount, availableCount, storageCount, maintenanceCount });

      // Calculate seasonal distribution
      const seasonalStats = {
        WINTER: allQuilts.filter(q => q.season === 'WINTER').length,
        SPRING_AUTUMN: allQuilts.filter(q => q.season === 'SPRING_AUTUMN').length,
        SUMMER: allQuilts.filter(q => q.season === 'SUMMER').length,
      };

      // Get recent activity - TODO: Implement with Neon
      const recentActivity: any[] = [];

      // Get top used quilts - TODO: Implement with Neon
      const topUsedWithStats: any[] = [];

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

        console.log('Dashboard getStats: Final result:', JSON.stringify(result, null, 2));
        return result;
        
      } catch (error) {
        console.error('Dashboard getStats error:', error);
        
        // Return fallback data instead of throwing
        return {
          overview: {
            totalQuilts: 0,
            inUseCount: 0,
            availableCount: 0,
            storageCount: 0,
            maintenanceCount: 0,
          },
          distribution: {
            seasonal: { WINTER: 0, SPRING_AUTUMN: 0, SUMMER: 0 },
            location: {},
            brand: {},
          },
          topUsedQuilts: [],
          recentActivity: [],
          lastUpdated: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
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