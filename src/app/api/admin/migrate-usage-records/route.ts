import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

/**
 * Admin endpoint to migrate from current_usage + usage_periods to unified usage_records table
 * This is a safe migration that preserves old tables
 */
export async function POST() {
  try {
    console.log('🚀 Starting migration to unified usage_records table...');

    // Step 1: Create new usage_records table
    console.log('📋 Step 1: Creating new usage_records table...');
    await sql`
      CREATE TABLE IF NOT EXISTS usage_records (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        quilt_id TEXT NOT NULL REFERENCES quilts(id) ON DELETE CASCADE,
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        usage_type TEXT CHECK (usage_type IN ('REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION')) DEFAULT 'REGULAR',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Step 2: Create indexes
    console.log('📋 Step 2: Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_quilt_id 
      ON usage_records(quilt_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_dates 
      ON usage_records(start_date, end_date)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_active 
      ON usage_records(quilt_id) 
      WHERE end_date IS NULL
    `;

    // Step 3: Create unique constraint
    console.log('📋 Step 3: Creating unique constraint...');
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_per_quilt
      ON usage_records(quilt_id)
      WHERE end_date IS NULL
    `;

    // Step 4: Check if old tables exist
    console.log('📋 Step 4: Checking for old tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('current_usage', 'usage_periods')
    `;
    const tableNames = tables.map((t: any) => t.table_name);

    let migratedFromCurrent = 0;
    let migratedFromPeriods = 0;

    // Step 5: Migrate data from current_usage
    if (tableNames.includes('current_usage')) {
      console.log('📋 Step 5: Migrating data from current_usage...');
      const currentUsageData = await sql`SELECT * FROM current_usage`;

      for (const record of currentUsageData) {
        await sql`
          INSERT INTO usage_records (
            id, quilt_id, start_date, end_date, usage_type, notes, created_at
          ) VALUES (
            ${record.id},
            ${record.quilt_id},
            ${record.started_at},
            NULL,
            ${record.usage_type || 'REGULAR'},
            ${record.notes || null},
            ${record.created_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        migratedFromCurrent++;
      }
    }

    // Step 6: Migrate data from usage_periods
    if (tableNames.includes('usage_periods')) {
      console.log('📋 Step 6: Migrating data from usage_periods...');
      const usagePeriodsData = await sql`SELECT * FROM usage_periods`;

      for (const record of usagePeriodsData) {
        await sql`
          INSERT INTO usage_records (
            id, quilt_id, start_date, end_date, usage_type, notes, created_at
          ) VALUES (
            ${record.id},
            ${record.quilt_id},
            ${record.start_date},
            ${record.end_date},
            ${record.usage_type || 'REGULAR'},
            ${record.notes || null},
            ${record.created_at || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        migratedFromPeriods++;
      }
    }

    // Step 7: Verify data
    console.log('📋 Step 7: Verifying migrated data...');
    const totalRecords = await sql`SELECT COUNT(*) as count FROM usage_records`;
    const activeRecords = await sql`
      SELECT COUNT(*) as count FROM usage_records WHERE end_date IS NULL
    `;
    const completedRecords = await sql`
      SELECT COUNT(*) as count FROM usage_records WHERE end_date IS NOT NULL
    `;

    // Step 8: Check for duplicates
    const duplicates = await sql`
      SELECT quilt_id, COUNT(*) as count
      FROM usage_records
      WHERE end_date IS NULL
      GROUP BY quilt_id
      HAVING COUNT(*) > 1
    `;

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      migration: {
        migratedFromCurrent,
        migratedFromPeriods,
        totalMigrated: migratedFromCurrent + migratedFromPeriods,
      },
      verification: {
        totalRecords: totalRecords[0].count,
        activeRecords: activeRecords[0].count,
        completedRecords: completedRecords[0].count,
        duplicates: duplicates.length,
      },
      oldTablesPreserved: tableNames,
      nextSteps: [
        '1. Test all functionality thoroughly',
        '2. Monitor for any issues',
        '3. After 1 week, you can drop old tables using: POST /api/admin/drop-old-usage-tables',
      ],
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    // Check which tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('usage_records', 'current_usage', 'usage_periods')
    `;
    const tableNames = tables.map((t: any) => t.table_name);

    const hasNewTable = tableNames.includes('usage_records');
    const hasOldTables = tableNames.includes('current_usage') || tableNames.includes('usage_periods');

    let stats = null;
    if (hasNewTable) {
      const total = await sql`SELECT COUNT(*) as count FROM usage_records`;
      const active = await sql`SELECT COUNT(*) as count FROM usage_records WHERE end_date IS NULL`;
      const completed = await sql`SELECT COUNT(*) as count FROM usage_records WHERE end_date IS NOT NULL`;

      stats = {
        total: total[0].count,
        active: active[0].count,
        completed: completed[0].count,
      };
    }

    return NextResponse.json({
      success: true,
      tables: tableNames,
      status: {
        hasNewTable,
        hasOldTables,
        migrationNeeded: !hasNewTable && hasOldTables,
        migrationComplete: hasNewTable,
        canDropOldTables: hasNewTable && hasOldTables,
      },
      stats,
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
