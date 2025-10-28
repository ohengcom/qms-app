import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET /api/usage - Get all usage history sorted by time
export async function GET(request: NextRequest) {
  try {
    console.log('Getting all usage history...');

    // Get all usage periods with quilt information, sorted by start time (most recent first)
    const usageHistory = await sql`
      SELECT 
        up.id,
        up.quilt_id,
        up.started_at,
        up.ended_at,
        up.usage_type,
        up.notes,
        up.created_at,
        q.name as quilt_name,
        q.item_number,
        q.color,
        q.season,
        q.current_status
      FROM usage_periods up
      JOIN quilts q ON up.quilt_id = q.id
      ORDER BY up.started_at DESC
      LIMIT 100
    `;

    // Also get current usage (ongoing usage)
    const currentUsage = await sql`
      SELECT 
        cu.id,
        cu.quilt_id,
        cu.started_at,
        cu.usage_type,
        cu.notes,
        cu.created_at,
        q.name as quilt_name,
        q.item_number,
        q.color,
        q.season,
        q.current_status
      FROM current_usage cu
      JOIN quilts q ON cu.quilt_id = q.id
      ORDER BY cu.started_at DESC
    `;

    // Transform the data for frontend consumption
    const transformedHistory = usageHistory.map((record: any) => ({
      id: record.id,
      quiltId: record.quilt_id,
      quiltName: record.quilt_name,
      itemNumber: record.item_number,
      color: record.color,
      season: record.season,
      currentStatus: record.current_status,
      startedAt: record.started_at,
      endedAt: record.ended_at,
      usageType: record.usage_type || 'REGULAR',
      notes: record.notes,
      isActive: false,
      duration: record.ended_at ? 
        Math.floor((new Date(record.ended_at).getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24)) 
        : null
    }));

    const transformedCurrent = currentUsage.map((record: any) => ({
      id: record.id,
      quiltId: record.quilt_id,
      quiltName: record.quilt_name,
      itemNumber: record.item_number,
      color: record.color,
      season: record.season,
      currentStatus: record.current_status,
      startedAt: record.started_at,
      endedAt: null,
      usageType: record.usage_type || 'REGULAR',
      notes: record.notes,
      isActive: true,
      duration: Math.floor((new Date().getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Combine current and historical usage, sort by start time
    const allUsage = [...transformedCurrent, ...transformedHistory]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    console.log(`Found ${allUsage.length} usage records`);

    return NextResponse.json({
      success: true,
      usage: allUsage,
      stats: {
        total: allUsage.length,
        active: transformedCurrent.length,
        completed: transformedHistory.length
      }
    });

  } catch (error) {
    console.error('Get usage history error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch usage history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/usage - Start using a quilt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quiltId, usageType = 'REGULAR', notes } = body;

    if (!quiltId) {
      return NextResponse.json(
        { success: false, error: 'Quilt ID is required' },
        { status: 400 }
      );
    }

    console.log('Starting usage for quilt:', quiltId);

    // Check if quilt is already in use
    const existingUsage = await sql`
      SELECT id FROM current_usage WHERE quilt_id = ${quiltId}
    `;

    if (existingUsage.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Quilt is already in use' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Start usage
    const result = await sql`
      INSERT INTO current_usage (id, quilt_id, started_at, usage_type, notes, created_at)
      VALUES (${id}, ${quiltId}, ${now}, ${usageType}, ${notes || null}, ${now})
      RETURNING *
    `;

    // Update quilt status to IN_USE
    await sql`
      UPDATE quilts 
      SET current_status = 'IN_USE', updated_at = ${now}
      WHERE id = ${quiltId}
    `;

    console.log('Usage started successfully:', result[0]);

    return NextResponse.json({
      success: true,
      usage: result[0],
      message: 'Usage started successfully'
    });

  } catch (error) {
    console.error('Start usage error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}