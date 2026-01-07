/**
 * Database Stats REST API
 *
 * GET /api/settings/database-stats - Get database statistics
 *
 * Requirements: 1.2, 1.3 - REST API for settings
 * Requirements: 5.3 - Consistent API response format
 */

import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createSuccessResponse, createInternalErrorResponse } from '@/lib/api/response';

/**
 * GET /api/settings/database-stats
 *
 * Get database statistics including:
 * - Total quilts count
 * - Total usage records count
 * - Active usage count
 * - Database provider info
 */
export async function GET() {
  try {
    const quilts = await quiltRepository.findAll();
    const usageRecords = await usageRepository.findAll();
    const activeUsage = await usageRepository.getAllActive();

    return createSuccessResponse({
      stats: {
        totalQuilts: quilts.length,
        totalUsageRecords: usageRecords.length,
        activeUsage: activeUsage.length,
        provider: 'Neon Serverless PostgreSQL',
        connected: true,
      },
    });
  } catch (error) {
    return createInternalErrorResponse('获取数据库统计失败', error);
  }
}
