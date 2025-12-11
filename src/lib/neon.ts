/**
 * Neon Database Connection
 *
 * This module provides the database connection using Neon serverless driver.
 * All database operations should use the Repository pattern (see src/lib/repositories/).
 *
 * Exports:
 * - sql: Neon tagged template literal for direct SQL queries
 * - withTransaction: Helper function for executing multiple queries in a transaction
 */

import { neon } from '@neondatabase/serverless';
import { dbLogger } from './logger';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create Neon serverless connection
export const sql = neon(process.env.DATABASE_URL);

/**
 * Execute multiple queries within a database transaction
 *
 * This function wraps multiple SQL operations in a BEGIN/COMMIT block,
 * ensuring atomicity. If any operation fails, all changes are rolled back.
 *
 * Requirements: 13.1 - Status change atomicity
 *
 * @param operations - Async function that performs database operations
 * @returns The result of the operations function
 * @throws Error if any operation fails (transaction is rolled back)
 *
 * @example
 * const result = await withTransaction(async () => {
 *   await sql`UPDATE quilts SET current_status = 'IN_USE' WHERE id = ${id}`;
 *   await sql`INSERT INTO usage_records (quilt_id, start_date) VALUES (${id}, ${now})`;
 *   return { success: true };
 * });
 */
export async function withTransaction<T>(operations: () => Promise<T>): Promise<T> {
  try {
    // Begin transaction
    await sql`BEGIN`;
    dbLogger.debug('Transaction started');

    // Execute operations
    const result = await operations();

    // Commit transaction
    await sql`COMMIT`;
    dbLogger.debug('Transaction committed');

    return result;
  } catch (error) {
    // Rollback on error
    try {
      await sql`ROLLBACK`;
      dbLogger.debug('Transaction rolled back');
    } catch (rollbackError) {
      dbLogger.error('Failed to rollback transaction', rollbackError as Error);
    }

    dbLogger.error('Transaction failed', error as Error);
    throw error;
  }
}
