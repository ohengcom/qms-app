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
  QuiltStatus,
  Season,
  UsageType,
} from '@/lib/validations/quilt';
// Removed direct db import - using ctx.db instead

export const quiltsRouter = createTRPCRouter({
  // Get all quilts with filtering and pagination
  getAll: publicProcedure
    .input(quiltSearchSchema)
    .query(async ({ ctx, input }) => {
      const { filters, sortBy, sortOrder, skip, take } = input;
      
      // Build filter object for Neon query
      const queryFilters: any = {};
      
      if (filters.season) queryFilters.season = filters.season;
      if (filters.status) queryFilters.status = filters.status;
      if (filters.location) queryFilters.location = filters.location;
      if (filters.brand) queryFilters.brand = filters.brand;
      if (filters.search) queryFilters.search = filters.search;
      
      queryFilters.limit = take;
      queryFilters.offset = skip;

      const [quilts, total] = await Promise.all([
        ctx.db.getQuilts(queryFilters),
        ctx.db.countQuilts(queryFilters),
      ]);

      return {
        quilts,
        total,
        hasMore: skip + take < total,
      };
    }),

  // Get quilt by ID with full details
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const quilt = await ctx.db.getQuiltById(input.id);

      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }

      return quilt;
    }),

  // Create new quilt
  create: publicProcedure
    .input(createQuiltSchema)
    .mutation(async ({ ctx, input }) => {
      // For now, skip the duplicate check and just create the quilt
      // We can add this validation back later
      return ctx.db.createQuilt(input);
    }),

  // Update quilt - TODO: Implement with Neon
  update: publicProcedure
    .input(updateQuiltSchema)
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Update functionality not yet implemented with Neon',
      });
    }),

  // Delete quilt - TODO: Implement with Neon
  delete: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Delete functionality not yet implemented with Neon',
      });
    }),

  // Start using a quilt - TODO: Implement with Neon
  startUsage: publicProcedure
    .input(createCurrentUsageSchema)
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Start usage functionality not yet implemented with Neon',
      });
    }),

  // End current usage - TODO: Implement with Neon
  endUsage: publicProcedure
    .input(endCurrentUsageSchema)
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'End usage functionality not yet implemented with Neon',
      });
    }),

  // Get current usage
  getCurrentUsage: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.getCurrentUsage();
    }),

  // Get usage history for a quilt - TODO: Implement with Neon
  getUsageHistory: publicProcedure
    .input(z.object({ 
      quiltId: z.string().cuid(),
      take: z.number().int().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // Return empty array for now
      return [];
    }),

  // Add maintenance record - TODO: Implement with Neon
  addMaintenanceRecord: publicProcedure
    .input(createMaintenanceRecordSchema)
    .mutation(async ({ ctx, input }) => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Maintenance record functionality not yet implemented with Neon',
      });
    }),

  // Get seasonal recommendations - TODO: Implement with Neon
  getSeasonalRecommendations: publicProcedure
    .input(z.object({ 
      season: z.nativeEnum(Season).optional(),
      availableOnly: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      // Return empty array for now
      return [];
    }),
});

// Helper function to determine season from date
function getSeason(date: Date): string {
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 12 || month <= 2) return 'winter';
  if (month >= 6 && month <= 8) return 'summer';
  return 'spring_autumn';
}