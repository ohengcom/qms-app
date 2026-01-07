/**
 * Base Repository
 *
 * Provides common database operations that can be extended by specific repositories.
 *
 * Requirements: 10.1 - Specific error messages for database operations
 */

import { dbLogger } from '@/lib/logger';
import { createError, ErrorCodes } from '@/lib/error-handler';

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
   *
   * Requirements: 10.1 - Specific error messages for database operations
   * Instead of silently failing or re-throwing generic errors, this method
   * creates specific AppError instances with meaningful error messages.
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
      const errorMessage = error instanceof Error ? error.message : String(error);

      dbLogger.error(`${operation} failed`, error as Error, {
        table: this.tableName,
        ...context,
      });

      // Determine the appropriate error code based on the error type
      let errorCode: string = ErrorCodes.DB_QUERY_FAILED;
      let userMessage = `${this.getTableDisplayName()}操作失败`;

      // Check for connection errors
      if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
        errorCode = ErrorCodes.DB_CONNECTION_FAILED;
        userMessage = '数据库连接失败，请稍后重试';
      }
      // Check for transaction errors
      else if (errorMessage.includes('transaction') || errorMessage.includes('deadlock')) {
        errorCode = ErrorCodes.DB_TRANSACTION_FAILED;
        userMessage = '数据库事务失败，请稍后重试';
      }
      // Check for not found errors
      else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        errorCode = ErrorCodes.NOT_FOUND;
        userMessage = `${this.getTableDisplayName()}不存在`;
      }
      // Check for validation/constraint errors
      else if (errorMessage.includes('constraint') || errorMessage.includes('violates')) {
        errorCode = ErrorCodes.VALIDATION_FAILED;
        userMessage = '数据验证失败，请检查输入';
      }

      throw createError(errorCode, userMessage, {
        operation,
        table: this.tableName,
        originalError: errorMessage,
        ...context,
      });
    }
  }

  /**
   * Get a user-friendly display name for the table
   */
  protected getTableDisplayName(): string {
    const tableNameMap: Record<string, string> = {
      quilts: '被子',
      usage_records: '使用记录',
      notifications: '通知',
      system_settings: '系统设置',
      maintenance_records: '维护记录',
    };
    return tableNameMap[this.tableName] || this.tableName;
  }

  /**
   * Find a record by ID
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async findById(_id: string): Promise<TModel | null> {
    throw new Error('findById must be implemented in child class');
  }

  /**
   * Count records with optional filters
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async count(_filters?: Record<string, unknown>): Promise<number> {
    throw new Error('count must be implemented in child class');
  }

  /**
   * Delete a record by ID
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async delete(_id: string): Promise<boolean> {
    throw new Error('delete must be implemented in child class');
  }

  /**
   * Check if a record exists
   * Note: This method should be overridden in child classes for proper table name handling
   */
  async exists(_id: string): Promise<boolean> {
    throw new Error('exists must be implemented in child class');
  }

  /**
   * Check database connection health
   * This is a simple query to verify the database is accessible
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const { sql } = await import('@/lib/neon');
      await sql`SELECT 1 as test`;
      return true;
    } catch {
      return false;
    }
  }
}
