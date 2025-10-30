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

    // Get all usage records for this quilt
    const usageRecords = await sql`
      SELECT 
        id,
        start_date as started_at,
        end_date as ended_at,
        usage_type,
        notes,
        created_at,
        updated_at
      FROM usage_records 
      WHERE quilt_id = ${quiltId}
      ORDER BY start_date DESC
    `;

    // Transform usage records
    const allUsage = usageRecords.map((record: any) => {
      const isActive = record.ended_at === null;
      const duration = record.ended_at
        ? Math.floor((new Date(record.ended_at).getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((new Date().getTime() - new Date(record.started_at).getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: record.id,
        startedAt: record.started_at,
        endedAt: record.ended_at,
        usageType: record.usage_type || 'REGULAR',
        notes: record.notes,
        isActive,
        duration,
        createdAt: record.created_at,
      };
    });

    // Calculate statistics
    const activeRecords = allUsage.filter(r => r.isActive);
    const completedRecords = allUsage.filter(r => !r.isActive);
    const totalUsageDays = completedRecords.reduce((sum, usage) => sum + (usage.duration || 0), 0);
    const averageUsageDays = completedRecords.length > 0 ? Math.round(totalUsageDays / completedRecords.length) : 0;
    const currentUsageDays = activeRecords.length > 0 ? activeRecords[0].duration : 0;

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
        activePeriods: activeRecords.length,
        completedPeriods: completedRecords.length,
        totalUsageDays,
        averageUsageDays,
        currentUsageDays,
        lastUsed: allUsage.length > 0 ? allUsage[0].startedAt : null,
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