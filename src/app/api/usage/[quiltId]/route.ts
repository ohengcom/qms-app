import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET /api/usage/[quiltId] - Get usage history for a specific quilt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quiltId: string }> }
) {
  try {
    const { quiltId } = await params;
    
    if (!quiltId) {
      return NextResponse.json(
        { success: false, error: 'Quilt ID is required' },
        { status: 400 }
      );
    }

    console.log('Getting usage history for quilt:', quiltId);

    // Get quilt information
    const quiltInfo = await sql`
      SELECT id, name, item_number, color, season, current_status
      FROM quilts 
      WHERE id = ${quiltId}
    `;

    if (quiltInfo.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quilt not found' },
        { status: 404 }
      );
    }

    const quilt = quiltInfo[0];

    // Get historical usage periods
    const usageHistory = await sql`
      SELECT 
        id,
        started_at,
        ended_at,
        usage_type,
        notes,
        created_at
      FROM usage_periods 
      WHERE quilt_id = ${quiltId}
      ORDER BY started_at DESC
    `;

    // Get current usage if any
    const currentUsage = await sql`
      SELECT 
        id,
        started_at,
        usage_type,
        notes,
        created_at
      FROM current_usage 
      WHERE quilt_id = ${quiltId}
    `;

    // Transform historical usage
    const transformedHistory = usageHistory.map((record: any) => ({
      id: record.id,
      startedAt: record.started_at,
      endedAt: record.ended_at,
      usageType: record.usage_type || 'REGULAR',
      notes: record.notes,
      isActive: false,
      duration: Math.floor((new Date(record.ended_at).getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24)),
      createdAt: record.created_at
    }));

    // Transform current usage
    const transformedCurrent = currentUsage.map((record: any) => ({
      id: record.id,
      startedAt: record.started_at,
      endedAt: null,
      usageType: record.usage_type || 'REGULAR',
      notes: record.notes,
      isActive: true,
      duration: Math.floor((new Date().getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24)),
      createdAt: record.created_at
    }));

    // Combine and sort by start time
    const allUsage = [...transformedCurrent, ...transformedHistory]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    // Calculate statistics
    const totalUsageDays = transformedHistory.reduce((sum, usage) => sum + (usage.duration || 0), 0);
    const averageUsageDays = transformedHistory.length > 0 ? Math.round(totalUsageDays / transformedHistory.length) : 0;
    const currentUsageDays = transformedCurrent.length > 0 ? transformedCurrent[0].duration : 0;

    console.log(`Found ${allUsage.length} usage records for quilt ${quiltId}`);

    return NextResponse.json({
      success: true,
      quilt: {
        id: quilt.id,
        name: quilt.name,
        itemNumber: quilt.item_number,
        color: quilt.color,
        season: quilt.season,
        currentStatus: quilt.current_status
      },
      usage: allUsage,
      stats: {
        totalPeriods: allUsage.length,
        activePeriods: transformedCurrent.length,
        completedPeriods: transformedHistory.length,
        totalUsageDays,
        averageUsageDays,
        currentUsageDays,
        lastUsed: allUsage.length > 0 ? allUsage[0].startedAt : null
      }
    });

  } catch (error) {
    console.error('Get quilt usage history error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quilt usage history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}