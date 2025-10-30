import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

/**
 * Admin endpoint to check database schema and diagnose issues
 */
export async function GET() {
  try {
    console.log('Checking database schema...');

    // 1. Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('Tables found:', tables);

    // 2. Check for usage-related tables
    const usageTables = tables.filter((t: any) => 
      t.table_name.includes('usage')
    );

    // 3. Get structure of each usage table
    const tableStructures: any = {};
    
    for (const table of usageTables) {
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;
      
      tableStructures[table.table_name] = columns;
    }

    // 4. Check for indexes on usage tables
    const indexes: any = {};
    
    for (const table of usageTables) {
      const tableIndexes = await sql`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename = ${table.table_name}
      `;
      
      indexes[table.table_name] = tableIndexes;
    }

    // 5. Check for constraints
    const constraints: any = {};
    
    for (const table of usageTables) {
      const tableConstraints = await sql`
        SELECT
          conname as constraint_name,
          contype as constraint_type,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = ${table.table_name}::regclass
      `;
      
      constraints[table.table_name] = tableConstraints;
    }

    // 6. Count records in each table
    const recordCounts: any = {};
    
    for (const table of usageTables) {
      try {
        const count = await sql`
          SELECT COUNT(*) as count 
          FROM ${sql(table.table_name)}
        `;
        recordCounts[table.table_name] = count[0]?.count || 0;
      } catch (error) {
        recordCounts[table.table_name] = 'Error: ' + (error as Error).message;
      }
    }

    // 7. Diagnosis
    const diagnosis = {
      hasUsageRecords: tables.some((t: any) => t.table_name === 'usage_records'),
      hasCurrentUsage: tables.some((t: any) => t.table_name === 'current_usage'),
      hasUsagePeriods: tables.some((t: any) => t.table_name === 'usage_periods'),
    };

    return NextResponse.json({
      success: true,
      summary: {
        totalTables: tables.length,
        usageTables: usageTables.length,
        diagnosis,
      },
      tables: tables.map((t: any) => t.table_name),
      usageTables: usageTables.map((t: any) => t.table_name),
      tableStructures,
      indexes,
      constraints,
      recordCounts,
    });
  } catch (error) {
    console.error('Error checking database schema:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check database schema',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
