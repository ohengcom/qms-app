import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// POST /api/usage/end - End current usage of a quilt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quiltId, notes } = body;

    if (!quiltId) {
      return NextResponse.json(
        { success: false, error: 'Quilt ID is required' },
        { status: 400 }
      );
    }

    console.log('Ending usage for quilt:', quiltId);

    // Get active usage record
    const activeUsage = await sql`
      SELECT * FROM usage_records 
      WHERE quilt_id = ${quiltId} AND end_date IS NULL
    `;

    if (activeUsage.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active usage found for this quilt' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Update the record to set end_date
    await sql`
      UPDATE usage_records
      SET 
        end_date = ${now},
        notes = COALESCE(${notes}, notes),
        updated_at = ${now}
      WHERE quilt_id = ${quiltId} AND end_date IS NULL
    `;

    // Update quilt status to AVAILABLE
    await sql`
      UPDATE quilts 
      SET current_status = 'AVAILABLE', updated_at = ${now}
      WHERE id = ${quiltId}
    `;

    console.log('Usage ended successfully');

    const usage = activeUsage[0];

    return NextResponse.json({
      success: true,
      message: 'Usage ended successfully',
      usagePeriod: {
        id: usage.id,
        quiltId,
        startedAt: usage.start_date,
        endedAt: now,
        usageType: usage.usage_type,
        notes: notes || usage.notes,
      },
    });

  } catch (error) {
    console.error('End usage error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to end usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}