/**
 * System Settings Repository
 *
 * Handles database operations for system-wide settings
 */

import { sql } from '@/lib/neon';
import { dbLogger } from '@/lib/logger';
import { BaseRepositoryImpl } from './base.repository';

export interface SystemSettingRow {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function rowToSystemSetting(row: SystemSettingRow): SystemSetting {
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    description: row.description,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SystemSettingsRepository extends BaseRepositoryImpl<SystemSettingRow, SystemSetting> {
  protected tableName = 'system_settings';

  protected rowToModel(row: SystemSettingRow): SystemSetting {
    return rowToSystemSetting(row);
  }

  protected modelToRow(model: Partial<SystemSetting>): Partial<SystemSettingRow> {
    return {
      id: model.id,
      key: model.key,
      value: model.value,
      description: model.description,
      created_at: model.createdAt?.toISOString(),
      updated_at: model.updatedAt?.toISOString(),
    };
  }

  /**
   * Get a setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    return this.executeQuery(
      async () => {
        const rows = (await sql`
          SELECT value FROM system_settings
          WHERE key = ${key}
          LIMIT 1
        `) as { value: string }[];

        return rows[0]?.value || null;
      },
      'getSetting',
      { key }
    );
  }

  /**
   * Set a setting value (insert or update)
   */
  async setSetting(key: string, value: string, description?: string): Promise<void> {
    return this.executeQuery(
      async () => {
        const now = new Date().toISOString();

        // First ensure uuid extension is available
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        await sql`
          INSERT INTO system_settings (id, key, value, description, created_at, updated_at)
          VALUES (uuid_generate_v4(), ${key}, ${value}, ${description || null}, ${now}, ${now})
          ON CONFLICT (key) 
          DO UPDATE SET 
            value = ${value},
            description = COALESCE(${description || null}, system_settings.description),
            updated_at = ${now}
        `;

        dbLogger.info('Setting updated', { key });
      },
      'setSetting',
      { key }
    );
  }

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<Record<string, string>> {
    return this.executeQuery(async () => {
      const rows = (await sql`
          SELECT key, value FROM system_settings
        `) as { key: string; value: string }[];

      const settings: Record<string, string> = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });

      return settings;
    }, 'getAllSettings');
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          DELETE FROM system_settings
          WHERE key = ${key}
          RETURNING id
        `;

        const success = result.length > 0;
        if (success) {
          dbLogger.info('Setting deleted', { key });
        }
        return success;
      },
      'deleteSetting',
      { key }
    );
  }

  /**
   * Get password hash
   */
  async getPasswordHash(): Promise<string | null> {
    return this.getSetting('password_hash');
  }

  /**
   * Update password hash
   */
  async updatePasswordHash(hash: string): Promise<void> {
    return this.setSetting('password_hash', hash, 'Bcrypt hash of the admin password');
  }

  /**
   * Get app name
   */
  async getAppName(): Promise<string> {
    const name = await this.getSetting('app_name');
    return name || 'QMS - Quilt Management System';
  }

  /**
   * Update app name
   */
  async updateAppName(name: string): Promise<void> {
    return this.setSetting('app_name', name, 'Application display name');
  }

  /**
   * Get double click action
   */
  async getDoubleClickAction(): Promise<string | null> {
    return this.getSetting('double_click_action');
  }

  /**
   * Update double click action
   */
  async updateDoubleClickAction(action: 'none' | 'view' | 'status' | 'edit'): Promise<void> {
    return this.setSetting('double_click_action', action, 'Double click behavior in quilt list');
  }

  /**
   * Get usage double click action
   */
  async getUsageDoubleClickAction(): Promise<string | null> {
    return this.getSetting('usage_double_click_action');
  }

  /**
   * Update usage double click action
   */
  async updateUsageDoubleClickAction(action: 'none' | 'view' | 'edit'): Promise<void> {
    return this.setSetting(
      'usage_double_click_action',
      action,
      'Double click behavior in usage record list'
    );
  }
}

// Export singleton instance
export const systemSettingsRepository = new SystemSettingsRepository();
