/**
 * Notification System Types
 * Defines types for the notification system
 */

export type NotificationType = 
  | 'weather_change'
  | 'maintenance_reminder'
  | 'disposal_suggestion';

export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  quiltId?: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  quiltId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}
