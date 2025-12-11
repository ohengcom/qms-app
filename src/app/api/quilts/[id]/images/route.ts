/**
 * Quilts REST API - Image Management
 *
 * PUT /api/quilts/[id]/images - Update quilt images
 * DELETE /api/quilts/[id]/images - Delete a specific attachment image
 *
 * Requirements: 1.2, 1.3 - REST API for quilts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validation schema for image update
const updateImagesSchema = z.object({
  mainImage: z.string().nullable().optional(),
  attachmentImages: z.array(z.string()).nullable().optional(),
});

// Validation schema for image deletion
const deleteImageSchema = z.object({
  imageIndex: z.number().int().min(0, '图片索引必须是非负整数'),
});

/**
 * PUT /api/quilts/[id]/images
 *
 * Update quilt images (main image and/or attachment images).
 *
 * Request Body:
 * - mainImage?: string | null
 * - attachmentImages?: string[] | null
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
    const validationResult = updateImagesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '图片数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const { mainImage, attachmentImages } = validationResult.data;

    // Get current quilt
    const quilt = await quiltRepository.findById(id);
    if (!quilt) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    // Update with new images
    const updatedQuilt = await quiltRepository.update(id, {
      mainImage: mainImage !== undefined ? mainImage : quilt.mainImage,
      attachmentImages: attachmentImages !== undefined ? attachmentImages : quilt.attachmentImages,
    });

    return NextResponse.json(updatedQuilt);
  } catch (error) {
    dbLogger.error('Failed to update quilt images', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '更新被子图片失败'), {
      status: 500,
    });
  }
}

/**
 * DELETE /api/quilts/[id]/images
 *
 * Delete a specific attachment image by index.
 *
 * Query Parameters:
 * - imageIndex: number - The index of the image to delete
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const imageIndexStr = searchParams.get('imageIndex');

    if (!id) {
      return NextResponse.json(createError(ErrorCodes.VALIDATION_FAILED, '被子 ID 是必需的'), {
        status: 400,
      });
    }

    if (imageIndexStr === null) {
      return NextResponse.json(createError(ErrorCodes.VALIDATION_FAILED, '图片索引是必需的'), {
        status: 400,
      });
    }

    const imageIndex = parseInt(imageIndexStr, 10);

    // Validate input
    const validationResult = deleteImageSchema.safeParse({ imageIndex });

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '图片索引验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    // Get current quilt
    const quilt = await quiltRepository.findById(id);
    if (!quilt) {
      return NextResponse.json(createError(ErrorCodes.NOT_FOUND, '被子不存在', { id }), {
        status: 404,
      });
    }

    // Check if attachment images exist
    if (!quilt.attachmentImages || quilt.attachmentImages.length === 0) {
      return NextResponse.json(createError(ErrorCodes.VALIDATION_FAILED, '没有附件图片'), {
        status: 400,
      });
    }

    // Check if index is valid
    if (imageIndex >= quilt.attachmentImages.length) {
      return NextResponse.json(createError(ErrorCodes.VALIDATION_FAILED, '无效的图片索引'), {
        status: 400,
      });
    }

    // Remove the image at the specified index
    const newImages = [...quilt.attachmentImages];
    newImages.splice(imageIndex, 1);

    // Update quilt
    const updatedQuilt = await quiltRepository.update(id, {
      attachmentImages: newImages,
    });

    return NextResponse.json(updatedQuilt);
  } catch (error) {
    dbLogger.error('Failed to delete quilt attachment image', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '删除被子附件图片失败'), {
      status: 500,
    });
  }
}
