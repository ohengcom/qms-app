/**
 * API Route: Run notifications table migration
 * Access: GET /api/migrate/notifications
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    console.log('🚀 Starting migration 007: Create notifications table...');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '007_create_notifications.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    const results = [];
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 80) + '...');
        try {
          await sql.unsafe(statement);
          results.push({ success: true, statement: statement.substring(0, 100) });
        } catch (error: any) {
          // If table already exists, that's okay
          if (error.message?.includes('already exists')) {
            results.push({ success: true, statement: statement.substring(0, 100), note: 'Already exists' });
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ Migration 007 completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Migration 007 completed successfully',
      details: {
        created: [
          'notifications table',
          'Indexes for performance optimization',
          'Trigger for updated_at timestamp',
        ],
        statements: results,
      },
    });
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
