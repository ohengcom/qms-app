/**
 * End Usage Record REST API
 *
 * POST /api/usage/end - End an active usage record for a quilt
 *
 * Requirements: 1.2, 1.3 - REST API for usage records
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

// Input validation schema
const endUsageRecordSchema = z.object({
  quiltId: z.string().uuid('无效的被子ID'),
  endDate: z.string().transform(val => new Date(val)),
  notes: z.string().optional().nullable(),
});

/**
 * POST /api/usage/end
 *
 * End an active usage record for a quilt.
 *
 * Request Body:
 * - quiltId: string (required) - The quilt ID
 * - endDate: string (required) - End date in ISO format
 * - notes: string (optional) - Notes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = endUsageRecordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '使用记录数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const { quiltId, endDate, notes } = validationResult.data;

    // End the active usage record
    const record = await usageRepository.endUsageRecord(quiltId, endDate, notes || undefined);

    if (!record) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '没有找到该被子的活跃使用记录'), {
        status: 404,
      });
    }

    return NextResponse.json(record);
  } catch (error) {
    dbLogger.error('Failed to end usage record', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '结束使用记录失败'), {
      status: 500,
    });
  }
}
