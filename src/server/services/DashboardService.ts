import { PrismaClient, Season, QuiltStatus } from '@prisma/client';
import type { DashboardStatsInput, AnalyticsDateRangeInput } from '@/lib/validations/quilt';

export class DashboardService {
  constructor(private db: PrismaClient) {}

  async getDashboardStats(options: DashboardStatsInput = { includeAnalytics: true, includeTrends: false }) {
    const [
      overview,
      distribution,
      topUsedQuilts,
      recentActivity,
      analytics,
    ] = await Promise.all([
      this.getOverviewStats(),
      this.getDistributionStats(),
      this.getTopUsedQuilts(),
      this.getRecentActivity(),
      options.includeAnalytics ? this.getAnalyticsInsights() : null,
    ]);

    return {
      overview,
      distribution,
      topUsedQuilts,
      recentActivity,
      analytics,
      lastUpdated: new Date(),
    };
  }

  async getSeasonalInsights() {
    const currentSeason = this.getCurrentSeason();
    
    const seasonalData = await Promise.all(
      Object.values(Season).map(async (season) => {
        const [quilts, usageStats] = await Promise.all([
          this.db.quilt.findMany({
            where: { season },
            include: {
              currentUsage: true,
              usagePeriods: {
                where: {
                  seasonUsed: season.toLowerCase(),
                },
              },
            },
          }),
          this.getSeasonUsageStats(season),
        ]);

        const totalQuilts = quilts.length;
        const inUse = quilts.filter(q => q.currentUsage).length;
        const available = quilts.filter(q => q.currentStatus === QuiltStatus.AVAILABLE).length;
        const totalUsages = quilts.reduce((sum, q) => sum + q.usagePeriods.length, 0);

        return {
          season,
          totalQuilts,
          inUse,
          available,
          totalUsages,
          averageUsagePerQuilt: totalQuilts > 0 ? totalUsages / totalQuilts : 0,
          isCurrentSeason: season === currentSeason,
          ...usageStats,
        };
      })
    );

    // Get seasonal recommendations
    const recommendations = await this.getSeasonalRecommendations(currentSeason);

    return {
      currentSeason,
      seasonalData,
      recommendations,
      insights: this.generateSeasonalInsights(seasonalData),
    };
  }

  async getMaintenanceInsights() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [
      recentMaintenance,
      upcomingMaintenance,
      maintenanceByType,
      quiltsNeedingMaintenance,
      maintenanceCosts,
    ] = await Promise.all([
      this.getRecentMaintenance(thirtyDaysAgo),
      this.getUpcomingMaintenance(thirtyDaysFromNow),
      this.getMaintenanceByType(),
      this.getQuiltsNeedingMaintenance(),
      this.getMaintenanceCosts(),
    ]);

    return {
      recentMaintenance,
      upcomingMaintenance,
      maintenanceByType,
      quiltsNeedingMaintenance,
      maintenanceCosts,
      summary: {
        recentMaintenanceCount: recentMaintenance.length,
        upcomingMaintenanceCount: upcomingMaintenance.length,
        quiltsNeedingAttention: quiltsNeedingMaintenance.length,
        totalMaintenanceCost: maintenanceCosts.totalCost,
        averageMaintenanceCost: maintenanceCosts.averageCost,
      },
      insights: this.generateMaintenanceInsights(recentMaintenance, upcomingMaintenance, quiltsNeedingMaintenance),
    };
  }

  async getUsageTrends(dateRange: AnalyticsDateRangeInput) {
    const { startDate, endDate } = dateRange;

    const [
      usagePeriods,
      dailyAnalytics,
      seasonalTrends,
    ] = await Promise.all([
      this.getUsagePeriodsInRange(startDate, endDate),
      this.getDailyAnalytics(startDate, endDate),
      this.getSeasonalTrends(startDate, endDate),
    ]);

    const monthlyTrends = this.aggregateMonthlyTrends(usagePeriods);
    const insights = this.generateUsageTrendInsights(monthlyTrends, seasonalTrends);

    return {
      monthlyTrends,
      dailyAnalytics,
      seasonalTrends,
      insights,
      summary: {
        totalUsagePeriods: usagePeriods.length,
        averageUsageDuration: this.calculateAverageUsageDuration(usagePeriods),
        mostActiveMonth: this.findMostActiveMonth(monthlyTrends),
        leastActiveMonth: this.findLeastActiveMonth(monthlyTrends),
      },
    };
  }

  async getInventoryInsights() {
    const [
      inventoryByStatus,
      inventoryBySeason,
      inventoryByLocation,
      inventoryByBrand,
      utilizationStats,
      storageOptimization,
    ] = await Promise.all([
      this.getInventoryByStatus(),
      this.getInventoryBySeason(),
      this.getInventoryByLocation(),
      this.getInventoryByBrand(),
      this.getUtilizationStats(),
      this.getStorageOptimization(),
    ]);

    return {
      inventoryByStatus,
      inventoryBySeason,
      inventoryByLocation,
      inventoryByBrand,
      utilizationStats,
      storageOptimization,
      insights: this.generateInventoryInsights(inventoryByStatus, utilizationStats),
    };
  }

  private async getOverviewStats() {
    const [
      totalQuilts,
      inUseCount,
      availableCount,
      storageCount,
      maintenanceCount,
    ] = await Promise.all([
      this.db.quilt.count(),
      this.db.quilt.count({ where: { currentStatus: QuiltStatus.IN_USE } }),
      this.db.quilt.count({ where: { currentStatus: QuiltStatus.AVAILABLE } }),
      this.db.quilt.count({ where: { currentStatus: QuiltStatus.STORAGE } }),
      this.db.quilt.count({ where: { currentStatus: QuiltStatus.MAINTENANCE } }),
    ]);

    const utilizationRate = totalQuilts > 0 ? (inUseCount / totalQuilts) * 100 : 0;
    const availabilityRate = totalQuilts > 0 ? (availableCount / totalQuilts) * 100 : 0;

    return {
      totalQuilts,
      inUseCount,
      availableCount,
      storageCount,
      maintenanceCount,
      utilizationRate,
      availabilityRate,
    };
  }

  private async getDistributionStats() {
    const [seasonalDist, locationDist, brandDist] = await Promise.all([
      this.db.quilt.groupBy({
        by: ['season'],
        _count: { season: true },
      }),
      this.db.quilt.groupBy({
        by: ['location'],
        _count: { location: true },
        orderBy: { _count: { location: 'desc' } },
        take: 10,
      }),
      this.db.quilt.groupBy({
        by: ['brand'],
        _count: { brand: true },
        where: { brand: { not: null } },
        orderBy: { _count: { brand: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      seasonal: this.formatDistribution(seasonalDist, 'season'),
      location: this.formatDistribution(locationDist, 'location'),
      brand: this.formatDistribution(brandDist, 'brand'),
    };
  }

  private async getTopUsedQuilts() {
    const quilts = await this.db.quilt.findMany({
      include: {
        usagePeriods: true,
        currentUsage: true,
      },
      take: 10,
    });

    return quilts
      .map(quilt => {
        const totalUsageDays = quilt.usagePeriods.reduce((sum, period) => {
          return sum + (period.durationDays || 0);
        }, 0);

        const usageCount = quilt.usagePeriods.length;
        const lastUsedDate = quilt.usagePeriods
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0]?.startDate || null;

        return {
          quilt: {
            id: quilt.id,
            name: quilt.name,
            itemNumber: quilt.itemNumber,
            season: quilt.season,
            currentStatus: quilt.currentStatus,
          },
          stats: {
            totalUsageDays,
            usageCount,
            lastUsedDate,
            averageUsageDuration: usageCount > 0 ? totalUsageDays / usageCount : 0,
            isCurrentlyInUse: !!quilt.currentUsage,
          },
        };
      })
      .sort((a, b) => b.stats.usageCount - a.stats.usageCount)
      .slice(0, 5);
  }

  private async getRecentActivity() {
    const recentUsagePeriods = await this.db.usagePeriod.findMany({
      include: {
        quilt: {
          select: {
            id: true,
            name: true,
            itemNumber: true,
            season: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return recentUsagePeriods.map(period => ({
      id: period.id,
      type: period.endDate ? 'usage_ended' : 'usage_started',
      date: period.endDate || period.startDate,
      quilt: period.quilt,
      duration: period.durationDays,
      usageType: period.usageType,
    }));
  }

  private async getAnalyticsInsights() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [weeklyAnalytics, trends] = await Promise.all([
      this.db.usageAnalytics.findMany({
        where: {
          date: { gte: sevenDaysAgo },
        },
        orderBy: { date: 'asc' },
      }),
      this.calculateUsageTrends(),
    ]);

    return {
      weeklyAnalytics,
      trends,
      insights: this.generateAnalyticsInsights(weeklyAnalytics, trends),
    };
  }

  private async getSeasonUsageStats(season: Season) {
    const usagePeriods = await this.db.usagePeriod.findMany({
      where: {
        quilt: { season },
      },
    });

    const totalDays = usagePeriods.reduce((sum, p) => sum + (p.durationDays || 0), 0);
    const averageDuration = usagePeriods.length > 0 ? totalDays / usagePeriods.length : 0;

    return {
      totalUsagePeriods: usagePeriods.length,
      totalUsageDays: totalDays,
      averageUsageDuration: averageDuration,
    };
  }

  private async getSeasonalRecommendations(season: Season) {
    const quilts = await this.db.quilt.findMany({
      where: {
        season,
        currentStatus: QuiltStatus.AVAILABLE,
      },
      include: {
        usagePeriods: {
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
      take: 3,
    });

    return quilts.map(quilt => {
      const lastUsed = quilt.usagePeriods[0]?.startDate;
      const daysSinceUsed = lastUsed 
        ? Math.ceil((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
        : 365;

      return {
        quilt: {
          id: quilt.id,
          name: quilt.name,
          itemNumber: quilt.itemNumber,
          season: quilt.season,
        },
        daysSinceUsed,
        reason: lastUsed 
          ? `Last used ${daysSinceUsed} days ago`
          : 'Never used - perfect for trying something new',
      };
    });
  }

  private getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1;
    if (month >= 12 || month <= 2) return Season.WINTER;
    if (month >= 6 && month <= 8) return Season.SUMMER;
    return Season.SPRING_AUTUMN;
  }

  private formatDistribution(data: any[], key: string) {
    return data.reduce((acc, item) => {
      const value = item[key];
      if (value) {
        acc[value] = item._count[key];
      }
      return acc;
    }, {} as Record<string, number>);
  }

  private generateSeasonalInsights(seasonalData: any[]) {
    const insights = [];
    
    const currentSeasonData = seasonalData.find(s => s.isCurrentSeason);
    if (currentSeasonData && currentSeasonData.available === 0) {
      insights.push({
        type: 'warning',
        message: `No ${currentSeasonData.season.toLowerCase()} quilts available for current season`,
        priority: 'high',
      });
    }

    const underutilized = seasonalData.filter(s => s.averageUsagePerQuilt < 0.5);
    if (underutilized.length > 0) {
      insights.push({
        type: 'info',
        message: `${underutilized.map(s => s.season).join(', ')} quilts are underutilized`,
        priority: 'medium',
      });
    }

    return insights;
  }

  private generateMaintenanceInsights(recent: any[], upcoming: any[], needingMaintenance: any[]) {
    const insights = [];

    if (upcoming.length > 5) {
      insights.push({
        type: 'warning',
        message: `${upcoming.length} quilts need maintenance in the next 30 days`,
        priority: 'high',
      });
    }

    if (needingMaintenance.length > 0) {
      insights.push({
        type: 'info',
        message: `${needingMaintenance.length} quilts have no maintenance history`,
        priority: 'medium',
      });
    }

    return insights;
  }

  private generateUsageTrendInsights(monthlyTrends: any[], seasonalTrends: any[]) {
    const insights = [];
    
    // Add trend analysis logic here
    const recentMonths = Object.values(monthlyTrends).slice(-3);
    const isDecreasing = recentMonths.every((month: any, i) => 
      i === 0 || month.totalUsages < recentMonths[i - 1].totalUsages
    );

    if (isDecreasing) {
      insights.push({
        type: 'warning',
        message: 'Usage has been decreasing over the last 3 months',
        priority: 'medium',
      });
    }

    return insights;
  }

  private generateAnalyticsInsights(weeklyAnalytics: any[], trends: any) {
    const insights = [];
    
    if (weeklyAnalytics.length > 0) {
      const avgUtilization = weeklyAnalytics.reduce((sum, day) => 
        sum + (day.totalQuiltsInUse / (day.totalQuiltsInUse + day.totalQuiltsAvailable)), 0
      ) / weeklyAnalytics.length;

      if (avgUtilization < 0.3) {
        insights.push({
          type: 'info',
          message: 'Low utilization rate - consider rotating quilts more frequently',
          priority: 'low',
        });
      }
    }

    return insights;
  }

  private generateInventoryInsights(inventoryByStatus: any, utilizationStats: any) {
    const insights = [];
    
    // Add inventory analysis logic
    const storagePercentage = (inventoryByStatus.storage / inventoryByStatus.total) * 100;
    
    if (storagePercentage > 50) {
      insights.push({
        type: 'info',
        message: 'Over 50% of quilts are in storage - consider seasonal rotation',
        priority: 'medium',
      });
    }

    return insights;
  }

  // Additional helper methods would be implemented here...
  private async getRecentMaintenance(since: Date) { return []; }
  private async getUpcomingMaintenance(until: Date) { return []; }
  private async getMaintenanceByType() { return {}; }
  private async getQuiltsNeedingMaintenance() { return []; }
  private async getMaintenanceCosts() { return { totalCost: 0, averageCost: 0 }; }
  private async getUsagePeriodsInRange(start: Date, end: Date) { return []; }
  private async getDailyAnalytics(start: Date, end: Date) { return []; }
  private async getSeasonalTrends(start: Date, end: Date) { return []; }
  private async getInventoryByStatus() { return {}; }
  private async getInventoryBySeason() { return {}; }
  private async getInventoryByLocation() { return {}; }
  private async getInventoryByBrand() { return {}; }
  private async getUtilizationStats() { return {}; }
  private async getStorageOptimization() { return {}; }
  private async calculateUsageTrends() { return {}; }
  private aggregateMonthlyTrends(periods: any[]) { return []; }
  private calculateAverageUsageDuration(periods: any[]) { return 0; }
  private findMostActiveMonth(trends: any[]) { return null; }
  private findLeastActiveMonth(trends: any[]) { return null; }
}