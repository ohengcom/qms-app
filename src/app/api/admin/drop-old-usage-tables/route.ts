import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

/**
 * Admin endpoint to drop old usage tables after successful migration
 * WARNING: This will permanently delete current_usage and usage_periods tables
 */
export async function POST() {
  try {
    console.log('⚠️  Dropping old usage tables...');

    // Check if new table exists
    const newTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'usage_records'
    `;

    if (newTable.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot drop old tables: usage_records table does not exist',
          message: 'Please run migration first',
        },
        { status: 400 }
      );
    }

    // Drop current_usage table
    await sql`DROP TABLE IF EXISTS current_usage CASCADE`;
    console.log('✅ Dropped current_usage table');

    // Drop usage_periods table
    await sql`DROP TABLE IF EXISTS usage_periods CASCADE`;
    console.log('✅ Dropped usage_periods table');

    // Verify tables are gone
    const remainingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('current_usage', 'usage_periods')
    `;

    return NextResponse.json({
      success: true,
      message: 'Old tables successfully removed',
      droppedTables: ['current_usage', 'usage_periods'],
      remainingOldTables: remainingTables.map((t: any) => t.table_name),
    });
  } catch (error) {
    console.error('Error dropping tables:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to drop old tables',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check what would be dropped
export async function GET() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('current_usage', 'usage_periods')
    `;

    const tableNames = tables.map((t: any) => t.table_name);

    return NextResponse.json({
      success: true,
      tablesToDrop: tableNames,
      warning: 'Calling POST will permanently delete these tables',
      canProceed: tableNames.length > 0,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
