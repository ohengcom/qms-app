import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET /api/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    // Get all quilts with their current status
    const quilts = await sql`
      SELECT id, name, item_number, season, current_status, created_at
      FROM quilts
      ORDER BY item_number
    `;

    // Get all usage periods
    const usagePeriods = await sql`
      SELECT 
        up.id,
        up.quilt_id,
        up.start_date,
        up.end_date,
        up.duration_days,
        up.usage_type,
        q.season,
        q.name as quilt_name
      FROM usage_periods up
      JOIN quilts q ON up.quilt_id = q.id
      ORDER BY up.start_date DESC
    `;

    // Get current usage
    const currentUsage = await sql`
      SELECT 
        cu.id,
        cu.quilt_id,
        cu.started_at,
        q.name as quilt_name,
        q.season
      FROM current_usage cu
      JOIN quilts q ON cu.quilt_id = q.id
    `;

    // Calculate analytics
    const totalQuilts = quilts.length;
    const statusDistribution = {
      AVAILABLE: quilts.filter(q => q.current_status === 'AVAILABLE').length,
      IN_USE: quilts.filter(q => q.current_status === 'IN_USE').length,
      STORAGE: quilts.filter(q => q.current_status === 'STORAGE').length,
      MAINTENANCE: quilts.filter(q => q.current_status === 'MAINTENANCE').length,
    };

    const seasonDistribution = {
      WINTER: quilts.filter(q => q.season === 'WINTER').length,
      SPRING_AUTUMN: quilts.filter(q => q.season === 'SPRING_AUTUMN').length,
      SUMMER: quilts.filter(q => q.season === 'SUMMER').length,
    };

    // Calculate usage statistics
    const totalUsagePeriods = usagePeriods.length;
    const totalUsageDays = usagePeriods.reduce((sum, period) => sum + (period.duration_days || 0), 0);
    const averageUsageDays = totalUsagePeriods > 0 ? Math.round(totalUsageDays / totalUsagePeriods) : 0;

    // Calculate usage by season
    const usageBySeason = {
      WINTER: usagePeriods.filter(p => p.season === 'WINTER').length,
      SPRING_AUTUMN: usagePeriods.filter(p => p.season === 'SPRING_AUTUMN').length,
      SUMMER: usagePeriods.filter(p => p.season === 'SUMMER').length,
    };

    // Calculate most used quilts
    const quiltUsageCount: { [key: string]: { count: number; name: string; totalDays: number } } = {};
    usagePeriods.forEach(period => {
      if (!quiltUsageCount[period.quilt_id]) {
        quiltUsageCount[period.quilt_id] = {
          count: 0,
          name: period.quilt_name,
          totalDays: 0
        };
      }
      quiltUsageCount[period.quilt_id].count++;
      quiltUsageCount[period.quilt_id].totalDays += period.duration_days || 0;
    });

    const mostUsedQuilts = Object.entries(quiltUsageCount)
      .map(([id, data]) => ({
        quiltId: id,
        name: data.name,
        usageCount: data.count,
        totalDays: data.totalDays,
        averageDays: Math.round(data.totalDays / data.count)
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    // Calculate usage by year
    const usageByYear: { [key: string]: number } = {};
    usagePeriods.forEach(period => {
      const year = new Date(period.start_date).getFullYear();
      usageByYear[year] = (usageByYear[year] || 0) + 1;
    });

    // Calculate usage by month (last 12 months)
    const usageByMonth: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      usageByMonth[key] = 0;
    }
    usagePeriods.forEach(period => {
      const date = new Date(period.start_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (key in usageByMonth) {
        usageByMonth[key]++;
      }
    });

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalQuilts,
          totalUsagePeriods,
          totalUsageDays,
          averageUsageDays,
          currentlyInUse: currentUsage.length
        },
        statusDistribution,
        seasonDistribution,
        usageBySeason,
        mostUsedQuilts,
        usageByYear: Object.entries(usageByYear)
          .map(([year, count]) => ({ year: parseInt(year), count }))
          .sort((a, b) => a.year - b.year),
        usageByMonth: Object.entries(usageByMonth)
          .map(([month, count]) => ({ month, count }))
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}