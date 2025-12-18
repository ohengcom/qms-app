/**
 * Dashboard REST API - Statistics and Overview
 *
 * GET /api/dashboard - Get comprehensive dashboard statistics
 *
 * Requirements: 1.2, 1.3 - REST API for dashboard
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { dbLogger } from '@/lib/logger';

/**
 * GET /api/dashboard
 *
 * Get comprehensive dashboard statistics including:
 * - Overview counts (total quilts, in use, storage, maintenance)
 * - Seasonal distribution
 * - Quilts currently in use
 * - Historical usage data for this day in previous years
 */
export async function GET() {
  try {
    // Use database-level COUNT queries for efficiency (Requirements: 6.3)
    const [statusCounts, seasonalCounts, inUseQuiltsResult] = await Promise.all([
      // Get status counts using database COUNT
      sql`
        SELECT 
          current_status,
          COUNT(*)::int as count
        FROM quilts
        GROUP BY current_status
      `,
      // Get seasonal distribution using database COUNT
      sql`
        SELECT 
          season,
          COUNT(*)::int as count
        FROM quilts
        GROUP BY season
      `,
      // Get quilts currently in use with their details
      sql`
        SELECT 
          id, name, item_number as "itemNumber", season, 
          fill_material as "fillMaterial", weight_grams as "weightGrams", location
        FROM quilts
        WHERE current_status = 'IN_USE'
      `,
    ]);

    // Parse status counts
    const statusMap: Record<string, number> = {};
    statusCounts.forEach((row: any) => {
      statusMap[row.current_status] = row.count;
    });
    const totalQuilts = Object.values(statusMap).reduce((sum, count) => sum + count, 0);
    const inUseCount = statusMap['IN_USE'] || 0;
    const storageCount = statusMap['STORAGE'] || 0;
    const maintenanceCount = statusMap['MAINTENANCE'] || 0;

    // Parse seasonal distribution
    const seasonalStats = {
      WINTER: 0,
      SPRING_AUTUMN: 0,
      SUMMER: 0,
    };
    seasonalCounts.forEach((row: any) => {
      if (row.season in seasonalStats) {
        seasonalStats[row.season as keyof typeof seasonalStats] = row.count;
      }
    });

    // Map in-use quilts
    const inUseQuilts = inUseQuiltsResult.map((q: any) => ({
      id: q.id,
      name: q.name,
      itemNumber: q.itemNumber,
      season: q.season,
      fillMaterial: q.fillMaterial,
      weightGrams: q.weightGrams,
      location: q.location,
    }));

    // Get historical usage data for this day in previous years
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const monthDay = `${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

    let historicalUsage: any[] = [];
    try {
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
        FROM usage_records up
        JOIN quilts q ON up.quilt_id = q.id
        WHERE 
          EXTRACT(YEAR FROM up.start_date) < EXTRACT(YEAR FROM CURRENT_DATE)
          AND (
            CASE 
              -- CASE 1: Standard range (e.g., April to Oct: 0401 <= 1218 AND 1218 <= 1031) -- always false if start > end
              WHEN (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date)) <= (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date)) THEN
                (${currentMonth} * 100 + ${currentDay}) >= (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date))
                AND (${currentMonth} * 100 + ${currentDay}) <= (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date))
              
              -- CASE 2: Wrapping range (e.g., Nov to April: 1101 to 0430)
              WHEN (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date)) > (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date)) THEN
                (${currentMonth} * 100 + ${currentDay}) >= (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date))
                OR (${currentMonth} * 100 + ${currentDay}) <= (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date))
              
              -- CASE 3: No end date (still in use at that historical time? typically we'd look at start date onwards)
              ELSE 
                (${currentMonth} * 100 + ${currentDay}) >= (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date))
            END
          )
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
    } catch {
      // Continue without historical data if query fails
      dbLogger.warn('Failed to fetch historical usage data');
    }

    // Get recent activity and top used quilts - simplified for now
    const recentActivity: any[] = [];
    const topUsedWithStats: any[] = [];

    const result = {
      overview: {
        totalQuilts,
        inUseCount,
        storageCount,
        maintenanceCount,
      },
      distribution: {
        seasonal: seasonalStats,
        location: {},
        brand: {},
      },
      topUsedQuilts: topUsedWithStats,
      recentActivity,
      inUseQuilts,
      historicalUsage,
      date: {
        today: today.toISOString(),
        monthDay,
      },
      lastUpdated: new Date(),
    };

    return NextResponse.json(result);
  } catch (error) {
    dbLogger.error('Failed to fetch dashboard stats', { error });

    // Return fallback data instead of error
    return NextResponse.json({
      overview: {
        totalQuilts: 0,
        inUseCount: 0,
        storageCount: 0,
        maintenanceCount: 0,
      },
      distribution: {
        seasonal: { WINTER: 0, SPRING_AUTUMN: 0, SUMMER: 0 },
        location: {},
        brand: {},
      },
      topUsedQuilts: [],
      recentActivity: [],
      inUseQuilts: [],
      historicalUsage: [],
      date: {
        today: new Date().toISOString(),
        monthDay: '',
      },
      lastUpdated: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
