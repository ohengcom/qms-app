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
import { systemSettingsRepository } from '@/lib/repositories/system-settings.repository';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

// Input schemas
const updateAppSettingsSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  language: z.enum(['zh', 'en']).optional(),
  itemsPerPage: z.number().min(10).max(100).optional(),
  defaultView: z.enum(['list', 'grid']).optional(),
  doubleClickAction: z.enum(['none', 'view', 'status', 'edit']).optional(),
  usageDoubleClickAction: z.enum(['none', 'view', 'edit']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const settingsRouter = createTRPCRouter({
  // Get application settings
  getAppSettings: publicProcedure.query(async () => {
    try {
      const appName = await systemSettingsRepository.getAppName();
      const doubleClickAction = await systemSettingsRepository.getDoubleClickAction();
      const usageDoubleClickAction = await systemSettingsRepository.getUsageDoubleClickAction();

      return {
        appName,
        language: 'zh' as const,
        itemsPerPage: 25,
        defaultView: 'list' as const,
        doubleClickAction: doubleClickAction || 'status',
        usageDoubleClickAction: usageDoubleClickAction || 'view',
      };
    } catch (error) {
      handleTRPCError(error, 'settings.getAppSettings');
    }
  }),

  // Update application settings
  updateAppSettings: publicProcedure.input(updateAppSettingsSchema).mutation(async ({ input }) => {
    try {
      // Update app name in database if provided
      if (input.appName) {
        await systemSettingsRepository.updateAppName(input.appName);
      }

      // Update double click action if provided
      if (input.doubleClickAction) {
        await systemSettingsRepository.updateDoubleClickAction(input.doubleClickAction);
      }

      // Update usage double click action if provided
      if (input.usageDoubleClickAction) {
        await systemSettingsRepository.updateUsageDoubleClickAction(input.usageDoubleClickAction);
      }

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
      // Get current password hash from database (fallback to environment)
      let currentHash = await systemSettingsRepository.getPasswordHash();
      if (!currentHash) {
        currentHash = process.env.QMS_PASSWORD_HASH || null;
      }

      if (!currentHash) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Password hash not configured',
        });
      }

      // Verify current password
      const isValid = await verifyPassword(input.currentPassword, currentHash);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        });
      }

      // Generate new hash
      const newHash = await hashPassword(input.newPassword);

      // Save new hash to database
      await systemSettingsRepository.updatePasswordHash(newHash);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      handleTRPCError(error, 'settings.changePassword');
    }
  }),

  // Get system information
  getSystemInfo: publicProcedure.query(async () => {
    try {
      return {
        version: '0.5.0',
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
