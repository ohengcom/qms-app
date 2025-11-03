import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, handleTRPCError } from '@/server/api/trpc';
import {
  createQuiltSchema,
  updateQuiltSchema,
  createCurrentUsageSchema,
  endCurrentUsageSchema,
  createMaintenanceRecordSchema,
  quiltSearchSchema,
} from '@/lib/validations/quilt';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { usageRepository } from '@/lib/repositories/usage.repository';

export const quiltsRouter = createTRPCRouter({
  // Simple test endpoint
  test: publicProcedure.query(async () => {
    return { message: 'tRPC is working!', timestamp: new Date().toISOString() };
  }),

  // Get all quilts with filtering and pagination
  getAll: publicProcedure
    .input(quiltSearchSchema.optional())
    .query(async ({ input }) => {
      try {
        console.log('[quilts.getAll] Starting query with input:', JSON.stringify(input));
        
        // Transform the nested structure to flat structure for repository
        const searchParams = input || {
          filters: {},
          sortBy: 'itemNumber' as const,
          sortOrder: 'asc' as const,
          skip: 0,
          take: 20,
        };
        
        console.log('[quilts.getAll] Search params:', JSON.stringify(searchParams));
        
        const filters = searchParams.filters || {};
        const flatParams = {
          season: filters.season,
          status: filters.status,
          location: filters.location,
          brand: filters.brand,
          search: filters.search,
          minWeight: filters.minWeight,
          maxWeight: filters.maxWeight,
          limit: searchParams.take || 20,
          offset: searchParams.skip || 0,
          sortBy: searchParams.sortBy || 'itemNumber',
          sortOrder: searchParams.sortOrder || 'asc',
        };

        console.log('[quilts.getAll] Calling repository with:', JSON.stringify(flatParams));
        const quilts = await quiltRepository.findAll(flatParams as any);
        console.log('[quilts.getAll] Found quilts:', quilts.length);
        
        const total = await quiltRepository.count(flatParams as any);
        console.log('[quilts.getAll] Total count:', total);

        const result = {
          quilts,
          total,
          hasMore: flatParams.offset + quilts.length < total,
        };
        
        console.log('[quilts.getAll] Returning result with', result.quilts.length, 'quilts');
        return result;
      } catch (error) {
        console.error('[quilts.getAll] Error:', error);
        handleTRPCError(error, 'quilts.getAll', { input });
      }
    }),

  // Get quilt by ID with full details
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const quilt = await quiltRepository.findById(input.id);
      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      return quilt;
    } catch (error) {
      handleTRPCError(error, 'quilts.getById', { id: input.id });
    }
  }),

  // Create new quilt
  create: publicProcedure.input(createQuiltSchema).mutation(async ({ input }) => {
    try {
      const quilt = await quiltRepository.create(input);
      return quilt;
    } catch (error) {
      handleTRPCError(error, 'quilts.create', { input });
    }
  }),

  // Update quilt
  update: publicProcedure.input(updateQuiltSchema).mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const quilt = await quiltRepository.update(id, data);
      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      return quilt;
    } catch (error) {
      handleTRPCError(error, 'quilts.update', { id: input.id });
    }
  }),

  // Delete quilt
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      const success = await quiltRepository.delete(input.id);
      if (!success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      return { success: true };
    } catch (error) {
      handleTRPCError(error, 'quilts.delete', { id: input.id });
    }
  }),

  // Update quilt status (quick status change)
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['AVAILABLE', 'IN_USE', 'STORAGE', 'MAINTENANCE']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const quilt = await quiltRepository.updateStatus(input.id, input.status as any);
        if (!quilt) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Quilt not found',
          });
        }
        return quilt;
      } catch (error) {
        handleTRPCError(error, 'quilts.updateStatus', {
          id: input.id,
          status: input.status,
        });
      }
    }),

  // Start using a quilt - TODO: Implement with Neon
  startUsage: publicProcedure.input(createCurrentUsageSchema).mutation(async () => {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Start usage functionality not yet implemented with Neon',
    });
  }),

  // End current usage - TODO: Implement with Neon
  endUsage: publicProcedure.input(endCurrentUsageSchema).mutation(async () => {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'End usage functionality not yet implemented with Neon',
    });
  }),

  // Get current usage
  getCurrentUsage: publicProcedure.query(async () => {
    try {
      const activeUsage = await usageRepository.getAllActive();
      return activeUsage;
    } catch (error) {
      handleTRPCError(error, 'quilts.getCurrentUsage');
    }
  }),

  // Get usage history for a quilt - TODO: Implement with Neon
  getUsageHistory: publicProcedure
    .input(
      z.object({
        quiltId: z.string(),
        take: z.number().int().min(1).max(50).optional().default(10),
      })
    )
    .query(async () => {
      // Return empty array for now
      return [];
    }),

  // Add maintenance record - TODO: Implement with Neon
  addMaintenanceRecord: publicProcedure
    .input(createMaintenanceRecordSchema)
    .mutation(async () => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Maintenance record functionality not yet implemented with Neon',
      });
    }),

  // Get seasonal recommendations - TODO: Implement with Neon
  getSeasonalRecommendations: publicProcedure.query(async () => {
    // Return empty array for now
    return [];
  }),
});
