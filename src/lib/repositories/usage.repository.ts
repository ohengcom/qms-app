/**
 * Usage Repository
 * 
 * Handles all database operations for usage records with type safety and proper error handling.
 */

import { sql } from '@/lib/neon';
import { dbLogger } from '@/lib/logger';
import { BaseRepositoryImpl } from './base.repository';
import {
  UsageRecord,
  UsageRecordRow,
  rowToUsageRecord,
  usageRecordToRow,
} from '@/lib/database/types';
import { UsageType } from '@/lib/validations/quilt';

export interface CreateUsageRecordData {
  quiltId: string;
  startDate: Date;
  endDate?: Date | null;
  usageType?: UsageType;
  notes?: string | null;
}

export interface UpdateUsageRecordData {
  startDate?: Date;
  endDate?: Date | null;
  usageType?: UsageType;
  notes?: string | null;
}

export class UsageRepository extends BaseRepositoryImpl<UsageRecordRow, UsageRecord> {
  protected tableName = 'usage_records';

  protected rowToModel(row: UsageRecordRow): UsageRecord {
    return rowToUsageRecord(row);
  }

  protected modelToRow(model: Partial<UsageRecord>): Partial<UsageRecordRow> {
    return usageRecordToRow(model);
  }

  /**
   * Find a usage record by ID
   */
  async findById(id: string): Promise<UsageRecord | null> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM usage_records
          WHERE id = ${id}
        ` as UsageRecordRow[];
        return rows[0] ? this.rowToModel(rows[0]) : null;
      },
      'findById',
      { id }
    );
  }

  /**
   * Find all usage records with optional filtering
   */
  async findAll(filters: { quiltId?: string; limit?: number; offset?: number } = {}): Promise<UsageRecord[]> {
    return this.executeQuery(
      async () => {
        const { quiltId, limit = 50, offset = 0 } = filters;

        let query = sql`SELECT * FROM usage_records WHERE 1=1`;

        if (quiltId) {
          query = sql`${query} AND quilt_id = ${quiltId}`;
        }

        query = sql`${query} ORDER BY start_date DESC LIMIT ${limit} OFFSET ${offset}`;

        const rows = await query as UsageRecordRow[];
        return rows.map(row => this.rowToModel(row));
      },
      'findAll',
      { filters }
    );
  }

  /**
   * Find usage records by quilt ID
   */
  async findByQuiltId(quiltId: string): Promise<UsageRecord[]> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM usage_records
          WHERE quilt_id = ${quiltId}
          ORDER BY start_date DESC
        ` as UsageRecordRow[];
        return rows.map(row => this.rowToModel(row));
      },
      'findByQuiltId',
      { quiltId }
    );
  }

  /**
   * Get the active usage record for a quilt (end_date is NULL)
   */
  async getActiveUsageRecord(quiltId: string): Promise<UsageRecord | null> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM usage_records
          WHERE quilt_id = ${quiltId}
            AND end_date IS NULL
          LIMIT 1
        ` as UsageRecordRow[];
        return rows[0] ? this.rowToModel(rows[0]) : null;
      },
      'getActiveUsageRecord',
      { quiltId }
    );
  }

  /**
   * Create a new usage record (when quilt status changes to IN_USE)
   */
  async createUsageRecord(data: CreateUsageRecordData): Promise<UsageRecord> {
    return this.executeQuery(
      async () => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        dbLogger.info('Creating usage record', { quiltId: data.quiltId });

        const rows = await sql`
          INSERT INTO usage_records (
            id, quilt_id, start_date, end_date, usage_type, notes, created_at, updated_at
          ) VALUES (
            ${id},
            ${data.quiltId},
            ${data.startDate.toISOString()},
            ${data.endDate ? data.endDate.toISOString() : null},
            ${data.usageType || 'REGULAR'},
            ${data.notes || null},
            ${now},
            ${now}
          ) RETURNING *
        ` as UsageRecordRow[];

        dbLogger.info('Usage record created successfully', { id, quiltId: data.quiltId });
        return this.rowToModel(rows[0]);
      },
      'createUsageRecord',
      { data }
    );
  }

  /**
   * End the active usage record (when quilt status changes from IN_USE)
   */
  async endUsageRecord(quiltId: string, endDate: Date, notes?: string): Promise<UsageRecord | null> {
    return this.executeQuery(
      async () => {
        const now = new Date().toISOString();

        dbLogger.info('Ending usage record', { quiltId, endDate });

        const rows = await sql`
          UPDATE usage_records
          SET
            end_date = ${endDate.toISOString()},
            notes = COALESCE(${notes || null}, notes),
            updated_at = ${now}
          WHERE quilt_id = ${quiltId}
            AND end_date IS NULL
          RETURNING *
        ` as UsageRecordRow[];

        if (rows.length === 0) {
          dbLogger.warn('No active usage record found to end', { quiltId });
          return null;
        }

        dbLogger.info('Usage record ended successfully', { id: rows[0].id, quiltId });
        return this.rowToModel(rows[0]);
      },
      'endUsageRecord',
      { quiltId, endDate }
    );
  }

  /**
   * Update a usage record
   */
  async update(id: string, data: UpdateUsageRecordData): Promise<UsageRecord | null> {
    return this.executeQuery(
      async () => {
        const now = new Date().toISOString();

        dbLogger.info('Updating usage record', { id });

        const rows = await sql`
          UPDATE usage_records
          SET
            start_date = ${data.startDate ? data.startDate.toISOString() : sql`start_date`},
            end_date = ${data.endDate !== undefined ? (data.endDate ? data.endDate.toISOString() : null) : sql`end_date`},
            usage_type = ${data.usageType || sql`usage_type`},
            notes = ${data.notes !== undefined ? data.notes : sql`notes`},
            updated_at = ${now}
          WHERE id = ${id}
          RETURNING *
        ` as UsageRecordRow[];

        if (rows.length === 0) {
          return null;
        }

        dbLogger.info('Usage record updated successfully', { id });
        return this.rowToModel(rows[0]);
      },
      'update',
      { id, data }
    );
  }

  /**
   * Get all active usage records (end_date is NULL)
   */
  async getAllActive(): Promise<UsageRecord[]> {
    return this.executeQuery(
      async () => {
        const rows = await sql`
          SELECT * FROM usage_records
          WHERE end_date IS NULL
          ORDER BY start_date DESC
        ` as UsageRecordRow[];
        return rows.map(row => this.rowToModel(row));
      },
      'getAllActive'
    );
  }

  /**
   * Get usage statistics for a quilt
   */
  async getUsageStats(quiltId: string): Promise<{
    totalUsages: number;
    totalDays: number;
    averageDays: number;
    lastUsedDate: Date | null;
  }> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          SELECT
            COUNT(*) as total_usages,
            COALESCE(SUM(
              CASE
                WHEN end_date IS NOT NULL
                THEN EXTRACT(DAY FROM (end_date::timestamp - start_date::timestamp))
                ELSE 0
              END
            ), 0) as total_days,
            MAX(start_date) as last_used
          FROM usage_records
          WHERE quilt_id = ${quiltId}
        ` as [{
          total_usages: string;
          total_days: string;
          last_used: string | null;
        }];

        const totalUsages = parseInt(result[0]?.total_usages || '0', 10);
        const totalDays = parseFloat(result[0]?.total_days || '0');
        const averageDays = totalUsages > 0 ? totalDays / totalUsages : 0;
        const lastUsedDate = result[0]?.last_used ? new Date(result[0].last_used) : null;

        return {
          totalUsages,
          totalDays,
          averageDays,
          lastUsedDate,
        };
      },
      'getUsageStats',
      { quiltId }
    );
  }

  /**
   * Delete a usage record
   */
  async delete(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          DELETE FROM usage_records
          WHERE id = ${id}
          RETURNING id
        `;

        const success = result.length > 0;
        if (success) {
          dbLogger.info('Usage record deleted successfully', { id });
        }
        return success;
      },
      'delete',
      { id }
    );
  }
}

// Export singleton instance
export const usageRepository = new UsageRepository();
