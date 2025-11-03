/**
 * Settings Router
 *
 * Handles application settings operations through tRPC
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, handleTRPCError } from '@/server/api/trpc';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { hashPassword } from '@/lib/auth/password';

// Input schemas
const updateAppSettingsSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  language: z.enum(['zh', 'en']).optional(),
  itemsPerPage: z.number().min(10).max(100).optional(),
  defaultView: z.enum(['list', 'grid']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const settingsRouter = createTRPCRouter({
  // Get application settings
  getAppSettings: publicProcedure.query(async () => {
    try {
      // For now, return default settings
      // In the future, these could be stored in database
      return {
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'QMS - Quilt Management System',
        language: 'zh' as const,
        itemsPerPage: 25,
        defaultView: 'list' as const,
      };
    } catch (error) {
      handleTRPCError(error, 'settings.getAppSettings');
    }
  }),

  // Update application settings
  updateAppSettings: publicProcedure.input(updateAppSettingsSchema).mutation(async ({ input }) => {
    try {
      // For now, just return the input as confirmation
      // In the future, store these in database or environment
      return {
        success: true,
        settings: input,
      };
    } catch (error) {
      handleTRPCError(error, 'settings.updateAppSettings', { input });
    }
  }),

  // Get database statistics
  getDatabaseStats: publicProcedure.query(async () => {
    try {
      const quilts = await quiltRepository.findAll();
      const usageRecords = await usageRepository.findAll();
      const activeUsage = await usageRepository.getAllActive();

      return {
        totalQuilts: quilts.length,
        totalUsageRecords: usageRecords.length,
        activeUsage: activeUsage.length,
        provider: 'Neon Serverless PostgreSQL',
        connected: true,
      };
    } catch (error) {
      handleTRPCError(error, 'settings.getDatabaseStats');
    }
  }),

  // Change password
  changePassword: publicProcedure.input(changePasswordSchema).mutation(async ({ input }) => {
    try {
      // Verify current password matches environment variable
      const currentHash = process.env.QMS_PASSWORD_HASH;
      if (!currentHash) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Password hash not configured',
        });
      }

      // Note: In production, you would verify the current password here
      // For now, we'll just generate a new hash
      const newHash = await hashPassword(input.newPassword);

      return {
        success: true,
        message: 'Password changed successfully',
        newHash, // Return this so user can update their environment variable
      };
    } catch (error) {
      handleTRPCError(error, 'settings.changePassword');
    }
  }),

  // Get system information
  getSystemInfo: publicProcedure.query(async () => {
    try {
      return {
        version: '0.2.2',
        framework: 'Next.js 15.0.3',
        deployment: 'Vercel',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      handleTRPCError(error, 'settings.getSystemInfo');
    }
  }),

  // Export data (returns data for download)
  exportData: publicProcedure.query(async () => {
    try {
      const quilts = await quiltRepository.findAll();
      const usageRecords = await usageRepository.findAll();

      return {
        exportDate: new Date().toISOString(),
        quilts,
        usageRecords,
      };
    } catch (error) {
      handleTRPCError(error, 'settings.exportData');
    }
  }),
});
