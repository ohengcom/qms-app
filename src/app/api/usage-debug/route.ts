import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET /api/usage-debug - Debug usage tables and data
export async function GET(request: NextRequest) {
  try {
    console.log('Debugging usage tables...');

    // Check if usage tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usage_periods', 'current_usage')
      ORDER BY table_name
    `;

    console.log('Usage tables found:', tables);

    // Check current_usage table structure and data
    let currentUsageStructure: any[] = [];
    let currentUsageData: any[] = [];
    try {
      currentUsageStructure = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'current_usage' 
        ORDER BY ordinal_position
      `;
      
      currentUsageData = await sql`SELECT * FROM current_usage LIMIT 10`;
    } catch (error) {
      console.log('current_usage table might not exist:', error);
    }

    // Check usage_records table structure and data
    let usageRecordsStructure: any[] = [];
    let usageRecordsData: any[] = [];
    try {
      usageRecordsStructure = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'usage_records' 
        ORDER BY ordinal_position
      `;
      
      usageRecordsData = await sql`SELECT * FROM usage_records LIMIT 10`;
    } catch (error) {
      console.log('usage_records table might not exist:', error);
    }

    // Get some quilts for reference
    const quilts = await sql`SELECT id, name, item_number, current_status FROM quilts LIMIT 5`;

    return NextResponse.json({
      success: true,
      debug: {
        tablesFound: tables,
        currentUsage: {
          structure: currentUsageStructure,
          data: currentUsageData,
          count: currentUsageData.length
        },
        usageRecords: {
          structure: usageRecordsStructure,
          data: usageRecordsData,
          count: usageRecordsData.length
        },
        sampleQuilts: quilts
      }
    });

  } catch (error) {
    console.error('Usage debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to debug usage tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/usage-debug - Create sample usage data
export async function POST(request: NextRequest) {
  try {
    console.log('Creating sample usage data...');

    // Get some quilts to create usage data for
    const quilts = await sql`SELECT id, name FROM quilts LIMIT 3`;
    
    if (quilts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No quilts found to create usage data for' },
        { status: 400 }
      );
    }

    const results = [];

    // Create some historical usage periods
    for (let i = 0; i < quilts.length; i++) {
      const quilt = quilts[i];
      const usagePeriodId = crypto.randomUUID();
      
      // Create a usage period from 10 days ago to 5 days ago
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (10 + i * 3));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (5 + i * 2));

      const usageRecord = await sql`
        INSERT INTO usage_records (
          id, quilt_id, start_date, end_date, usage_type, notes, created_at
        ) VALUES (
          ${usagePeriodId},
          ${quilt.id},
          ${startDate.toISOString()},
          ${endDate.toISOString()},
          'REGULAR',
          ${`Sample usage record for ${quilt.name}`},
          ${new Date().toISOString()}
        ) RETURNING *
      `;

      results.push({
        type: 'usage_record',
        quilt: quilt.name,
        data: usageRecord[0]
      });
    }

    // Create one current usage (active)
    if (quilts.length > 0) {
      const activeQuilt = quilts[0];
      const currentUsageId = crypto.randomUUID();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 2); // Started 2 days ago

      const currentUsage = await sql`
        INSERT INTO current_usage (
          id, quilt_id, started_at, usage_type, notes, created_at
        ) VALUES (
          ${currentUsageId},
          ${activeQuilt.id},
          ${startDate.toISOString()},
          'REGULAR',
          ${`Currently using ${activeQuilt.name}`},
          ${new Date().toISOString()}
        ) RETURNING *
      `;

      // Update quilt status to IN_USE
      await sql`
        UPDATE quilts 
        SET current_status = 'IN_USE', updated_at = ${new Date().toISOString()}
        WHERE id = ${activeQuilt.id}
      `;

      results.push({
        type: 'current_usage',
        quilt: activeQuilt.name,
        data: currentUsage[0]
      });
    }

    console.log('Sample usage data created:', results);

    return NextResponse.json({
      success: true,
      message: 'Sample usage data created successfully',
      created: results
    });

  } catch (error) {
    console.error('Create sample usage data error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create sample usage data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}