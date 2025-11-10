/**
 * Notifications tRPC Router
 * 
 * Handles all notification-related API operations
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, handleTRPCError } from '@/server/api/trpc';
import { notificationRepository } from '@/lib/repositories/notification.repository';
import {
  createNotificationSchema,
  updateNotificationSchema,
  notificationFilterSchema,
  deleteNotificationSchema,
  markAllAsReadSchema,
} from '@/lib/validations/notification';
import {
  runAllNotificationChecks,
  checkMaintenanceReminders,
  checkDisposalSuggestions,
  cleanupOldNotifications,
} from '@/lib/notification-checker';

export const notificationsRouter = createTRPCRouter({
  /**
   * Get all notifications with optional filtering
   */
  getAll: publicProcedure
    .input(notificationFilterSchema.optional())
    .query(async ({ input }) => {
      try {
        const notifications = await notificationRepository.findAll(input);
        return notifications;
      } catch (error) {
        return handleTRPCError(error, 'Failed to fetch notifications');
      }
    }),

  /**
   * Get notification by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const notification = await notificationRepository.findById(input.id);
        if (!notification) {
          throw new Error('Notification not found');
        }
        return notification;
      } catch (error) {
        return handleTRPCError(error, 'Failed to fetch notification');
      }
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: publicProcedure.query(async () => {
    try {
      const count = await notificationRepository.getUnreadCount();
      return { count };
    } catch (error) {
      return handleTRPCError(error, 'Failed to get unread count');
    }
  }),

  /**
   * Create a new notification
   */
  create: publicProcedure
    .input(createNotificationSchema)
    .mutation(async ({ input }) => {
      try {
        const notification = await notificationRepository.create(input);
        return notification;
      } catch (error) {
        return handleTRPCError(error, 'Failed to create notification');
      }
    }),

  /**
   * Mark notification as read
   */
  markAsRead: publicProcedure
    .input(updateNotificationSchema)
    .mutation(async ({ input }) => {
      try {
        const notification = await notificationRepository.markAsRead(input.id);
        if (!notification) {
          throw new Error('Notification not found');
        }
        return notification;
      } catch (error) {
        return handleTRPCError(error, 'Failed to mark notification as read');
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: publicProcedure
    .input(markAllAsReadSchema.optional())
    .mutation(async ({ input }) => {
      try {
        const count = await notificationRepository.markAllAsRead(input?.type);
        return { count };
      } catch (error) {
        return handleTRPCError(error, 'Failed to mark all as read');
      }
    }),

  /**
   * Delete a notification
   */
  delete: publicProcedure
    .input(deleteNotificationSchema)
    .mutation(async ({ input }) => {
      try {
        const success = await notificationRepository.delete(input.id);
        if (!success) {
          throw new Error('Notification not found');
        }
        return { success };
      } catch (error) {
        return handleTRPCError(error, 'Failed to delete notification');
      }
    }),

  /**
   * Run all notification checks
   * This will check for:
   * - Maintenance reminders (quilts used > 30 days)
   * - Disposal suggestions (quilts not used for 365 days)
   */
  checkAll: publicProcedure.mutation(async () => {
    try {
      // Note: Weather data would need to be fetched from a weather API
      // For now, we'll run checks without weather data
      const results = await runAllNotificationChecks();
      return results;
    } catch (error) {
      return handleTRPCError(error, 'Failed to run notification checks');
    }
  }),

  /**
   * Check maintenance reminders only
   */
  checkMaintenance: publicProcedure.mutation(async () => {
    try {
      const count = await checkMaintenanceReminders();
      return { count };
    } catch (error) {
      return handleTRPCError(error, 'Failed to check maintenance reminders');
    }
  }),

  /**
   * Check disposal suggestions only
   */
  checkDisposal: publicProcedure.mutation(async () => {
    try {
      const count = await checkDisposalSuggestions();
      return { count };
    } catch (error) {
      return handleTRPCError(error, 'Failed to check disposal suggestions');
    }
  }),

  /**
   * Clean up old read notifications
   */
  cleanup: publicProcedure
    .input(z.object({ daysOld: z.number().min(1).default(30) }).optional())
    .mutation(async ({ input }) => {
      try {
        const count = await cleanupOldNotifications(input?.daysOld);
        return { count };
      } catch (error) {
        return handleTRPCError(error, 'Failed to cleanup old notifications');
      }
    }),
});
