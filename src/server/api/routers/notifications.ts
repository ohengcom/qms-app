/**
 * Notifications tRPC Router
 *
 * Simplified notification system - handles basic notification operations
 * Complex rule engine removed as it was over-engineered for a family app
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

export const notificationsRouter = createTRPCRouter({
  /**
   * Get all notifications with optional filtering
   */
  getAll: publicProcedure.input(notificationFilterSchema.optional()).query(async ({ input }) => {
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
  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
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
  create: publicProcedure.input(createNotificationSchema).mutation(async ({ input }) => {
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
  markAsRead: publicProcedure.input(updateNotificationSchema).mutation(async ({ input }) => {
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
  delete: publicProcedure.input(deleteNotificationSchema).mutation(async ({ input }) => {
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
   * Clean up old read notifications
   */
  cleanup: publicProcedure
    .input(z.object({ daysOld: z.number().min(1).default(30) }).optional())
    .mutation(async ({ input }) => {
      try {
        const daysOld = input?.daysOld || 30;
        const deletedCount = await notificationRepository.deleteOldReadNotifications(daysOld);
        return { count: deletedCount };
      } catch (error) {
        return handleTRPCError(error, 'Failed to cleanup old notifications');
      }
    }),
});
