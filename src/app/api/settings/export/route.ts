/**
 * Export Data REST API
 *
 * GET /api/settings/export - Export all data
 *
 * Requirements: 1.2, 1.3 - REST API for settings
 */

import { NextResponse } from 'next/server';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

/**
 * GET /api/settings/export
 *
 * Export all data including:
 * - All quilts
 * - All usage records
 * - Export timestamp
 */
export async function GET() {
  try {
    const quilts = await quiltRepository.findAll();
    const usageRecords = await usageRepository.findAll();

    return NextResponse.json({
      exportDate: new Date().toISOString(),
      quilts,
      usageRecords,
    });
  } catch (error) {
    dbLogger.error('Failed to export data', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '导出数据失败'), {
      status: 500,
    });
  }
}
