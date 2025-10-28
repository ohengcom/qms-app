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
import { db } from '@/lib/neon';

export const quiltsRouter = createTRPCRouter({
  // Simple test endpoint
  test: publicProcedure
    .query(async () => {
      console.log('tRPC quilts.test: Simple test endpoint called');
      return { message: 'tRPC is working!', timestamp: new Date().toISOString() };
    }),

  // Get all quilts with filtering and pagination
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      try {
        console.log('tRPC quilts.getAll: Starting...');
        
        // Test database connection first
        console.log('tRPC quilts.getAll: Testing database connection...');
        const connectionTest = await db.testConnection();
        console.log('tRPC quilts.getAll: Connection test result:', connectionTest);
        
        // Get quilts from database with basic parameters
        console.log('tRPC quilts.getAll: Calling db.getQuilts...');
        const quilts = await db.getQuilts({
          limit: 20,
          offset: 0,
        });
        
        console.log('tRPC quilts.getAll: Quilts fetched:', quilts?.length || 0, 'records');
        if (quilts && quilts.length > 0) {
          console.log('tRPC quilts.getAll: First quilt:', quilts[0]);
          console.log('tRPC quilts.getAll: First quilt keys:', Object.keys(quilts[0]));
        }
        
        // Get total count
        console.log('tRPC quilts.getAll: Getting total count...');
        const total = await db.countQuilts();
        console.log('tRPC quilts.getAll: Total count:', total);

        const response = {
          quilts: quilts || [],
          total: total || 0,
          hasMore: false,
        };
        
        console.log('tRPC quilts.getAll: Final response structure:', {
          quiltsCount: response.quilts.length,
          total: response.total,
          hasMore: response.hasMore,
          firstQuiltId: response.quilts[0]?.id
        });
        
        return response;
      } catch (error) {
        console.error('tRPC quilts.getAll: ERROR occurred:', error);
        console.error('tRPC quilts.getAll: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        
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
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
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
        
        console.error('Error fetching quilt by ID:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch quilt',
        });
      }
    }),

  // Create new quilt
  create: publicProcedure
    .input(createQuiltSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement with Neon - temporarily throw error for build
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Create functionality not yet implemented with Neon',
      });
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
    .input(z.object({ id: z.string() }))
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
      try {
        const currentUsage = await db.getCurrentUsage();
        return currentUsage || [];
      } catch (error) {
        console.error('Error fetching current usage:', error);
        return [];
      }
    }),

  // Get usage history for a quilt - TODO: Implement with Neon
  getUsageHistory: publicProcedure
    .input(z.object({ 
      quiltId: z.string(),
      take: z.number().int().min(1).max(50).optional().default(10),
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
    .query(async ({ ctx }) => {
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