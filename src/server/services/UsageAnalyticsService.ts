import { PrismaClient, Season, UsageType } from '@prisma/client';
import type { 
  CreateCurrentUsageInput, 
  EndCurrentUsageInput,
  AnalyticsDateRangeInput 
} from '@/lib/validations/quilt';
import { TRPCError } from '@trpc/server';

export class UsageAnalyticsService {
  constructor(private db: PrismaClient) {}

  async startUsage(data: CreateCurrentUsageInput) {
    // Validate quilt availability
    const quilt = await this.db.quilt.findUnique({
      where: { id: data.quiltId },
      include: { currentUsage: true },
    });

    if (!quilt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Quilt not found',
      });
    }

    if (quilt.currentUsage) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Quilt is already in use',
      });
    }

    if (quilt.currentStatus !== 'AVAILABLE') {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Quilt is not available for use',
      });
    }

    // Start usage transaction
    const [currentUsage] = await this.db.$transaction([
      this.db.currentUsage.create({
        data,
      }),
      this.db.quilt.update({
        where: { id: data.quiltId },
        data: { currentStatus: 'IN_USE' },
      }),
    ]);

    return currentUsage;
  }

  async endUsage(data: EndCurrentUsageInput) {
    const { id, endDate = new Date(), notes } = data;

    const currentUsage = await this.db.currentUsage.findUnique({
      where: { id },
    });

    if (!currentUsage) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Current usage record not found',
      });
    }

    // Calculate duration and determine season
    const durationDays = Math.ceil(
      (endDate.getTime() - currentUsage.startedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const seasonUsed = this.determineSeason(currentUsage.startedAt);

    // End usage transaction
    const [usagePeriod] = await this.db.$transaction([
      this.db.usagePeriod.create({
        data: {
          quiltId: currentUsage.quiltId,
          startDate: currentUsage.startedAt,
          endDate,
          seasonUsed,
          usageType: currentUsage.usageType,
          durationDays,
          notes: notes || currentUsage.notes,
        },
      }),
      this.db.currentUsage.delete({
        where: { id },
      }),
      this.db.quilt.update({
        where: { id: currentUsage.quiltId },
        data: { currentStatus: 'AVAILABLE' },
      }),
    ]);

    // Update analytics
    await this.updateDailyAnalytics(endDate);

    return usagePeriod;
  }

  async getCurrentUsage() {
    return this.db.currentUsage.findMany({
      include: {
        quilt: {
          select: {
            id: true,
            name: true,
            itemNumber: true,
            season: true,
            color: true,
            location: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getUsageHistory(quiltId: string, take = 10) {
    return this.db.usagePeriod.findMany({
      where: { quiltId },
      orderBy: { startDate: 'desc' },
      take,
    });
  }

  async getUsageTrends(dateRange: AnalyticsDateRangeInput) {
    const { startDate, endDate } = dateRange;

    const usagePeriods = await this.db.usagePeriod.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        quilt: {
          select: {
            season: true,
            weightGrams: true,
          },
        },
      },
    });

    // Group by month
    const monthlyTrends = this.groupUsageByMonth(usagePeriods);
    
    // Calculate seasonal patterns
    const seasonalPatterns = this.analyzeSeasonalPatterns(usagePeriods);
    
    // Calculate usage efficiency
    const efficiencyMetrics = this.calculateUsageEfficiency(usagePeriods);

    return {
      monthlyTrends,
      seasonalPatterns,
      efficiencyMetrics,
      totalPeriods: usagePeriods.length,
    };
  }

  async getQuiltUsageStats(quiltId: string) {
    const [quilt, usagePeriods, currentUsage] = await Promise.all([
      this.db.quilt.findUnique({
        where: { id: quiltId },
        select: {
          id: true,
          name: true,
          itemNumber: true,
          season: true,
          createdAt: true,
        },
      }),
      this.db.usagePeriod.findMany({
        where: { quiltId },
        orderBy: { startDate: 'desc' },
      }),
      this.db.currentUsage.findUnique({
        where: { quiltId },
      }),
    ]);

    if (!quilt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Quilt not found',
      });
    }

    const totalUsageDays = usagePeriods.reduce((sum, period) => {
      return sum + (period.durationDays || 0);
    }, 0);

    const averageUsageDuration = usagePeriods.length > 0 
      ? totalUsageDays / usagePeriods.length 
      : 0;

    const lastUsedDate = usagePeriods[0]?.startDate || null;
    const daysSinceLastUse = lastUsedDate 
      ? Math.ceil((Date.now() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate usage frequency (uses per year)
    const daysSinceCreated = Math.ceil(
      (Date.now() - quilt.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const usageFrequency = (usagePeriods.length / daysSinceCreated) * 365;

    // Seasonal usage breakdown
    const seasonalUsage = usagePeriods.reduce((acc, period) => {
      const season = period.seasonUsed || 'unknown';
      acc[season] = (acc[season] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      quilt,
      stats: {
        totalUsages: usagePeriods.length,
        totalUsageDays,
        averageUsageDuration,
        usageFrequency,
        lastUsedDate,
        daysSinceLastUse,
        isCurrentlyInUse: !!currentUsage,
        currentUsageStartDate: currentUsage?.startedAt || null,
      },
      seasonalUsage,
      recentUsage: usagePeriods.slice(0, 5),
    };
  }

  async getUsageRecommendations() {
    const currentSeason = this.getCurrentSeason();
    
    // Get available quilts for current season
    const availableQuilts = await this.db.quilt.findMany({
      where: {
        season: currentSeason,
        currentStatus: 'AVAILABLE',
      },
      include: {
        usagePeriods: {
          orderBy: { startDate: 'desc' },
          take: 3,
        },
      },
    });

    // Score quilts based on usage patterns
    const recommendations = availableQuilts.map(quilt => {
      const usageCount = quilt.usagePeriods.length;
      const lastUsed = quilt.usagePeriods[0]?.startDate;
      const daysSinceUsed = lastUsed 
        ? Math.ceil((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
        : 365;

      // Recommendation score based on:
      // - How long since last use (higher score for longer gaps)
      // - Usage frequency (moderate usage gets higher score)
      // - Seasonal appropriateness
      const recencyScore = Math.min(daysSinceUsed / 90, 1); // 0-1 scale, max at 90 days
      const frequencyScore = usageCount > 0 ? Math.min(usageCount / 5, 1) : 0.5; // Sweet spot around 5 uses
      const seasonalScore = quilt.season === currentSeason ? 1 : 0.3;
      
      const totalScore = (recencyScore * 0.5) + (frequencyScore * 0.3) + (seasonalScore * 0.2);

      return {
        quilt: {
          id: quilt.id,
          name: quilt.name,
          itemNumber: quilt.itemNumber,
          season: quilt.season,
          color: quilt.color,
          location: quilt.location,
        },
        score: totalScore,
        usageCount,
        daysSinceUsed,
        reason: this.generateUsageRecommendationReason(usageCount, daysSinceUsed, quilt.season === currentSeason),
      };
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  private async updateDailyAnalytics(date: Date) {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Get current counts
    const [totalInUse, totalAvailable, winterActive, springAutumnActive, summerActive] = await Promise.all([
      this.db.quilt.count({ where: { currentStatus: 'IN_USE' } }),
      this.db.quilt.count({ where: { currentStatus: 'AVAILABLE' } }),
      this.db.quilt.count({ where: { season: Season.WINTER, currentStatus: 'IN_USE' } }),
      this.db.quilt.count({ where: { season: Season.SPRING_AUTUMN, currentStatus: 'IN_USE' } }),
      this.db.quilt.count({ where: { season: Season.SUMMER, currentStatus: 'IN_USE' } }),
    ]);

    // Count usage events for the day
    const [newUsageStarted, usageEnded] = await Promise.all([
      this.db.currentUsage.count({
        where: {
          startedAt: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.db.usagePeriod.count({
        where: {
          endDate: {
            gte: dateOnly,
            lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Upsert analytics record
    await this.db.usageAnalytics.upsert({
      where: { date: dateOnly },
      update: {
        totalQuiltsInUse: totalInUse,
        totalQuiltsAvailable: totalAvailable,
        newUsageStarted,
        usageEnded,
        winterQuiltsActive: winterActive,
        springAutumnActive,
        summerQuiltsActive: summerActive,
      },
      create: {
        date: dateOnly,
        totalQuiltsInUse: totalInUse,
        totalQuiltsAvailable: totalAvailable,
        newUsageStarted,
        usageEnded,
        winterQuiltsActive: winterActive,
        springAutumnActive,
        summerQuiltsActive: summerActive,
      },
    });
  }

  private groupUsageByMonth(usagePeriods: any[]) {
    return usagePeriods.reduce((acc, period) => {
      const month = period.startDate.toISOString().slice(0, 7); // YYYY-MM
      
      if (!acc[month]) {
        acc[month] = {
          month,
          totalUsages: 0,
          totalDays: 0,
          averageDuration: 0,
          seasonalBreakdown: {
            [Season.WINTER]: 0,
            [Season.SPRING_AUTUMN]: 0,
            [Season.SUMMER]: 0,
          },
        };
      }

      acc[month].totalUsages++;
      if (period.durationDays) {
        acc[month].totalDays += period.durationDays;
      }
      acc[month].seasonalBreakdown[period.quilt.season]++;
      acc[month].averageDuration = acc[month].totalDays / acc[month].totalUsages;

      return acc;
    }, {} as Record<string, any>);
  }

  private analyzeSeasonalPatterns(usagePeriods: any[]) {
    const patterns = Object.values(Season).reduce((acc, season) => {
      const seasonPeriods = usagePeriods.filter(p => p.quilt.season === season);
      const totalDays = seasonPeriods.reduce((sum, p) => sum + (p.durationDays || 0), 0);
      
      acc[season] = {
        totalUsages: seasonPeriods.length,
        totalDays,
        averageDuration: seasonPeriods.length > 0 ? totalDays / seasonPeriods.length : 0,
        mostUsedMonths: this.getMostUsedMonths(seasonPeriods),
      };
      
      return acc;
    }, {} as Record<Season, any>);

    return patterns;
  }

  private calculateUsageEfficiency(usagePeriods: any[]) {
    const totalPeriods = usagePeriods.length;
    const completedPeriods = usagePeriods.filter(p => p.endDate).length;
    const totalDays = usagePeriods.reduce((sum, p) => sum + (p.durationDays || 0), 0);
    
    return {
      completionRate: totalPeriods > 0 ? completedPeriods / totalPeriods : 0,
      averageDuration: totalPeriods > 0 ? totalDays / totalPeriods : 0,
      totalUsageDays: totalDays,
      efficiencyScore: this.calculateEfficiencyScore(usagePeriods),
    };
  }

  private getMostUsedMonths(periods: any[]) {
    const monthCounts = periods.reduce((acc, period) => {
      const month = period.startDate.getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(monthCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([month, count]) => ({
        month: parseInt(month),
        count,
        name: new Date(2024, parseInt(month), 1).toLocaleString('default', { month: 'long' }),
      }));
  }

  private calculateEfficiencyScore(periods: any[]) {
    // Efficiency based on consistent usage patterns and appropriate durations
    const durations = periods.map(p => p.durationDays || 0).filter(d => d > 0);
    if (durations.length === 0) return 0;

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const consistency = Math.max(0, 1 - (variance / (avgDuration * avgDuration)));
    
    // Ideal duration is around 30-90 days
    const durationScore = avgDuration >= 30 && avgDuration <= 90 ? 1 : Math.max(0, 1 - Math.abs(avgDuration - 60) / 60);
    
    return (consistency * 0.6) + (durationScore * 0.4);
  }

  private determineSeason(date: Date): string {
    const month = date.getMonth() + 1;
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 6 && month <= 8) return 'summer';
    return 'spring_autumn';
  }

  private getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1;
    if (month >= 12 || month <= 2) return Season.WINTER;
    if (month >= 6 && month <= 8) return Season.SUMMER;
    return Season.SPRING_AUTUMN;
  }

  private generateUsageRecommendationReason(usageCount: number, daysSinceUsed: number, isSeasonalMatch: boolean): string {
    if (usageCount === 0) {
      return isSeasonalMatch 
        ? 'Perfect seasonal match and never used - great time to try it!'
        : 'Never used - discover something new!';
    }
    
    if (daysSinceUsed > 120) {
      return `Haven't used in ${daysSinceUsed} days - time for a comeback!`;
    }
    
    if (isSeasonalMatch && daysSinceUsed > 30) {
      return `Perfect for current season and ready for use (${daysSinceUsed} days since last use)`;
    }
    
    return `Good rotation candidate - used ${usageCount} times, ${daysSinceUsed} days ago`;
  }
}