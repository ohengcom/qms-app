/**
 * Usage Records REST API - List and Create
 *
 * GET /api/usage - Get all usage records with filtering and pagination
 * POST /api/usage - Create a new usage record
 *
 * Requirements: 1.2, 1.3 - REST API for usage records
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

// Input validation schemas
const createUsageRecordSchema = z.object({
  quiltId: z.string().uuid('无效的被子ID'),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z
    .string()
    .transform(val => new Date(val))
    .optional()
    .nullable(),
  usageType: z
    .enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION'])
    .default('REGULAR'),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/usage
 *
 * Get all usage records with optional filtering and pagination.
 *
 * Query Parameters:
 * - quiltId: Filter by quilt ID
 * - limit: Number of results per page (default: 50, max: 100)
 * - offset: Number of results to skip (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const quiltId = searchParams.get('quiltId') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build filters object
    const filters = {
      quiltId,
      limit,
      offset,
    };

    // Fetch usage records
    const records = await usageRepository.findAll(filters);

    return NextResponse.json({
      records,
      total: records.length,
    });
  } catch (error) {
    dbLogger.error('Failed to fetch usage records', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取使用记录列表失败'), {
      status: 500,
    });
  }
}

/**
 * POST /api/usage
 *
 * Create a new usage record.
 *
 * Request Body:
 * - quiltId: string (required) - The quilt ID
 * - startDate: string (required) - Start date in ISO format
 * - endDate: string (optional) - End date in ISO format
 * - usageType: string (optional) - Usage type (REGULAR, GUEST, SPECIAL_OCCASION, SEASONAL_ROTATION)
 * - notes: string (optional) - Notes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createUsageRecordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '使用记录数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const { quiltId, startDate, endDate, usageType, notes } = validationResult.data;

    // Create the usage record
    const record = await usageRepository.createUsageRecord({
      quiltId,
      startDate,
      endDate,
      usageType,
      notes,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    dbLogger.error('Failed to create usage record', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '创建使用记录失败'), {
      status: 500,
    });
  }
}
