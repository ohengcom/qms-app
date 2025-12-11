/**
 * Active Usage Records REST API
 *
 * GET /api/usage/active - Get all active usage records (end_date is NULL)
 *
 * Requirements: 1.2, 1.3 - REST API for usage records
 */

import { NextResponse } from 'next/server';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

/**
 * GET /api/usage/active
 *
 * Get all active usage records (records where end_date is NULL).
 * These represent quilts that are currently in use.
 */
export async function GET() {
  try {
    const records = await usageRepository.getAllActive();

    return NextResponse.json({
      records,
      total: records.length,
    });
  } catch (error) {
    dbLogger.error('Failed to fetch active usage records', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取活跃使用记录失败'), {
      status: 500,
    });
  }
}
