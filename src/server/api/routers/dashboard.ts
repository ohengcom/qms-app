import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { dashboardStatsSchema } from '@/lib/validations/quilt';
import { CacheService } from '@/server/services/CacheService';
import { sql } from '@/lib/neon';
import { quiltRepository } from '@/lib/repositories/quilt.repository';

export const dashboardRouter = createTRPCRouter({
  // Get comprehensive dashboard statistics with caching
  getStats: publicProcedure
    .input(
      dashboardStatsSchema.optional().default({ includeAnalytics: true, includeTrends: false })
    )
    .query(async () => {
      try {
        // Get total quilts count
        const totalQuilts = await quiltRepository.count();

        // Get all quilts to calculate status counts
        const allQuilts = await quiltRepository.findAll({ limit: 1000 }); // Get all quilts

        // Calculate status counts
        // Note: AVAILABLE status removed - use STORAGE instead
        const inUseCount = allQuilts.filter(q => q.currentStatus === 'IN_USE').length;
        const storageCount = allQuilts.filter(q => q.currentStatus === 'STORAGE').length;
        const maintenanceCount = allQuilts.filter(q => q.currentStatus === 'MAINTENANCE').length;

        // Calculate seasonal distribution
        const seasonalStats = {
          WINTER: allQuilts.filter(q => q.season === 'WINTER').length,
          SPRING_AUTUMN: allQuilts.filter(q => q.season === 'SPRING_AUTUMN').length,
          SUMMER: allQuilts.filter(q => q.season === 'SUMMER').length,
        };

        // Get quilts currently in use with their details
        const inUseQuilts = allQuilts
          .filter(q => q.currentStatus === 'IN_USE')
          .map(q => ({
            id: q.id,
            name: q.name,
            itemNumber: q.itemNumber,
            season: q.season,
            fillMaterial: q.fillMaterial,
            weightGrams: q.weightGrams,
            location: q.location,
          }));

        // Get historical usage data for this day in previous years
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        const monthDay = `${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

        let historicalUsage: any[] = [];
        try {
          const result = await sql`
            SELECT 
              up.id,
              up.quilt_id as "quiltId",
              up.start_date as "startDate",
              up.end_date as "endDate",
              q.name as "quiltName",
              q.item_number as "itemNumber",
              q.season,
              EXTRACT(YEAR FROM up.start_date) as year
            FROM usage_periods up
            JOIN quilts q ON up.quilt_id = q.id
            WHERE 
              EXTRACT(YEAR FROM up.start_date) < EXTRACT(YEAR FROM CURRENT_DATE)
              AND (
                (EXTRACT(MONTH FROM up.start_date) < ${currentMonth} OR 
                 (EXTRACT(MONTH FROM up.start_date) = ${currentMonth} AND EXTRACT(DAY FROM up.start_date) <= ${currentDay}))
                AND
                (up.end_date IS NULL OR 
                 EXTRACT(MONTH FROM up.end_date) > ${currentMonth} OR 
                 (EXTRACT(MONTH FROM up.end_date) = ${currentMonth} AND EXTRACT(DAY FROM up.end_date) >= ${currentDay}))
              )
            ORDER BY up.start_date DESC
            LIMIT 20
          `;

          historicalUsage = result.map((row: any) => ({
            id: row.id,
            quiltId: row.quiltId,
            quiltName: row.quiltName,
            itemNumber: row.itemNumber,
            season: row.season,
            startDate: row.startDate,
            endDate: row.endDate,
            year: parseInt(row.year),
          }));
        } catch {
          // Continue without historical data if query fails
        }

        // Get recent activity and top used quilts - simplified for now
        const recentActivity: any[] = [];
        const topUsedWithStats: any[] = [];

        const result = {
          overview: {
            totalQuilts,
            inUseCount,
            storageCount,
            maintenanceCount,
          },
          distribution: {
            seasonal: seasonalStats,
            location: {},
            brand: {},
          },
          topUsedQuilts: topUsedWithStats,
          recentActivity,
          inUseQuilts,
          historicalUsage,
          date: {
            today: today.toISOString(),
            monthDay,
          },
          lastUpdated: new Date(),
        };

        return result;
      } catch (error) {
        // Return fallback data instead of throwing
        return {
          overview: {
            totalQuilts: 0,
            inUseCount: 0,
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
          inUseQuilts: [],
          historicalUsage: [],
          date: {
            today: new Date().toISOString(),
            monthDay: '',
          },
          lastUpdated: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Get usage trends (placeholder for now)
  getUsageTrends: publicProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
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
  getSeasonalInsights: publicProcedure.query(async () => {
    // Placeholder - will be implemented when seasonal analytics are added
    return {
      recommendations: [],
      currentSeason: 'WINTER',
    };
  }),

  // Get maintenance insights (placeholder for now)
  getMaintenanceInsights: publicProcedure.query(async () => {
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
  clearCache: publicProcedure.mutation(async () => {
    const cache = CacheService.getInstance();
    cache.clear();
    return { success: true, message: 'Cache cleared successfully' };
  }),

  getCacheStats: publicProcedure.query(async () => {
    const cache = CacheService.getInstance();
    return cache.getStats();
  }),
});
