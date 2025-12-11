/**
 * Usage Statistics REST API
 *
 * GET /api/usage/stats - Get overall usage statistics
 *
 * Requirements: 1.2, 1.3 - REST API for usage records
 */

import { NextResponse } from 'next/server';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

/**
 * GET /api/usage/stats
 *
 * Get overall usage statistics.
 *
 * Returns:
 * - total: Total number of usage records
 * - active: Number of active usage records
 * - completed: Number of completed usage records
 */
export async function GET() {
  try {
    const allRecords = await usageRepository.findAll();
    const activeRecords = await usageRepository.getAllActive();

    return NextResponse.json({
      total: allRecords.length,
      active: activeRecords.length,
      completed: allRecords.length - activeRecords.length,
    });
  } catch (error) {
    dbLogger.error('Failed to fetch usage statistics', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取使用统计失败'), {
      status: 500,
    });
  }
}
