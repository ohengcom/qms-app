/**
 * Dashboard REST API - Statistics and Overview
 *
 * GET /api/dashboard - Get comprehensive dashboard statistics
 *
 * Requirements: 1.2, 1.3 - REST API for dashboard
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
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
    // Get total quilts count
    const totalQuilts = await quiltRepository.count();

    // Get all quilts to calculate status counts
    const allQuilts = await quiltRepository.findAll({ limit: 1000 });

    // Calculate status counts
    const inUseCount = allQuilts.filter(q => q.currentStatus === 'IN_USE').length;
    const storageCount = allQuilts.filter(q => q.currentStatus === 'STORAGE').length;
    const maintenanceCount = allQuilts.filter(q => q.currentStatus === 'MAINTENANCE').length;

    // Calculate seasonal distribution
    const seasonalStats = {
      WINTER: allQuilts.filter(q => q.season === 'WINTER').length,
      SPRING_AUTUMN: allQuilts.filter(q => q.season === 'SPRING_AUTUMN').length,
      SUMMER: allQuilts.filter(q => q.season === 'SUMMER').length,
    };

    // Get quilts currently in use with their details
    const inUseQuilts = allQuilts
      .filter(q => q.currentStatus === 'IN_USE')
      .map(q => ({
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
            (EXTRACT(MONTH FROM up.start_date) < ${currentMonth} OR 
             (EXTRACT(MONTH FROM up.start_date) = ${currentMonth} AND EXTRACT(DAY FROM up.start_date) <= ${currentDay}))
            AND
            (up.end_date IS NULL OR 
             EXTRACT(MONTH FROM up.end_date) > ${currentMonth} OR 
             (EXTRACT(MONTH FROM up.end_date) = ${currentMonth} AND EXTRACT(DAY FROM up.end_date) >= ${currentDay}))
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
