/**
 * Usage Statistics Library
 *
 * Provides functions to calculate quilt usage frequency and generate recommendations
 */

export interface UsageRecord {
  id: string;
  quiltId: string;
  startDate: Date;
  endDate?: Date | null;
}

export interface QuiltUsageStats {
  quiltId: string;
  quiltName: string;
  itemNumber: number;
  season: string;
  // Usage counts
  usageCount30Days: number;
  usageCount90Days: number;
  usageCount365Days: number;
  totalUsageCount: number;
  // Days used
  daysUsed30Days: number;
  daysUsed90Days: number;
  daysUsed365Days: number;
  totalDaysUsed: number;
  // Last usage
  lastUsedDate: Date | null;
  daysSinceLastUse: number | null;
  // Recommendation
  recommendation: 'keep' | 'low_usage' | 'consider_removal';
  recommendationReason: string;
}

/**
 * Calculate usage statistics for a quilt
 */
export function calculateQuiltUsageStats(
  quiltId: string,
  quiltName: string,
  itemNumber: number,
  season: string,
  usageRecords: UsageRecord[]
): QuiltUsageStats {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Filter records for this quilt
  const quiltRecords = usageRecords.filter(r => r.quiltId === quiltId);

  // Calculate usage counts
  const usageCount30Days = quiltRecords.filter(r => new Date(r.startDate) >= thirtyDaysAgo).length;
  const usageCount90Days = quiltRecords.filter(r => new Date(r.startDate) >= ninetyDaysAgo).length;
  const usageCount365Days = quiltRecords.filter(r => new Date(r.startDate) >= oneYearAgo).length;
  const totalUsageCount = quiltRecords.length;

  // Calculate days used
  const daysUsed30Days = calculateTotalDaysUsed(
    quiltRecords.filter(r => new Date(r.startDate) >= thirtyDaysAgo)
  );
  const daysUsed90Days = calculateTotalDaysUsed(
    quiltRecords.filter(r => new Date(r.startDate) >= ninetyDaysAgo)
  );
  const daysUsed365Days = calculateTotalDaysUsed(
    quiltRecords.filter(r => new Date(r.startDate) >= oneYearAgo)
  );
  const totalDaysUsed = calculateTotalDaysUsed(quiltRecords);

  // Find last usage
  const sortedRecords = [...quiltRecords].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const lastUsedDate = sortedRecords.length > 0 ? new Date(sortedRecords[0].startDate) : null;
  const daysSinceLastUse = lastUsedDate
    ? Math.floor((now.getTime() - lastUsedDate.getTime()) / (24 * 60 * 60 * 1000))
    : null;

  // Generate recommendation
  const { recommendation, reason } = generateRecommendation(usageCount365Days, daysSinceLastUse);

  return {
    quiltId,
    quiltName,
    itemNumber,
    season,
    usageCount30Days,
    usageCount90Days,
    usageCount365Days,
    totalUsageCount,
    daysUsed30Days,
    daysUsed90Days,
    daysUsed365Days,
    totalDaysUsed,
    lastUsedDate,
    daysSinceLastUse,
    recommendation,
    recommendationReason: reason,
  };
}

/**
 * Calculate total days used from usage records
 */
function calculateTotalDaysUsed(records: UsageRecord[]): number {
  let totalDays = 0;

  for (const record of records) {
    const start = new Date(record.startDate);
    const end = record.endDate ? new Date(record.endDate) : new Date();
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    totalDays += Math.max(0, days);
  }

  return totalDays;
}

/**
 * Generate recommendation based on usage patterns
 */
function generateRecommendation(
  usageCount365Days: number,
  daysSinceLastUse: number | null
): { recommendation: 'keep' | 'low_usage' | 'consider_removal'; reason: string } {
  // Never used in the past year
  if (usageCount365Days === 0) {
    return {
      recommendation: 'consider_removal',
      reason: '过去一年未使用，建议考虑淘汰',
    };
  }

  // Used less than 3 times in the past year
  if (usageCount365Days < 3) {
    return {
      recommendation: 'low_usage',
      reason: '过去一年使用次数较少（少于3次）',
    };
  }

  // Not used in the past 180 days
  if (daysSinceLastUse !== null && daysSinceLastUse > 180) {
    return {
      recommendation: 'low_usage',
      reason: '已超过180天未使用',
    };
  }

  // Normal usage
  return {
    recommendation: 'keep',
    reason: '使用频率正常',
  };
}

/**
 * Calculate usage statistics for all quilts
 */
export function calculateAllQuiltsUsageStats(
  quilts: Array<{ id: string; name: string; itemNumber: number; season: string }>,
  usageRecords: UsageRecord[]
): QuiltUsageStats[] {
  return quilts.map(quilt =>
    calculateQuiltUsageStats(quilt.id, quilt.name, quilt.itemNumber, quilt.season, usageRecords)
  );
}

/**
 * Sort quilts by usage frequency
 */
export function sortByUsageFrequency(
  stats: QuiltUsageStats[],
  period: '30days' | '90days' | '365days' | 'all' = '365days',
  order: 'asc' | 'desc' = 'desc'
): QuiltUsageStats[] {
  const sorted = [...stats].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (period) {
      case '30days':
        aValue = a.usageCount30Days;
        bValue = b.usageCount30Days;
        break;
      case '90days':
        aValue = a.usageCount90Days;
        bValue = b.usageCount90Days;
        break;
      case '365days':
        aValue = a.usageCount365Days;
        bValue = b.usageCount365Days;
        break;
      case 'all':
      default:
        aValue = a.totalUsageCount;
        bValue = b.totalUsageCount;
        break;
    }

    return order === 'desc' ? bValue - aValue : aValue - bValue;
  });

  return sorted;
}

/**
 * Filter quilts by recommendation
 */
export function filterByRecommendation(
  stats: QuiltUsageStats[],
  filter: 'all' | 'keep' | 'low_usage' | 'consider_removal'
): QuiltUsageStats[] {
  if (filter === 'all') {
    return stats;
  }

  return stats.filter(s => s.recommendation === filter);
}
