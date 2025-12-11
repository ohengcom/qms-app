/**
 * Usage Record REST API - Single Record Operations
 *
 * GET /api/usage/[id] - Get a single usage record
 * PUT /api/usage/[id] - Update a usage record
 * DELETE /api/usage/[id] - Delete a usage record
 *
 * Requirements: 1.2, 1.3 - REST API for usage records
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { usageRepository } from '@/lib/repositories/usage.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

// Input validation schema for updates
const updateUsageRecordSchema = z.object({
  startDate: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform(val => new Date(val))
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/usage/[id]
 *
 * Get a single usage record by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const record = await usageRepository.findById(id);

    if (!record) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '使用记录不存在'), {
        status: 404,
      });
    }

    return NextResponse.json(record);
  } catch (error) {
    dbLogger.error('Failed to fetch usage record', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取使用记录失败'), {
      status: 500,
    });
  }
}

/**
 * PUT /api/usage/[id]
 *
 * Update a usage record.
 *
 * Request Body:
 * - startDate: string (optional) - Start date in ISO format
 * - endDate: string (optional) - End date in ISO format
 * - notes: string (optional) - Notes
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = updateUsageRecordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '使用记录数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    // Check if record exists
    const existingRecord = await usageRepository.findById(id);
    if (!existingRecord) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '使用记录不存在'), {
        status: 404,
      });
    }

    // Update the record
    const record = await usageRepository.update(id, validationResult.data);

    if (!record) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '使用记录不存在'), {
        status: 404,
      });
    }

    return NextResponse.json(record);
  } catch (error) {
    dbLogger.error('Failed to update usage record', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '更新使用记录失败'), {
      status: 500,
    });
  }
}

/**
 * DELETE /api/usage/[id]
 *
 * Delete a usage record.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if record exists
    const existingRecord = await usageRepository.findById(id);
    if (!existingRecord) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '使用记录不存在'), {
        status: 404,
      });
    }

    // Delete the record
    const success = await usageRepository.delete(id);

    if (!success) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '使用记录不存在'), {
        status: 404,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    dbLogger.error('Failed to delete usage record', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '删除使用记录失败'), {
      status: 500,
    });
  }
}
