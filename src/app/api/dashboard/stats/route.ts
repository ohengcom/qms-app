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
      // Query usage records from previous years on this same date
      const result = await sql`
        SELECT 
          u.id,
          u.quilt_id as "quiltId",
          u.start_date as "startDate",
          u.end_date as "endDate",
          q.name as "quiltName",
          q.item_number as "itemNumber",
          q.season,
          EXTRACT(YEAR FROM u.start_date) as year
        FROM usage_records u
        JOIN quilts q ON u.quilt_id = q.id
        WHERE 
          TO_CHAR(u.start_date, 'MM-DD') = ${monthDay}
          AND EXTRACT(YEAR FROM u.start_date) < EXTRACT(YEAR FROM CURRENT_DATE)
          AND (u.end_date IS NULL OR u.end_date >= u.start_date)
        ORDER BY u.start_date DESC
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
