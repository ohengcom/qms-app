/**
 * Quilts REST API - Status Change
 *
 * PUT /api/quilts/[id]/status - Update quilt status with automatic usage record management
 *
 * Requirements: 1.2, 1.3 - REST API for quilts
 * Requirements: 13.1 - Status change atomicity
 * Requirements: 13.2 - Single active usage record
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for status update
const updateStatusSchema = z.object({
  status: z.enum(['IN_USE', 'STORAGE', 'MAINTENANCE'], {
    message: '无效的状态值',
  }),
  usageType: z
    .enum(['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION'])
    .optional()
    .default('REGULAR'),
  notes: z.string().max(500, '备注不能超过500字符').optional(),
});

/**
 * PUT /api/quilts/[id]/status
 *
 * Update quilt status with automatic usage record management.
 *
 * When changing TO IN_USE: Creates a new usage record with start_date
 * When changing FROM IN_USE: Ends the active usage record with end_date
 *
 * Request Body:
 * - status: 'IN_USE' | 'STORAGE' | 'MAINTENANCE'
 * - usageType?: 'REGULAR' | 'GUEST' | 'SPECIAL_OCCASION' | 'SEASONAL_ROTATION'
 * - notes?: string
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(createError(ErrorCodes.VALIDATION_FAILED, '被子 ID 是必需的'), {
        status: 400,
      });
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '状态数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const { status, usageType, notes } = validationResult.data;

    // Update status with atomic usage record management
    const result = await quiltRepository.updateStatusWithUsageRecord(id, status, usageType, notes);

    if (!result.quilt) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    // Return the updated quilt and usage record info
    return NextResponse.json({
      quilt: result.quilt,
      usageRecord: result.usageRecord || null,
    });
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Quilt not found') {
        return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在'), { status: 404 });
      }
      if (error.message === 'Quilt already has an active usage record') {
        return NextResponse.json(createError('CONFLICT', '该被子已有活跃的使用记录'), {
          status: 409,
        });
      }
    }

    dbLogger.error('Failed to update quilt status', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '更新被子状态失败'), {
      status: 500,
    });
  }
}
