import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import {
  createQuiltSchema,
  updateQuiltSchema,
  quiltSearchSchema,
  createCurrentUsageSchema,
  endCurrentUsageSchema,
  createMaintenanceRecordSchema,
} from '@/lib/validations/quilt';
import { Season, QuiltStatus } from '@prisma/client';

export const quiltsRouter = createTRPCRouter({
  // Get all quilts with filtering and pagination (with caching)
  getAll: publicProcedure
    .input(quiltSearchSchema)
    .query(async ({ ctx, input }) => {
      // Create cache key based on search parameters
      const cacheKey = `quilts:getAll:${JSON.stringify(input)}`;
      
      // Try to get from cache first
      try {
        const { CacheService } = await import('@/server/services/CacheService');
        const cache = CacheService.getInstance();
        
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }
      } catch (error) {
        // Continue without caching if service unavailable
      }
      const { filters, sortBy, sortOrder, skip, take } = input;
      
      const where: any = {};
      
      // Apply filters
      if (filters.season) where.season = filters.season;
      if (filters.status) where.currentStatus = filters.status;
      if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
      if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
      if (filters.minWeight || filters.maxWeight) {
        where.weightGrams = {};
        if (filters.minWeight) where.weightGrams.gte = filters.minWeight;
        if (filters.maxWeight) where.weightGrams.lte = filters.maxWeight;
      }
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { color: { contains: filters.search, mode: 'insensitive' } },
          { fillMaterial: { contains: filters.search, mode: 'insensitive' } },
          { notes: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [quilts, total] = await Promise.all([
        ctx.db.quilt.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take,
          include: {
            currentUsage: true,
            usagePeriods: {
              orderBy: { startDate: 'desc' },
              take: 3,
            },
            maintenanceLog: {
              orderBy: { performedAt: 'desc' },
              take: 1,
            },
          },
        }),
        ctx.db.quilt.count({ where }),
      ]);

      const result = {
        quilts,
        total,
        hasMore: skip + take < total,
      };

      // Cache the result for 1 minute
      try {
        const { CacheService } = await import('@/server/services/CacheService');
        const cache = CacheService.getInstance();
        cache.set(cacheKey, result, 60 * 1000);
      } catch (error) {
        // Continue without caching if service unavailable
      }

      return result;
    }),

  // Get quilt by ID with full details
  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const quilt = await ctx.db.quilt.findUnique({
        where: { id: input.id },
        include: {
          currentUsage: true,
          usagePeriods: {
            orderBy: { startDate: 'desc' },
          },
          maintenanceLog: {
            orderBy: { performedAt: 'desc' },
          },
        },
      });

      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }

      // Calculate usage statistics
      const totalUsageDays = quilt.usagePeriods.reduce((total, period) => {
        if (period.endDate) {
          const days = Math.ceil(
            (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return total + days;
        }
        return total;
      }, 0);

      const usageFrequency = quilt.usagePeriods.length;
      const lastUsedDate = quilt.usagePeriods[0]?.startDate || null;

      return {
        ...quilt,
        stats: {
          totalUsageDays,
          usageFrequency,
          lastUsedDate,
          averageUsageDuration: usageFrequency > 0 ? totalUsageDays / usageFrequency : 0,
        },
      };
    }),

  // Create new quilt
  create: publicProcedure
    .input(createQuiltSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if item number already exists
      const existingQuilt = await ctx.db.quilt.findUnique({
        where: { itemNumber: input.itemNumber },
      });

      if (existingQuilt) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Quilt with item number ${input.itemNumber} already exists`,
        });
      }

      return ctx.db.quilt.create({
        data: input,
        include: {
          currentUsage: true,
          usagePeriods: true,
          maintenanceLog: true,
        },
      });
    }),

  // Update quilt
  update: publicProcedure
    .input(updateQuiltSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if quilt exists
      const existingQuilt = await ctx.db.quilt.findUnique({
        where: { id },
      });

      if (!existingQuilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }

      // Check if item number is being changed and if it conflicts
      if (data.itemNumber && data.itemNumber !== existingQuilt.itemNumber) {
        const conflictingQuilt = await ctx.db.quilt.findUnique({
          where: { itemNumber: data.itemNumber },
        });

        if (conflictingQuilt) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Quilt with item number ${data.itemNumber} already exists`,
          });
        }
      }

      return ctx.db.quilt.update({
        where: { id },
        data,
        include: {
          currentUsage: true,
          usagePeriods: true,
          maintenanceLog: true,
        },
      });
    }),

  // Delete quilt
  delete: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const quilt = await ctx.db.quilt.findUnique({
        where: { id: input.id },
      });

      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }

      // Check if quilt is currently in use
      const currentUsage = await ctx.db.currentUsage.findUnique({
        where: { quiltId: input.id },
      });

      if (currentUsage) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete quilt that is currently in use',
        });
      }

      return ctx.db.quilt.delete({
        where: { id: input.id },
      });
    }),

  // Start using a quilt
  startUsage: publicProcedure
    .input(createCurrentUsageSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if quilt exists and is available
      const quilt = await ctx.db.quilt.findUnique({
        where: { id: input.quiltId },
        include: { currentUsage: true },
      });

      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }

      if (quilt.currentUsage) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Quilt is already in use',
        });
      }

      if (quilt.currentStatus !== QuiltStatus.AVAILABLE) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Quilt is not available for use',
        });
      }

      // Create current usage and update quilt status
      const [currentUsage] = await Promise.all([
        ctx.db.currentUsage.create({
          data: input,
        }),
        ctx.db.quilt.update({
          where: { id: input.quiltId },
          data: { currentStatus: QuiltStatus.IN_USE },
        }),
      ]);

      return currentUsage;
    }),

  // End current usage
  endUsage: publicProcedure
    .input(endCurrentUsageSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, endDate = new Date(), notes } = input;

      // Get current usage
      const currentUsage = await ctx.db.currentUsage.findUnique({
        where: { id },
      });

      if (!currentUsage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Current usage record not found',
        });
      }

      // Calculate duration
      const durationDays = Math.ceil(
        (endDate.getTime() - currentUsage.startedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Create usage period record and clean up current usage
      const [usagePeriod] = await Promise.all([
        ctx.db.usagePeriod.create({
          data: {
            quiltId: currentUsage.quiltId,
            startDate: currentUsage.startedAt,
            endDate,
            seasonUsed: getSeason(currentUsage.startedAt),
            usageType: currentUsage.usageType,
            durationDays,
            notes: notes || currentUsage.notes,
          },
        }),
        ctx.db.currentUsage.delete({
          where: { id },
        }),
        ctx.db.quilt.update({
          where: { id: currentUsage.quiltId },
          data: { currentStatus: QuiltStatus.AVAILABLE },
        }),
      ]);

      return usagePeriod;
    }),

  // Get current usage
  getCurrentUsage: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.currentUsage.findMany({
        include: {
          quilt: true,
        },
        orderBy: { startedAt: 'desc' },
      });
    }),

  // Get usage history for a quilt
  getUsageHistory: publicProcedure
    .input(z.object({ 
      quiltId: z.string().cuid(),
      take: z.number().int().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.usagePeriod.findMany({
        where: { quiltId: input.quiltId },
        orderBy: { startDate: 'desc' },
        take: input.take,
      });
    }),

  // Add maintenance record
  addMaintenanceRecord: publicProcedure
    .input(createMaintenanceRecordSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if quilt exists
      const quilt = await ctx.db.quilt.findUnique({
        where: { id: input.quiltId },
      });

      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }

      return ctx.db.maintenanceRecord.create({
        data: input,
      });
    }),

  // Get seasonal recommendations
  getSeasonalRecommendations: publicProcedure
    .input(z.object({ 
      season: z.nativeEnum(Season).optional(),
      availableOnly: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.season) where.season = input.season;
      if (input.availableOnly) where.currentStatus = QuiltStatus.AVAILABLE;

      const quilts = await ctx.db.quilt.findMany({
        where,
        include: {
          usagePeriods: {
            orderBy: { startDate: 'desc' },
            take: 3,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Calculate recommendation scores
      const recommendations = quilts.map((quilt) => {
        const usageCount = quilt.usagePeriods.length;
        const lastUsed = quilt.usagePeriods[0]?.startDate;
        const daysSinceUsed = lastUsed 
          ? Math.ceil((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
          : 365;

        // Simple scoring algorithm
        const score = (usageCount * 0.4) + ((365 - daysSinceUsed) / 365 * 0.6);

        return {
          quilt,
          score,
          reason: `Used ${usageCount} times, last used ${daysSinceUsed} days ago`,
        };
      });

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }),
});

// Helper function to determine season from date
function getSeason(date: Date): string {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 12 || month <= 2) return 'winter';
  if (month >= 6 && month <= 8) return 'summer';
  return 'spring_autumn';
}