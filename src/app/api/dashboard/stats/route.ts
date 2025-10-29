import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/neon';

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

    // Get quilts currently in use with their details
    const inUseQuilts = quilts.filter(q => q.currentStatus === 'IN_USE');

    // Get historical usage data for this day in previous years
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let historicalUsage: any[] = [];
    try {
      // Query usage periods from previous years on this same date
      // Check if the usage period includes today's month-day in previous years
      const result = await sql`
        SELECT 
          up.id,
          up.quilt_id as "quiltId",
          up.start_date as "startDate",
          up.end_date as "endDate",
          q.name as "quiltName",
          q.item_number as "itemNumber",
          q.season,
          EXTRACT(YEAR FROM up.start_date) as year
        FROM usage_periods up
        JOIN quilts q ON up.quilt_id = q.id
        WHERE 
          TO_CHAR(up.start_date, 'MM-DD') = ${monthDay}
          AND EXTRACT(YEAR FROM up.start_date) < EXTRACT(YEAR FROM CURRENT_DATE)
          AND (up.end_date IS NULL OR up.end_date >= up.start_date)
        ORDER BY up.start_date DESC
        LIMIT 20
      `;

      historicalUsage = result.map((row: any) => ({
        id: row.id,
        quiltId: row.quiltId,
        quiltName: row.quiltName,
        itemNumber: row.itemNumber,
        season: row.season,
        startDate: row.startDate,
        endDate: row.endDate,
        year: parseInt(row.year),
      }));

      console.log(`Found ${historicalUsage.length} historical usage records for ${monthDay}`);
    } catch (error) {
      console.error('Error fetching historical usage:', error);
      // Continue without historical data if query fails
    }

    return NextResponse.json({
      overview: {
        totalQuilts: total,
        ...statusCounts,
      },
      seasonalDistribution,
      inUseQuilts: inUseQuilts.map(q => ({
        id: q.id,
        name: q.name,
        itemNumber: q.itemNumber,
        season: q.season,
        fillMaterial: q.fillMaterial,
        weightGrams: q.weightGrams,
        location: q.location,
      })),
      historicalUsage,
      date: {
        today: today.toISOString(),
        monthDay,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
