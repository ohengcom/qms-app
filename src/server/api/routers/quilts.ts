import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import {
  createQuiltSchema,
  updateQuiltSchema,
  createCurrentUsageSchema,
  endCurrentUsageSchema,
  createMaintenanceRecordSchema,
} from '@/lib/validations/quilt';
import { db } from '@/lib/neon';
import { apiLogger } from '@/lib/logger';

export const quiltsRouter = createTRPCRouter({
  // Simple test endpoint
  test: publicProcedure.query(async () => {
    apiLogger.debug('tRPC quilts.test called');
    return { message: 'tRPC is working!', timestamp: new Date().toISOString() };
  }),

  // Get all quilts with filtering and pagination
  getAll: publicProcedure.query(async () => {
    try {
      apiLogger.debug('tRPC quilts.getAll starting');

      // Test database connection first
      const connectionTest = await db.testConnection();
      apiLogger.debug('Database connection test', { success: connectionTest });

      // Get quilts from database with basic parameters
      const quilts = await db.getQuilts({
        limit: 20,
        offset: 0,
      });

      apiLogger.debug('Quilts fetched', { 
        count: quilts?.length || 0,
        firstQuiltId: quilts[0]?.id 
      });

      // Get total count
      const total = await db.countQuilts();
      apiLogger.debug('Total count retrieved', { total });

      const response = {
        quilts: quilts || [],
        total: total || 0,
        hasMore: false,
      };

      return response;
    } catch (error) {
      apiLogger.error('tRPC quilts.getAll failed', error as Error);

      // Return empty data with error info instead of throwing error to prevent UI crashes
      return {
        quilts: [],
        total: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }),

  // Get quilt by ID with full details
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const quilt = await db.getQuiltById(input.id);

      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }

      return quilt;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      apiLogger.error('Error fetching quilt by ID', error as Error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch quilt',
      });
    }
  }),

  // Create new quilt
  create: publicProcedure.input(createQuiltSchema).mutation(async ({ input }) => {
    try {
      apiLogger.info('Creating quilt', { data: input });
      const quilt = await db.createQuilt(input);
      apiLogger.info('Quilt created successfully', { id: quilt.id });
      return quilt;
    } catch (error) {
      apiLogger.error('Error creating quilt', error as Error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create quilt',
      });
    }
  }),

  // Update quilt
  update: publicProcedure.input(updateQuiltSchema).mutation(async ({ input }) => {
    try {
      apiLogger.info('Updating quilt', { id: input.id });
      const quilt = await db.updateQuilt(input.id, input);
      if (!quilt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      apiLogger.info('Quilt updated successfully', { id: input.id });
      return quilt;
    } catch (error) {
      apiLogger.error('Error updating quilt', error as Error, { id: input.id });
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update quilt',
      });
    }
  }),

  // Delete quilt
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      apiLogger.info('Deleting quilt', { id: input.id });
      const success = await db.deleteQuilt(input.id);
      if (!success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quilt not found',
        });
      }
      apiLogger.info('Quilt deleted successfully', { id: input.id });
      return { success: true };
    } catch (error) {
      apiLogger.error('Error deleting quilt', error as Error, { id: input.id });
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete quilt',
      });
    }
  }),

  // Update quilt status (quick status change)
  updateStatus: publicProcedure
    .input(z.object({ 
      id: z.string(), 
      status: z.enum(['AVAILABLE', 'IN_USE', 'STORAGE', 'MAINTENANCE']) 
    }))
    .mutation(async ({ input }) => {
      try {
        apiLogger.info('Updating quilt status', { id: input.id, status: input.status });
        const quilt = await db.updateQuiltStatus(input.id, input.status);
        if (!quilt) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Quilt not found',
          });
        }
        apiLogger.info('Status updated successfully', { id: input.id, status: input.status });
        return quilt;
      } catch (error) {
        apiLogger.error('Error updating status', error as Error, { id: input.id });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update quilt status',
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
      const currentUsage = await db.getCurrentUsage();
      return currentUsage || [];
    } catch (error) {
      apiLogger.error('Error fetching current usage', error as Error);
      return [];
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
