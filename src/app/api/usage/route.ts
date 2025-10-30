import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET /api/usage - Get all usage history sorted by time
export async function GET(request: NextRequest) {
  try {
    console.log('Getting all usage history...');

    // Get all usage records with quilt information, sorted by start time (most recent first)
    const usageRecords = await sql`
      SELECT 
        ur.id,
        ur.quilt_id,
        ur.start_date as started_at,
        ur.end_date as ended_at,
        ur.usage_type,
        ur.notes,
        ur.created_at,
        q.name as quilt_name,
        q.item_number,
        q.color,
        q.season,
        q.current_status
      FROM usage_records ur
      JOIN quilts q ON ur.quilt_id = q.id
      ORDER BY ur.start_date DESC
      LIMIT 100
    `;

    // Transform the data for frontend consumption
    const transformedUsage = usageRecords.map((record: any) => {
      const isActive = record.ended_at === null;
      const duration = record.ended_at
        ? Math.floor((new Date(record.ended_at).getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((new Date().getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24));

      return {
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
        isActive,
        duration,
      };
    });

    const activeCount = transformedUsage.filter(r => r.isActive).length;
    const completedCount = transformedUsage.filter(r => !r.isActive).length;

    console.log(`Found ${transformedUsage.length} usage records`);

    return NextResponse.json({
      success: true,
      usage: transformedUsage,
      stats: {
        total: transformedUsage.length,
        active: activeCount,
        completed: completedCount,
      },
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
      SELECT id FROM usage_records 
      WHERE quilt_id = ${quiltId} AND end_date IS NULL
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
      INSERT INTO usage_records (
        id, quilt_id, start_date, end_date, usage_type, notes, created_at, updated_at
      )
      VALUES (
        ${id}, ${quiltId}, ${now}, NULL, ${usageType}, ${notes || null}, ${now}, ${now}
      )
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
      message: 'Usage started successfully',
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