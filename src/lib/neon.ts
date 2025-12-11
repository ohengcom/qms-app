/**
 * Neon Database Connection
 *
 * This module provides the database connection using Neon serverless driver.
 * All database operations should use the Repository pattern (see src/lib/repositories/).
 *
 * Exports:
 * - sql: Neon tagged template literal for direct SQL queries
 * - executeQuery: Helper function for parameterized queries (legacy, prefer sql)
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

/**
 * Helper function to execute queries with error handling
 *
 * @deprecated Prefer using the `sql` tagged template directly or Repository methods.
 * This function uses string interpolation which is less safe than tagged templates.
 */
export async function executeQuery<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
  try {
    // For queries without parameters, use simple tagged template
    if (params.length === 0) {
      const result = await sql`${queryText}`;
      return result as T[];
    }

    // For parameterized queries, we need to use Neon's tagged template syntax
    // Neon supports parameter interpolation in tagged templates
    let processedQuery = queryText;

    // Replace $1, $2, etc. with actual parameter values safely
    params.forEach((param, index) => {
      const placeholder = `${index + 1}`;
      let escapedParam: string;

      if (param === null || param === undefined) {
        escapedParam = 'NULL';
      } else if (typeof param === 'string') {
        // Escape single quotes and wrap in quotes
        escapedParam = `'${param.replace(/'/g, "''")}'`;
      } else if (param instanceof Date) {
        escapedParam = `'${param.toISOString()}'`;
      } else if (typeof param === 'boolean') {
        escapedParam = param ? 'TRUE' : 'FALSE';
      } else {
        escapedParam = String(param);
      }

      processedQuery = processedQuery.replace(new RegExp(`\\${placeholder}\\b`, 'g'), escapedParam);
    });

    // Execute with tagged template literal
    const result = await sql`${processedQuery}`;
    return result as T[];
  } catch (error) {
    dbLogger.error('Database query error', error as Error);
    throw error;
  }
}
