import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, handleTRPCError } from '@/server/api/trpc';
import {
  createQuiltSchema,
  updateQuiltSchema,
  createCurrentUsageSchema,
  endCurrentUsageSchema,
  createMaintenanceRecordSchema,
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
    .input(
      z
        .object({
          season: z.enum(['WINTER', 'SPRING_AUTUMN', 'SUMMER']).optional(),
          status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'STORAGE']).optional(),
          location: z.string().optional(),
          brand: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input = {} }) => {
      try {
        const quilts = await quiltRepository.findAll(input as any);
        const total = await quiltRepository.count(input as any);

        return {
          quilts,
          total,
          hasMore: (input.offset || 0) + quilts.length < total,
        };
      } catch (error) {
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
