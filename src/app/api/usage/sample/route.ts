import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// POST /api/usage/sample - Create sample usage data for testing
export async function POST(request: NextRequest) {
  try {
    console.log('Creating sample usage data...');

    // Get some quilts to create usage data for
    const quilts = await sql`SELECT id, name, item_number FROM quilts LIMIT 5`;
    
    if (quilts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No quilts found to create usage data for' },
        { status: 400 }
      );
    }

    const results = [];

    // Create some historical usage records
    for (let i = 0; i < Math.min(quilts.length, 3); i++) {
      const quilt = quilts[i];
      const usageRecordId = crypto.randomUUID();
      
      // Create a usage record from several days ago
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (15 + i * 5));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (10 + i * 3));

      const usagePeriod = await sql`
        INSERT INTO usage_periods (
          id, quilt_id, start_date, end_date, usage_type, notes, created_at
        ) VALUES (
          ${usageRecordId},
          ${quilt.id},
          ${startDate.toISOString()},
          ${endDate.toISOString()},
          'REGULAR',
          ${`Sample usage for ${quilt.name} (#${quilt.item_number})`},
          ${new Date().toISOString()}
        ) RETURNING *
      `;

      results.push({
        type: 'usage_period',
        quilt: `${quilt.name} (#${quilt.item_number})`,
        data: usagePeriod[0]
      });
    }

    // Create one current usage (active) if we have quilts
    if (quilts.length > 0) {
      const activeQuilt = quilts[quilts.length - 1]; // Use the last quilt
      const currentUsageId = crypto.randomUUID();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 3); // Started 3 days ago

      // Check if this quilt already has current usage
      const existingUsage = await sql`
        SELECT id FROM current_usage WHERE quilt_id = ${activeQuilt.id}
      `;

      if (existingUsage.length === 0) {
        const currentUsage = await sql`
          INSERT INTO current_usage (
            id, quilt_id, started_at, usage_type, notes
          ) VALUES (
            ${currentUsageId},
            ${activeQuilt.id},
            ${startDate.toISOString()},
            'REGULAR',
            ${`Currently using ${activeQuilt.name} (#${activeQuilt.item_number})`}
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
          quilt: `${activeQuilt.name} (#${activeQuilt.item_number})`,
          data: currentUsage[0]
        });
      }
    }

    console.log('Sample usage data created:', results);

    return NextResponse.json({
      success: true,
      message: `Created ${results.length} sample usage records`,
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