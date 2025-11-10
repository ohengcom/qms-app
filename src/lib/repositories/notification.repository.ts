/**
 * Notification Repository
 *
 * Handles database operations for notifications
 */

import { sql } from '@/lib/neon';
import { dbLogger } from '@/lib/logger';
import { BaseRepositoryImpl } from './base.repository';
import type { Notification, CreateNotificationInput, NotificationFilter } from '@/types/notification';

export interface NotificationRow {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  quilt_id: string | null;
  is_read: boolean;
  action_url: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type as Notification['type'],
    priority: row.priority as Notification['priority'],
    title: row.title,
    message: row.message,
    quiltId: row.quilt_id || undefined,
    isRead: row.is_read,
    actionUrl: row.action_url || undefined,
    metadata: row.metadata || {},
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class NotificationRepository extends BaseRepositoryImpl<NotificationRow, Notification> {
  protected tableName = 'notifications';

  protected rowToModel(row: NotificationRow): Notification {
    return rowToNotification(row);
  }

  protected modelToRow(model: Partial<Notification>): Partial<NotificationRow> {
    return {
      id: model.id,
      type: model.type,
      priority: model.priority,
      title: model.title,
      message: model.message,
      quilt_id: model.quiltId || null,
      is_read: model.isRead,
      action_url: model.actionUrl || null,
      metadata: model.metadata || {},
      created_at: model.createdAt?.toISOString(),
      updated_at: model.updatedAt?.toISOString(),
    };
  }

  /**
   * Create a new notification
   */
  async create(input: CreateNotificationInput): Promise<Notification> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          INSERT INTO notifications (
            type, priority, title, message, quilt_id, action_url, metadata
          )
          VALUES (
            ${input.type},
            ${input.priority},
            ${input.title},
            ${input.message},
            ${input.quiltId || null},
            ${input.actionUrl || null},
            ${JSON.stringify(input.metadata || {})}
          )
          RETURNING *
        `;

        return this.rowToModel(rows[0] as NotificationRow);
      },
      'createNotification',
      { input }
    );
  }

  /**
   * Get all notifications with optional filters
   */
  async findAll(filter?: NotificationFilter): Promise<Notification[]> {
    return this.executeQuery(
      async () => {
        const limit = filter?.limit || 20;
        const offset = filter?.offset || 0;

        // Build query using Neon's tagged template syntax
        let rows: any[];

        if (filter?.isRead !== undefined && filter?.type && filter?.priority) {
          rows = await sql`
            SELECT * FROM notifications
            WHERE is_read = ${filter.isRead}
              AND type = ${filter.type}
              AND priority = ${filter.priority}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else if (filter?.isRead !== undefined && filter?.type) {
          rows = await sql`
            SELECT * FROM notifications
            WHERE is_read = ${filter.isRead}
              AND type = ${filter.type}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else if (filter?.isRead !== undefined && filter?.priority) {
          rows = await sql`
            SELECT * FROM notifications
            WHERE is_read = ${filter.isRead}
              AND priority = ${filter.priority}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else if (filter?.type && filter?.priority) {
          rows = await sql`
            SELECT * FROM notifications
            WHERE type = ${filter.type}
              AND priority = ${filter.priority}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else if (filter?.isRead !== undefined) {
          rows = await sql`
            SELECT * FROM notifications
            WHERE is_read = ${filter.isRead}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else if (filter?.type) {
          rows = await sql`
            SELECT * FROM notifications
            WHERE type = ${filter.type}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else if (filter?.priority) {
          rows = await sql`
            SELECT * FROM notifications
            WHERE priority = ${filter.priority}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        } else {
          rows = await sql`
            SELECT * FROM notifications
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;
        }

        return rows.map((row) => this.rowToModel(row as NotificationRow));
      },
      'findAllNotifications',
      { filter }
    );
  }

  /**
   * Get notification by ID
   */
  async findById(id: string): Promise<Notification | null> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM notifications
          WHERE id = ${id}
          LIMIT 1
        `;

        if (rows.length === 0) {
          return null;
        }

        return this.rowToModel(rows[0] as NotificationRow);
      },
      'findNotificationById',
      { id }
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification | null> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          UPDATE notifications
          SET is_read = true, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;

        if (rows.length === 0) {
          return null;
        }

        return this.rowToModel(rows[0] as NotificationRow);
      },
      'markNotificationAsRead',
      { id }
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(type?: string): Promise<number> {
    return this.executeQuery(
      async () => {
        let result;
        if (type) {
          result = await sql`
            UPDATE notifications
            SET is_read = true, updated_at = CURRENT_TIMESTAMP
            WHERE is_read = false AND type = ${type}
            RETURNING id
          `;
        } else {
          result = await sql`
            UPDATE notifications
            SET is_read = true, updated_at = CURRENT_TIMESTAMP
            WHERE is_read = false
            RETURNING id
          `;
        }

        return result.length;
      },
      'markAllNotificationsAsRead',
      { type }
    );
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          DELETE FROM notifications
          WHERE id = ${id}
          RETURNING id
        `;

        return result.length > 0;
      },
      'deleteNotification',
      { id }
    );
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT COUNT(*) as count
          FROM notifications
          WHERE is_read = false
        `;

        return parseInt(rows[0].count as string, 10);
      },
      'getUnreadNotificationCount'
    );
  }

  /**
   * Delete old read notifications (older than specified days)
   */
  async deleteOldReadNotifications(daysOld: number = 30): Promise<number> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          DELETE FROM notifications
          WHERE is_read = true
          AND created_at < NOW() - INTERVAL '${daysOld} days'
          RETURNING id
        `;

        return result.length;
      },
      'deleteOldReadNotifications',
      { daysOld }
    );
  }

  /**
   * Check if a similar notification already exists (to avoid duplicates)
   */
  async findSimilar(
    type: string,
    quiltId: string | undefined,
    hoursWindow: number = 24
  ): Promise<Notification | null> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM notifications
          WHERE type = ${type}
          AND quilt_id = ${quiltId || null}
          AND created_at > NOW() - INTERVAL '${hoursWindow} hours'
          ORDER BY created_at DESC
          LIMIT 1
        `;

        if (rows.length === 0) {
          return null;
        }

        return this.rowToModel(rows[0] as NotificationRow);
      },
      'findSimilarNotification',
      { type, quiltId, hoursWindow }
    );
  }
}

// Export singleton instance
export const notificationRepository = new NotificationRepository();
