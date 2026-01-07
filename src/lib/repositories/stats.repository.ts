/**
 * Stats Repository
 *
 * Handles all database operations for statistics, analytics, and reports.
 * This repository centralizes all statistical queries to ensure consistent
 * data access patterns and proper error handling.
 *
 * Requirements: 6.1, 6.2 - Repository pattern for all database operations
 */

import { sql } from '@/lib/neon';
import { BaseRepositoryImpl } from './base.repository';

// Types for dashboard statistics
export interface StatusCounts {
  inUse: number;
  storage: number;
  maintenance: number;
  total: number;
}

export interface SeasonalCounts {
  WINTER: number;
  SPRING_AUTUMN: number;
  SUMMER: number;
}

export interface InUseQuilt {
  id: string;
  name: string;
  itemNumber: number;
  season: string;
  fillMaterial: string;
  weightGrams: number;
  location: string;
}

export interface HistoricalUsage {
  id: string;
  quiltId: string;
  quiltName: string;
  itemNumber: number;
  season: string;
  startDate: Date;
  endDate: Date | null;
  year: number;
}

export interface DashboardStats {
  statusCounts: StatusCounts;
  seasonalCounts: SeasonalCounts;
  inUseQuilts: InUseQuilt[];
  historicalUsage: HistoricalUsage[];
}

// Types for analytics
export interface UsageStats {
  totalPeriods: number;
  totalDays: number;
  avgDays: number;
}

export interface MostUsedQuilt {
  quiltId: string;
  name: string;
  usageCount: number;
  totalDays: number;
  averageDays: number;
}

export interface UsageByPeriod {
  period: string;
  count: number;
}

export interface AnalyticsData {
  overview: {
    totalQuilts: number;
    totalUsagePeriods: number;
    totalUsageDays: number;
    averageUsageDays: number;
    currentlyInUse: number;
  };
  statusDistribution: StatusCounts;
  seasonDistribution: SeasonalCounts;
  usageBySeason: SeasonalCounts;
  mostUsedQuilts: MostUsedQuilt[];
  usageByYear: UsageByPeriod[];
  usageByMonth: UsageByPeriod[];
}

// Types for reports
export interface QuiltReportItem {
  itemNumber: number;
  name: string;
  season: string;
  dimensions: string;
  weight: string;
  material: string;
  color: string;
  brand: string | null;
  location: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryReport {
  summary: {
    totalQuilts: number;
    byStatus: { inUse: number; storage: number; maintenance: number };
    bySeason: { winter: number; springAutumn: number; summer: number };
  };
  quilts: QuiltReportItem[];
}

export interface UsageReportItem {
  quiltName: string;
  itemNumber: number;
  season: string;
  startDate: Date;
  endDate: Date | null;
  durationDays: number | null;
  usageType: string;
  notes: string | null;
}

export interface CurrentUsageItem {
  quiltName: string;
  itemNumber: number;
  season: string;
  startedAt: Date;
  usageType: string;
  notes: string | null;
  daysInUse: number;
}

export interface UsageReport {
  summary: {
    totalUsagePeriods: number;
    currentlyInUse: number;
    totalUsageDays: number;
    averageUsageDays: number;
  };
  usagePeriods: UsageReportItem[];
  currentUsage: CurrentUsageItem[];
}

export interface StatusReportItem {
  itemNumber: number;
  name: string;
  status: string;
  season: string;
  location: string;
  lastUpdated: Date;
  usageStarted: Date | null;
  daysInCurrentStatus: number | null;
}

export interface StatusReport {
  summary: { inUse: number; storage: number; maintenance: number };
  quilts: StatusReportItem[];
}

/**
 * Stats Repository - handles all statistical database queries
 */
export class StatsRepository extends BaseRepositoryImpl<never, never> {
  protected tableName = 'quilts';

  protected rowToModel(_row: never): never {
    throw new Error('Not implemented - StatsRepository uses custom queries');
  }

  protected modelToRow(_model: never): never {
    throw new Error('Not implemented - StatsRepository uses custom queries');
  }

  /**
   * Get status counts for quilts
   */
  async getStatusCounts(): Promise<StatusCounts> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT 
          current_status,
          COUNT(*)::int as count
        FROM quilts
        GROUP BY current_status
      `) as { current_status: string; count: number }[];

      const counts: StatusCounts = { inUse: 0, storage: 0, maintenance: 0, total: 0 };
      result.forEach(row => {
        if (row.current_status === 'IN_USE') counts.inUse = row.count;
        else if (row.current_status === 'STORAGE') counts.storage = row.count;
        else if (row.current_status === 'MAINTENANCE') counts.maintenance = row.count;
        counts.total += row.count;
      });

      return counts;
    }, 'getStatusCounts');
  }

  /**
   * Get seasonal distribution counts
   */
  async getSeasonalCounts(): Promise<SeasonalCounts> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT 
          season,
          COUNT(*)::int as count
        FROM quilts
        GROUP BY season
      `) as { season: string; count: number }[];

      const counts: SeasonalCounts = { WINTER: 0, SPRING_AUTUMN: 0, SUMMER: 0 };
      result.forEach(row => {
        if (row.season in counts) {
          counts[row.season as keyof SeasonalCounts] = row.count;
        }
      });

      return counts;
    }, 'getSeasonalCounts');
  }

  /**
   * Get quilts currently in use with their details
   */
  async getInUseQuilts(): Promise<InUseQuilt[]> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT 
          id, name, item_number, season, 
          fill_material, weight_grams, location
        FROM quilts
        WHERE current_status = 'IN_USE'
      `) as any[];

      return result.map(q => ({
        id: q.id,
        name: q.name,
        itemNumber: q.item_number,
        season: q.season,
        fillMaterial: q.fill_material,
        weightGrams: q.weight_grams,
        location: q.location,
      }));
    }, 'getInUseQuilts');
  }

  /**
   * Get historical usage data for this day in previous years
   */
  async getHistoricalUsage(currentMonth: number, currentDay: number): Promise<HistoricalUsage[]> {
    return this.executeQuery(
      async () => {
        const result = (await sql`
          SELECT 
            up.id,
            up.quilt_id,
            up.start_date,
            up.end_date,
            q.name as quilt_name,
            q.item_number,
            q.season,
            EXTRACT(YEAR FROM up.start_date) as year
          FROM usage_records up
          JOIN quilts q ON up.quilt_id = q.id
          WHERE 
            EXTRACT(YEAR FROM up.start_date) < EXTRACT(YEAR FROM CURRENT_DATE)
            AND (
              CASE 
                WHEN (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date)) <= (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date)) THEN
                  (${currentMonth} * 100 + ${currentDay}) >= (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date))
                  AND (${currentMonth} * 100 + ${currentDay}) <= (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date))
                WHEN (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date)) > (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date)) THEN
                  (${currentMonth} * 100 + ${currentDay}) >= (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date))
                  OR (${currentMonth} * 100 + ${currentDay}) <= (EXTRACT(MONTH FROM up.end_date) * 100 + EXTRACT(DAY FROM up.end_date))
                ELSE 
                  (${currentMonth} * 100 + ${currentDay}) >= (EXTRACT(MONTH FROM up.start_date) * 100 + EXTRACT(DAY FROM up.start_date))
              END
            )
          ORDER BY up.start_date DESC
          LIMIT 20
        `) as any[];

        return result.map(row => ({
          id: row.id,
          quiltId: row.quilt_id,
          quiltName: row.quilt_name,
          itemNumber: row.item_number,
          season: row.season,
          startDate: new Date(row.start_date),
          endDate: row.end_date ? new Date(row.end_date) : null,
          year: parseInt(row.year),
        }));
      },
      'getHistoricalUsage',
      { currentMonth, currentDay }
    );
  }

  /**
   * Get complete dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.executeQuery(async () => {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      const [statusCounts, seasonalCounts, inUseQuilts] = await Promise.all([
        this.getStatusCounts(),
        this.getSeasonalCounts(),
        this.getInUseQuilts(),
      ]);

      let historicalUsage: HistoricalUsage[] = [];
      try {
        historicalUsage = await this.getHistoricalUsage(currentMonth, currentDay);
      } catch {
        // Continue without historical data if query fails
      }

      return {
        statusCounts,
        seasonalCounts,
        inUseQuilts,
        historicalUsage,
      };
    }, 'getDashboardStats');
  }

  /**
   * Get usage statistics (total periods, total days, average days)
   */
  async getUsageStats(): Promise<UsageStats> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT 
          COUNT(*)::int as total_periods,
          COALESCE(SUM(
            CASE
              WHEN end_date IS NOT NULL
              THEN EXTRACT(DAY FROM (end_date::timestamp - start_date::timestamp))
              ELSE 0
            END
          ), 0)::int as total_days,
          COALESCE(AVG(
            CASE
              WHEN end_date IS NOT NULL
              THEN EXTRACT(DAY FROM (end_date::timestamp - start_date::timestamp))
              ELSE NULL
            END
          ), 0)::int as avg_days
        FROM usage_records
      `) as [{ total_periods: number; total_days: number; avg_days: number }];

      return {
        totalPeriods: result[0]?.total_periods || 0,
        totalDays: result[0]?.total_days || 0,
        avgDays: result[0]?.avg_days || 0,
      };
    }, 'getUsageStats');
  }

  /**
   * Get usage counts by season
   */
  async getUsageBySeason(): Promise<SeasonalCounts> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT 
          q.season,
          COUNT(*)::int as count
        FROM usage_records up
        JOIN quilts q ON up.quilt_id = q.id
        GROUP BY q.season
      `) as { season: string; count: number }[];

      const counts: SeasonalCounts = { WINTER: 0, SPRING_AUTUMN: 0, SUMMER: 0 };
      result.forEach(row => {
        if (row.season in counts) {
          counts[row.season as keyof SeasonalCounts] = row.count;
        }
      });

      return counts;
    }, 'getUsageBySeason');
  }

  /**
   * Get most used quilts
   */
  async getMostUsedQuilts(limit: number = 5): Promise<MostUsedQuilt[]> {
    return this.executeQuery(
      async () => {
        const result = (await sql`
          SELECT 
            up.quilt_id,
            q.name,
            COUNT(*)::int as usage_count,
            COALESCE(SUM(
              CASE
                WHEN up.end_date IS NOT NULL
                THEN EXTRACT(DAY FROM (up.end_date::timestamp - up.start_date::timestamp))
                ELSE 0
              END
            ), 0)::int as total_days
          FROM usage_records up
          JOIN quilts q ON up.quilt_id = q.id
          GROUP BY up.quilt_id, q.name
          ORDER BY usage_count DESC
          LIMIT ${limit}
        `) as any[];

        return result.map(row => ({
          quiltId: row.quilt_id,
          name: row.name,
          usageCount: row.usage_count,
          totalDays: row.total_days,
          averageDays: row.usage_count > 0 ? Math.round(row.total_days / row.usage_count) : 0,
        }));
      },
      'getMostUsedQuilts',
      { limit }
    );
  }

  /**
   * Get usage by year
   */
  async getUsageByYear(): Promise<UsageByPeriod[]> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT 
          EXTRACT(YEAR FROM start_date)::int as year,
          COUNT(*)::int as count
        FROM usage_records
        GROUP BY EXTRACT(YEAR FROM start_date)
        ORDER BY year
      `) as { year: number; count: number }[];

      return result.map(row => ({
        period: String(row.year),
        count: row.count,
      }));
    }, 'getUsageByYear');
  }

  /**
   * Get usage by month (last 12 months)
   */
  async getUsageByMonth(): Promise<UsageByPeriod[]> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT 
          TO_CHAR(start_date, 'YYYY-MM') as month,
          COUNT(*)::int as count
        FROM usage_records
        WHERE start_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')
        GROUP BY TO_CHAR(start_date, 'YYYY-MM')
        ORDER BY month
      `) as { month: string; count: number }[];

      // Build complete 12-month map with zeros for missing months
      const usageByMonthMap: { [key: string]: number } = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        usageByMonthMap[key] = 0;
      }
      result.forEach(row => {
        if (row.month in usageByMonthMap) {
          usageByMonthMap[row.month] = row.count;
        }
      });

      return Object.entries(usageByMonthMap).map(([month, count]) => ({
        period: month,
        count,
      }));
    }, 'getUsageByMonth');
  }

  /**
   * Get current usage count (active usage records)
   */
  async getCurrentUsageCount(): Promise<number> {
    return this.executeQuery(async () => {
      const result = (await sql`
        SELECT COUNT(*)::int as count 
        FROM usage_records 
        WHERE end_date IS NULL
      `) as [{ count: number }];

      return result[0]?.count || 0;
    }, 'getCurrentUsageCount');
  }

  /**
   * Get complete analytics data
   */
  async getAnalyticsData(): Promise<AnalyticsData> {
    return this.executeQuery(async () => {
      const [
        statusCounts,
        seasonalCounts,
        usageStats,
        usageBySeason,
        mostUsedQuilts,
        usageByYear,
        usageByMonth,
        currentUsageCount,
      ] = await Promise.all([
        this.getStatusCounts(),
        this.getSeasonalCounts(),
        this.getUsageStats(),
        this.getUsageBySeason(),
        this.getMostUsedQuilts(),
        this.getUsageByYear(),
        this.getUsageByMonth(),
        this.getCurrentUsageCount(),
      ]);

      return {
        overview: {
          totalQuilts: statusCounts.total,
          totalUsagePeriods: usageStats.totalPeriods,
          totalUsageDays: usageStats.totalDays,
          averageUsageDays: usageStats.avgDays,
          currentlyInUse: currentUsageCount,
        },
        statusDistribution: statusCounts,
        seasonDistribution: seasonalCounts,
        usageBySeason,
        mostUsedQuilts,
        usageByYear,
        usageByMonth,
      };
    }, 'getAnalyticsData');
  }

  /**
   * Get inventory report data
   */
  async getInventoryReport(): Promise<InventoryReport> {
    return this.executeQuery(async () => {
      const [quilts, statusCounts, seasonCounts] = await Promise.all([
        sql`
          SELECT 
            q.id,
            q.item_number,
            q.name,
            q.season,
            q.length_cm,
            q.width_cm,
            q.weight_grams,
            q.fill_material,
            q.color,
            q.brand,
            q.location,
            q.current_status,
            q.notes,
            q.created_at,
            q.updated_at
          FROM quilts q
          ORDER BY q.item_number
        `,
        sql`
          SELECT 
            current_status,
            COUNT(*)::int as count
          FROM quilts
          GROUP BY current_status
        `,
        sql`
          SELECT 
            season,
            COUNT(*)::int as count
          FROM quilts
          GROUP BY season
        `,
      ]);

      // Parse status counts
      const byStatus = { inUse: 0, storage: 0, maintenance: 0 };
      (statusCounts as any[]).forEach(row => {
        if (row.current_status === 'IN_USE') byStatus.inUse = row.count;
        else if (row.current_status === 'STORAGE') byStatus.storage = row.count;
        else if (row.current_status === 'MAINTENANCE') byStatus.maintenance = row.count;
      });

      // Parse season counts
      const bySeason = { winter: 0, springAutumn: 0, summer: 0 };
      (seasonCounts as any[]).forEach(row => {
        if (row.season === 'WINTER') bySeason.winter = row.count;
        else if (row.season === 'SPRING_AUTUMN') bySeason.springAutumn = row.count;
        else if (row.season === 'SUMMER') bySeason.summer = row.count;
      });

      return {
        summary: {
          totalQuilts: (quilts as any[]).length,
          byStatus,
          bySeason,
        },
        quilts: (quilts as any[]).map(q => ({
          itemNumber: q.item_number,
          name: q.name,
          season: q.season,
          dimensions: `${q.length_cm}×${q.width_cm}cm`,
          weight: `${q.weight_grams}g`,
          material: q.fill_material,
          color: q.color,
          brand: q.brand,
          location: q.location,
          status: q.current_status,
          notes: q.notes,
          createdAt: new Date(q.created_at),
          updatedAt: new Date(q.updated_at),
        })),
      };
    }, 'getInventoryReport');
  }

  /**
   * Get usage report data
   */
  async getUsageReport(): Promise<UsageReport> {
    return this.executeQuery(async () => {
      const [usageRecords, usageStats] = await Promise.all([
        sql`
          SELECT 
            ur.id,
            ur.quilt_id,
            ur.start_date,
            ur.end_date,
            ur.usage_type,
            ur.notes,
            q.name as quilt_name,
            q.item_number,
            q.season,
            CASE
              WHEN ur.end_date IS NOT NULL THEN 
                EXTRACT(DAY FROM (ur.end_date::timestamp - ur.start_date::timestamp))
              ELSE NULL
            END as duration_days
          FROM usage_records ur
          JOIN quilts q ON ur.quilt_id = q.id
          ORDER BY ur.start_date DESC
        `,
        sql`
          SELECT 
            COUNT(*)::int as total_periods,
            COALESCE(SUM(
              CASE
                WHEN end_date IS NOT NULL
                THEN EXTRACT(DAY FROM (end_date::timestamp - start_date::timestamp))
                ELSE 0
              END
            ), 0)::int as total_days,
            COALESCE(AVG(
              CASE
                WHEN end_date IS NOT NULL
                THEN EXTRACT(DAY FROM (end_date::timestamp - start_date::timestamp))
                ELSE NULL
              END
            ), 0)::int as avg_days
          FROM usage_records
        `,
      ]);

      const stats = (usageStats as any[])[0] || { total_periods: 0, total_days: 0, avg_days: 0 };
      const records = usageRecords as any[];

      // Separate active and completed records
      const activeRecords = records.filter(r => !r.end_date);
      const completedRecords = records.filter(r => r.end_date);

      return {
        summary: {
          totalUsagePeriods: stats.total_periods,
          currentlyInUse: activeRecords.length,
          totalUsageDays: stats.total_days,
          averageUsageDays: stats.avg_days,
        },
        usagePeriods: completedRecords.map(p => ({
          quiltName: p.quilt_name,
          itemNumber: p.item_number,
          season: p.season,
          startDate: new Date(p.start_date),
          endDate: p.end_date ? new Date(p.end_date) : null,
          durationDays: p.duration_days ? Math.floor(p.duration_days) : null,
          usageType: p.usage_type,
          notes: p.notes,
        })),
        currentUsage: activeRecords.map(c => ({
          quiltName: c.quilt_name,
          itemNumber: c.item_number,
          season: c.season,
          startedAt: new Date(c.start_date),
          usageType: c.usage_type,
          notes: c.notes,
          daysInUse: Math.floor(
            (new Date().getTime() - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      };
    }, 'getUsageReport');
  }

  /**
   * Get analytics report data
   */
  async getAnalyticsReport(): Promise<{
    inventory: {
      total: number;
      statusDistribution: { inUse: number; storage: number; maintenance: number };
      seasonDistribution: { winter: number; springAutumn: number; summer: number };
    };
    usage: {
      totalPeriods: number;
      totalDays: number;
      averageDays: number;
      bySeason: { winter: number; springAutumn: number; summer: number };
    };
  }> {
    return this.executeQuery(async () => {
      const [statusCounts, seasonCounts, usageStats, usageBySeason] = await Promise.all([
        this.getStatusCounts(),
        this.getSeasonalCounts(),
        this.getUsageStats(),
        this.getUsageBySeason(),
      ]);

      return {
        inventory: {
          total: statusCounts.total,
          statusDistribution: {
            inUse: statusCounts.inUse,
            storage: statusCounts.storage,
            maintenance: statusCounts.maintenance,
          },
          seasonDistribution: {
            winter: seasonCounts.WINTER,
            springAutumn: seasonCounts.SPRING_AUTUMN,
            summer: seasonCounts.SUMMER,
          },
        },
        usage: {
          totalPeriods: usageStats.totalPeriods,
          totalDays: usageStats.totalDays,
          averageDays: usageStats.avgDays,
          bySeason: {
            winter: usageBySeason.WINTER,
            springAutumn: usageBySeason.SPRING_AUTUMN,
            summer: usageBySeason.SUMMER,
          },
        },
      };
    }, 'getAnalyticsReport');
  }

  /**
   * Get status report data
   */
  async getStatusReport(): Promise<StatusReport> {
    return this.executeQuery(async () => {
      const [quilts, statusCounts] = await Promise.all([
        sql`
          SELECT 
            q.item_number,
            q.name,
            q.current_status,
            q.season,
            q.location,
            q.updated_at,
            ur.start_date as usage_started
          FROM quilts q
          LEFT JOIN usage_records ur ON q.id = ur.quilt_id AND ur.end_date IS NULL
          ORDER BY q.current_status, q.item_number
        `,
        sql`
          SELECT 
            current_status,
            COUNT(*)::int as count
          FROM quilts
          GROUP BY current_status
        `,
      ]);

      // Parse status counts
      const summary = { inUse: 0, storage: 0, maintenance: 0 };
      (statusCounts as any[]).forEach(row => {
        if (row.current_status === 'IN_USE') summary.inUse = row.count;
        else if (row.current_status === 'STORAGE') summary.storage = row.count;
        else if (row.current_status === 'MAINTENANCE') summary.maintenance = row.count;
      });

      return {
        summary,
        quilts: (quilts as any[]).map(q => ({
          itemNumber: q.item_number,
          name: q.name,
          status: q.current_status,
          season: q.season,
          location: q.location,
          lastUpdated: new Date(q.updated_at),
          usageStarted: q.usage_started ? new Date(q.usage_started) : null,
          daysInCurrentStatus: q.usage_started
            ? Math.floor(
                (new Date().getTime() - new Date(q.usage_started).getTime()) / (1000 * 60 * 60 * 24)
              )
            : null,
        })),
      };
    }, 'getStatusReport');
  }

  /**
   * Get simple usage stats (total and active counts)
   */
  async getSimpleUsageStats(): Promise<{ total: number; active: number; completed: number }> {
    return this.executeQuery(async () => {
      const [totalResult, activeResult] = await Promise.all([
        sql`SELECT COUNT(*)::int as count FROM usage_records`,
        sql`SELECT COUNT(*)::int as count FROM usage_records WHERE end_date IS NULL`,
      ]);

      const total = (totalResult as any[])[0]?.count || 0;
      const active = (activeResult as any[])[0]?.count || 0;

      return {
        total,
        active,
        completed: total - active,
      };
    }, 'getSimpleUsageStats');
  }
}

// Export singleton instance
export const statsRepository = new StatsRepository();
