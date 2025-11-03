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
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async findById(id: string): Promise<TModel | null> {
    throw new Error('findById must be implemented in child class');
  }

  /**
   * Count records with optional filters
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async count(filters?: Record<string, unknown>): Promise<number> {
    throw new Error('count must be implemented in child class');
  }

  /**
   * Delete a record by ID
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async delete(id: string): Promise<boolean> {
    throw new Error('delete must be implemented in child class');
  }

  /**
   * Check if a record exists
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async exists(id: string): Promise<boolean> {
    throw new Error('exists must be implemented in child class');
  }
}
