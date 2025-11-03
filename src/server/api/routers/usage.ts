/**
 * Usage Router
 *
 * Handles all usage record operations through tRPC
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, handleTRPCError } from '@/server/api/trpc';
import { usageRepository } from '@/lib/repositories/usage.repository';

// Input schemas
const createUsageRecordSchema = z.object({
  quiltId: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  usageType: z
    .enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION'])
    .default('REGULAR'),
  notes: z.string().optional(),
});

const updateUsageRecordSchema = z.object({
  id: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  usageType: z.enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION']).optional(),
  notes: z.string().optional(),
});

const endUsageRecordSchema = z.object({
  quiltId: z.string(),
  endDate: z.date(),
  notes: z.string().optional(),
});

export const usageRouter = createTRPCRouter({
  // Get all usage records with optional filtering
  getAll: publicProcedure
    .input(
      z
        .object({
          quiltId: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input = {} }) => {
      try {
        const records = await usageRepository.findAll(input);
        return records;
      } catch (error) {
        handleTRPCError(error, 'usage.getAll', { input });
      }
    }),

  // Get usage record by ID
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const record = await usageRepository.findById(input.id);
      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usage record not found',
        });
      }
      return record;
    } catch (error) {
      handleTRPCError(error, 'usage.getById', { id: input.id });
    }
  }),

  // Get usage records for a specific quilt
  getByQuiltId: publicProcedure.input(z.object({ quiltId: z.string() })).query(async ({ input }) => {
    try {
      const records = await usageRepository.findByQuiltId(input.quiltId);
      return records;
    } catch (error) {
      handleTRPCError(error, 'usage.getByQuiltId', { quiltId: input.quiltId });
    }
  }),

  // Get active usage record for a quilt
  getActive: publicProcedure.input(z.object({ quiltId: z.string() })).query(async ({ input }) => {
    try {
      const record = await usageRepository.getActiveUsageRecord(input.quiltId);
      return record;
    } catch (error) {
      handleTRPCError(error, 'usage.getActive', { quiltId: input.quiltId });
    }
  }),

  // Get all active usage records
  getAllActive: publicProcedure.query(async () => {
    try {
      const records = await usageRepository.getAllActive();
      return records;
    } catch (error) {
      handleTRPCError(error, 'usage.getAllActive');
    }
  }),

  // Create a new usage record
  create: publicProcedure.input(createUsageRecordSchema).mutation(async ({ input }) => {
    try {
      const record = await usageRepository.createUsageRecord(input);
      return record;
    } catch (error) {
      handleTRPCError(error, 'usage.create', { input });
    }
  }),

  // Update a usage record
  update: publicProcedure.input(updateUsageRecordSchema).mutation(async ({ input }) => {
    try {
      const { id, ...data } = input;
      const record = await usageRepository.update(id, data);
      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usage record not found',
        });
      }
      return record;
    } catch (error) {
      handleTRPCError(error, 'usage.update', { id: input.id });
    }
  }),

  // End an active usage record
  end: publicProcedure.input(endUsageRecordSchema).mutation(async ({ input }) => {
    try {
      const record = await usageRepository.endUsageRecord(
        input.quiltId,
        input.endDate,
        input.notes
      );
      if (!record) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active usage record found for this quilt',
        });
      }
      return record;
    } catch (error) {
      handleTRPCError(error, 'usage.end', { quiltId: input.quiltId });
    }
  }),

  // Delete a usage record
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      const success = await usageRepository.delete(input.id);
      if (!success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usage record not found',
        });
      }
      return { success: true };
    } catch (error) {
      handleTRPCError(error, 'usage.delete', { id: input.id });
    }
  }),

  // Get usage statistics for a quilt
  getStats: publicProcedure.input(z.object({ quiltId: z.string() })).query(async ({ input }) => {
    try {
      const stats = await usageRepository.getUsageStats(input.quiltId);
      return stats;
    } catch (error) {
      handleTRPCError(error, 'usage.getStats', { quiltId: input.quiltId });
    }
  }),

  // Get overall usage statistics
  getOverallStats: publicProcedure.query(async () => {
    try {
      const allRecords = await usageRepository.findAll();
      const activeRecords = await usageRepository.getAllActive();
      
      return {
        total: allRecords.length,
        active: activeRecords.length,
        completed: allRecords.length - activeRecords.length,
      };
    } catch (error) {
      handleTRPCError(error, 'usage.getOverallStats');
    }
  }),
});
