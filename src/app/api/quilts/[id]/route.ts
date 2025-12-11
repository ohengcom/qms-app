/**
 * Quilts REST API - Single Quilt Operations
 *
 * GET /api/quilts/[id] - Get a single quilt by ID
 * PUT /api/quilts/[id] - Update a quilt
 * DELETE /api/quilts/[id] - Delete a quilt
 *
 * Requirements: 1.2, 1.3 - REST API for quilts
 */

import { NextRequest, NextResponse } from 'next/server';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { updateQuiltSchema } from '@/lib/validations/quilt';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/quilts/[id]
 *
 * Get a single quilt by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(createError(ErrorCodes.VALIDATION_FAILED, '被子 ID 是必需的'), {
        status: 400,
      });
    }

    const quilt = await quiltRepository.findById(id);

    if (!quilt) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    return NextResponse.json(quilt);
  } catch (error) {
    dbLogger.error('Failed to fetch quilt', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取被子详情失败'), {
      status: 500,
    });
  }
}

/**
 * PUT /api/quilts/[id]
 *
 * Update a quilt.
 *
 * Request Body: UpdateQuiltInput (partial)
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

    // Handle purchaseDate conversion if it's a string
    if (body.purchaseDate && typeof body.purchaseDate === 'string') {
      body.purchaseDate = new Date(body.purchaseDate);
    }

    // Validate input using Zod schema
    const validationResult = updateQuiltSchema.safeParse({ ...body, id });

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '被子数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    // Check if quilt exists
    const existingQuilt = await quiltRepository.findById(id);
    if (!existingQuilt) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    // Update the quilt (exclude id from data)
    const { id: _id, ...updateData } = validationResult.data;
    const quilt = await quiltRepository.update(id, updateData);

    if (!quilt) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    return NextResponse.json(quilt);
  } catch (error) {
    dbLogger.error('Failed to update quilt', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '更新被子失败'), {
      status: 500,
    });
  }
}

/**
 * DELETE /api/quilts/[id]
 *
 * Delete a quilt and its related records.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(createError(ErrorCodes.VALIDATION_FAILED, '被子 ID 是必需的'), {
        status: 400,
      });
    }

    // Check if quilt exists
    const existingQuilt = await quiltRepository.findById(id);
    if (!existingQuilt) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    const success = await quiltRepository.delete(id);

    if (!success) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    dbLogger.error('Failed to delete quilt', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '删除被子失败'), {
      status: 500,
    });
  }
}
