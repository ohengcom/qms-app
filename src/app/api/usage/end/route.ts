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

    // Get current usage record
    const currentUsage = await sql`
      SELECT * FROM current_usage WHERE quilt_id = ${quiltId}
    `;

    if (currentUsage.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active usage found for this quilt' },
        { status: 400 }
      );
    }

    const usage = currentUsage[0];
    const now = new Date().toISOString();
    const usagePeriodId = crypto.randomUUID();

    // Move to usage_periods table
    await sql`
      INSERT INTO usage_periods (
        id, quilt_id, started_at, ended_at, usage_type, notes, created_at
      ) VALUES (
        ${usagePeriodId}, 
        ${quiltId}, 
        ${usage.started_at}, 
        ${now}, 
        ${usage.usage_type}, 
        ${notes || usage.notes}, 
        ${usage.created_at}
      )
    `;

    // Remove from current_usage
    await sql`
      DELETE FROM current_usage WHERE quilt_id = ${quiltId}
    `;

    // Update quilt status to AVAILABLE
    await sql`
      UPDATE quilts 
      SET current_status = 'AVAILABLE', updated_at = ${now}
      WHERE id = ${quiltId}
    `;

    console.log('Usage ended successfully');

    return NextResponse.json({
      success: true,
      message: 'Usage ended successfully',
      usagePeriod: {
        id: usagePeriodId,
        quiltId,
        startedAt: usage.started_at,
        endedAt: now,
        usageType: usage.usage_type,
        notes: notes || usage.notes
      }
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