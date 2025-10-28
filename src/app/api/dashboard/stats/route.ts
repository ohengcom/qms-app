import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all quilts to calculate statistics
    const quilts = await db.getQuilts({ limit: 1000 });
    const total = await db.countQuilts();

    // Calculate status counts
    const statusCounts = quilts.reduce(
      (acc, quilt) => {
        const status = quilt.currentStatus || 'AVAILABLE';
        if (status === 'IN_USE') acc.inUseCount++;
        else if (status === 'AVAILABLE') acc.availableCount++;
        else if (status === 'STORAGE') acc.storageCount++;
        else if (status === 'MAINTENANCE') acc.maintenanceCount++;
        return acc;
      },
      {
        inUseCount: 0,
        availableCount: 0,
        storageCount: 0,
        maintenanceCount: 0,
      }
    );

    // Calculate seasonal distribution
    const seasonalDistribution = quilts.reduce(
      (acc, quilt) => {
        const season = quilt.season || 'SPRING_AUTUMN';
        if (season === 'WINTER') acc.winter++;
        else if (season === 'SUMMER') acc.summer++;
        else acc.springAutumn++;
        return acc;
      },
      {
        winter: 0,
        springAutumn: 0,
        summer: 0,
      }
    );

    return NextResponse.json({
      overview: {
        totalQuilts: total,
        ...statusCounts,
      },
      seasonalDistribution,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
