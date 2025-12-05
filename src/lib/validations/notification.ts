/**
 * Notification Validation Schemas
 * Zod schemas for notification-related operations
 */

import { z } from 'zod';

export const notificationTypeSchema = z.enum([
  'weather_change',
  'maintenance_reminder',
  'disposal_suggestion',
]);

export const notificationPrioritySchema = z.enum(['high', 'medium', 'low']);

export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  priority: notificationPrioritySchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  quiltId: z.string().uuid().optional(),
  actionUrl: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateNotificationSchema = z.object({
  id: z.string().uuid(),
  isRead: z.boolean().optional(),
});

export const notificationFilterSchema = z.object({
  isRead: z.boolean().optional(),
  type: notificationTypeSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const deleteNotificationSchema = z.object({
  id: z.string().uuid(),
});

export const markAllAsReadSchema = z.object({
  type: notificationTypeSchema.optional(),
});
