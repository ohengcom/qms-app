import { PrismaClient, Quilt, QuiltStatus, Season } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import type { 
  CreateQuiltInput, 
  UpdateQuiltInput, 
  QuiltSearchInput 
} from '@/lib/validations/quilt';

export class QuiltService {
  constructor(private db: PrismaClient) {}

  async searchQuilts(params: QuiltSearchInput) {
    const { filters, sortBy, sortOrder, skip, take } = params;
    
    const where: any = {};
    
    // Apply indexed filters first for better performance
    if (filters.season) where.season = filters.season;
    if (filters.status) where.currentStatus = filters.status;
    if (filters.brand) {
      where.brand = { contains: filters.brand, mode: 'insensitive' };
    }
    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    
    // Weight range filter (indexed)
    if (filters.minWeight || filters.maxWeight) {
      where.weightGrams = {};
      if (filters.minWeight) where.weightGrams.gte = filters.minWeight;
      if (filters.maxWeight) where.weightGrams.lte = filters.maxWeight;
    }
    
    // Text search (use sparingly for performance)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { color: { contains: filters.search, mode: 'insensitive' } },
        { fillMaterial: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Optimized includes with selective fields
    const includeOptions = {
      currentUsage: {
        select: {
          id: true,
          startedAt: true,
          expectedEndDate: true,
        },
      },
      usagePeriods: {
        orderBy: { startDate: 'desc' as const },
        take: 3,
        select: {
          id: true,
          startDate: true,
          endDate: true,
          durationDays: true,
          usageType: true,
        },
      },
      maintenanceLog: {
        orderBy: { performedAt: 'desc' as const },
        take: 1,
        select: {
          id: true,
          type: true,
          performedAt: true,
          nextDueDate: true,
        },
      },
    };

    const [quilts, total] = await Promise.all([
      this.db.quilt.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        include: includeOptions,
      }),
      this.db.quilt.count({ where }),
    ]);

    return {
      quilts,
      total,
      hasMore: skip + take < total,
    };
  }

  async getQuiltById(id: string) {
    const quilt = await this.db.quilt.findUnique({
      where: { id },
      include: {
        currentUsage: true,
        usagePeriods: {
          orderBy: { startDate: 'desc' },
        },
        maintenanceLog: {
          orderBy: { performedAt: 'desc' },
        },
      },
    });

    if (!quilt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Quilt not found',
      });
    }

    return this.enrichQuiltWithStats(quilt);
  }

  async createQuilt(data: CreateQuiltInput) {
    // Check for duplicate item number
    const existingQuilt = await this.db.quilt.findUnique({
      where: { itemNumber: data.itemNumber },
    });

    if (existingQuilt) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `Quilt with item number ${data.itemNumber} already exists`,
      });
    }

    return this.db.quilt.create({
      data,
      include: {
        currentUsage: true,
        usagePeriods: true,
        maintenanceLog: true,
      },
    });
  }

  async updateQuilt(data: UpdateQuiltInput) {
    const { id, ...updateData } = data;

    const existingQuilt = await this.db.quilt.findUnique({
      where: { id },
    });

    if (!existingQuilt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Quilt not found',
      });
    }

    // Check for item number conflicts
    if (updateData.itemNumber && updateData.itemNumber !== existingQuilt.itemNumber) {
      const conflictingQuilt = await this.db.quilt.findUnique({
        where: { itemNumber: updateData.itemNumber },
      });

      if (conflictingQuilt) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Quilt with item number ${updateData.itemNumber} already exists`,
        });
      }
    }

    return this.db.quilt.update({
      where: { id },
      data: updateData,
      include: {
        currentUsage: true,
        usagePeriods: true,
        maintenanceLog: true,
      },
    });
  }

  async deleteQuilt(id: string) {
    const quilt = await this.db.quilt.findUnique({
      where: { id },
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
        message: 'Cannot delete quilt that is currently in use',
      });
    }

    return this.db.quilt.delete({
      where: { id },
    });
  }

  async getSeasonalRecommendations(season?: Season, availableOnly = true) {
    const where: any = {};
    
    if (season) where.season = season;
    if (availableOnly) where.currentStatus = QuiltStatus.AVAILABLE;

    const quilts = await this.db.quilt.findMany({
      where,
      include: {
        usagePeriods: {
          orderBy: { startDate: 'desc' },
          take: 3,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate recommendation scores
    const recommendations = quilts.map((quilt) => {
      const usageCount = quilt.usagePeriods.length;
      const lastUsed = quilt.usagePeriods[0]?.startDate;
      const daysSinceUsed = lastUsed 
        ? Math.ceil((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24))
        : 365;

      // Scoring algorithm: usage frequency + recency
      const usageScore = Math.min(usageCount / 10, 1); // Normalize to 0-1
      const recencyScore = Math.max(0, (365 - daysSinceUsed) / 365); // More recent = higher score
      const score = (usageScore * 0.4) + (recencyScore * 0.6);

      return {
        quilt,
        score,
        usageCount,
        daysSinceUsed,
        reason: this.generateRecommendationReason(usageCount, daysSinceUsed),
      };
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  async getQuiltsByLocation(location: string) {
    return this.db.quilt.findMany({
      where: {
        location: {
          contains: location,
          mode: 'insensitive',
        },
      },
      include: {
        currentUsage: true,
      },
      orderBy: { itemNumber: 'asc' },
    });
  }

  async getQuiltsByStatus(status: QuiltStatus) {
    return this.db.quilt.findMany({
      where: { currentStatus: status },
      include: {
        currentUsage: true,
        usagePeriods: {
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private enrichQuiltWithStats(quilt: any) {
    const totalUsageDays = quilt.usagePeriods.reduce((total: number, period: any) => {
      if (period.endDate) {
        const days = Math.ceil(
          (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return total + days;
      }
      return total;
    }, 0);

    const usageFrequency = quilt.usagePeriods.length;
    const lastUsedDate = quilt.usagePeriods[0]?.startDate || null;

    return {
      ...quilt,
      stats: {
        totalUsageDays,
        usageFrequency,
        lastUsedDate,
        averageUsageDuration: usageFrequency > 0 ? totalUsageDays / usageFrequency : 0,
      },
    };
  }

  private generateRecommendationReason(usageCount: number, daysSinceUsed: number): string {
    if (usageCount === 0) {
      return 'Never used - perfect for trying something new!';
    }
    
    if (daysSinceUsed > 180) {
      return `Used ${usageCount} times but not recently (${daysSinceUsed} days ago) - time for a refresh!`;
    }
    
    if (usageCount > 5) {
      return `Popular choice (used ${usageCount} times) - a reliable favorite!`;
    }
    
    return `Used ${usageCount} times, last used ${daysSinceUsed} days ago`;
  }
}