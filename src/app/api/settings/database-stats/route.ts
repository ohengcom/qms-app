/**
 * Database Stats REST API
 *
 * GET /api/settings/database-stats - Get database statistics
 *
 * Requirements: 1.2, 1.3 - REST API for settings
 */

import { NextResponse } from 'next/server';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

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

    return NextResponse.json({
      totalQuilts: quilts.length,
      totalUsageRecords: usageRecords.length,
      activeUsage: activeUsage.length,
      provider: 'Neon Serverless PostgreSQL',
      connected: true,
    });
  } catch (error) {
    dbLogger.error('Failed to fetch database stats', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取数据库统计失败'), {
      status: 500,
    });
  }
}
