/**
 * Base Repository
 * 
 * Provides common database operations that can be extended by specific repositories.
 */

import { sql } from '@/lib/neon';
import { dbLogger } from '@/lib/logger';

export interface BaseRepository<T> {
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, unknown>): Promise<number>;
}

/**
 * Base repository class with common database operations
 */
export abstract class BaseRepositoryImpl<TRow, TModel> {
  protected abstract tableName: string;
  protected abstract rowToModel(row: TRow): TModel;
  protected abstract modelToRow(model: Partial<TModel>): Partial<TRow>;

  /**
   * Execute a query with error handling and logging
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<T>,
    operation: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      const result = await queryFn();
      dbLogger.debug(`${operation} completed`, { table: this.tableName, ...context });
      return result;
    } catch (error) {
      dbLogger.error(`${operation} failed`, error as Error, {
        table: this.tableName,
        ...context,
      });
      throw error;
    }
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<TModel | null> {
    return this.executeQuery(
      async () => {
        const rows = await sql<TRow[]>`
          SELECT * FROM ${sql(this.tableName)}
          WHERE id = ${id}
        `;
        return rows[0] ? this.rowToModel(rows[0]) : null;
      },
      'findById',
      { id }
    );
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: Record<string, unknown>): Promise<number> {
    return this.executeQuery(
      async () => {
        const result = await sql<[{ count: string }]>`
          SELECT COUNT(*) as count FROM ${sql(this.tableName)}
        `;
        return parseInt(result[0]?.count || '0', 10);
      },
      'count',
      { filters }
    );
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        const result = await sql`
          DELETE FROM ${sql(this.tableName)}
          WHERE id = ${id}
          RETURNING id
        `;
        return result.length > 0;
      },
      'delete',
      { id }
    );
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    return this.executeQuery(
      async () => {
        const result = await sql<[{ exists: boolean }]>`
          SELECT EXISTS(
            SELECT 1 FROM ${sql(this.tableName)}
            WHERE id = ${id}
          ) as exists
        `;
        return result[0]?.exists || false;
      },
      'exists',
      { id }
    );
  }
}
