/**
 * Usage Records by Quilt REST API
 *
 * GET /api/usage/by-quilt/[quiltId] - Get all usage records for a specific quilt
 *
 * Requirements: 1.2, 1.3 - REST API for usage records
 */

import { NextRequest, NextResponse } from 'next/server';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ quiltId: string }>;
}

/**
 * GET /api/usage/by-quilt/[quiltId]
 *
 * Get all usage records for a specific quilt.
 *
 * Query Parameters:
 * - includeStats: boolean (optional) - Include usage statistics
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { quiltId } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    // Fetch usage records for the quilt
    const records = await usageRepository.findByQuiltId(quiltId);

    // Optionally include statistics
    let stats = null;
    if (includeStats) {
      stats = await usageRepository.getUsageStats(quiltId);
    }

    // Get active record if any
    const activeRecord = await usageRepository.getActiveUsageRecord(quiltId);

    return NextResponse.json({
      records,
      total: records.length,
      activeRecord,
      ...(stats && { stats }),
    });
  } catch (error) {
    dbLogger.error('Failed to fetch usage records for quilt', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取被子使用记录失败'), {
      status: 500,
    });
  }
}
