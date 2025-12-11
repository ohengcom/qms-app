/**
 * Quilts REST API - List and Create
 *
 * GET /api/quilts - Get all quilts with filtering and pagination
 * POST /api/quilts - Create a new quilt
 *
 * Requirements: 1.2, 1.3 - REST API for quilts
 */

import { NextRequest, NextResponse } from 'next/server';
import { quiltRepository } from '@/lib/repositories/quilt.repository';
import { createQuiltSchema, quiltFiltersSchema } from '@/lib/validations/quilt';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

/**
 * GET /api/quilts
 *
 * Get all quilts with optional filtering and pagination.
 *
 * Query Parameters:
 * - season: Filter by season (WINTER, SPRING_AUTUMN, SUMMER)
 * - status: Filter by status (IN_USE, MAINTENANCE, STORAGE)
 * - location: Filter by location (partial match)
 * - brand: Filter by brand (partial match)
 * - search: Search across name, color, fill material, notes
 * - limit: Number of results per page (default: 20, max: 100)
 * - offset: Number of results to skip (default: 0)
 * - sortBy: Sort field (itemNumber, name, season, weightGrams, createdAt, updatedAt)
 * - sortOrder: Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const season = searchParams.get('season') || undefined;
    const status = searchParams.get('status') || undefined;
    const location = searchParams.get('location') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sortBy = searchParams.get('sortBy') || 'itemNumber';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Validate filters using Zod schema
    const filtersResult = quiltFiltersSchema.safeParse({
      season,
      status,
      location,
      brand,
      search,
    });

    if (!filtersResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '过滤参数无效', {
          errors: filtersResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    // Build filters object
    const filters = {
      ...filtersResult.data,
      limit,
      offset,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    // Fetch quilts and count
    const [quilts, total] = await Promise.all([
      quiltRepository.findAll(filters),
      quiltRepository.count(filters),
    ]);

    return NextResponse.json({
      quilts,
      total,
      hasMore: offset + quilts.length < total,
    });
  } catch (error) {
    dbLogger.error('Failed to fetch quilts', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取被子列表失败'), {
      status: 500,
    });
  }
}

/**
 * POST /api/quilts
 *
 * Create a new quilt.
 *
 * Request Body: CreateQuiltInput
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle purchaseDate conversion if it's a string
    if (body.purchaseDate && typeof body.purchaseDate === 'string') {
      body.purchaseDate = new Date(body.purchaseDate);
    }

    // Validate input using Zod schema
    const validationResult = createQuiltSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '被子数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    // Create the quilt
    const quilt = await quiltRepository.create(validationResult.data);

    return NextResponse.json(quilt, { status: 201 });
  } catch (error) {
    dbLogger.error('Failed to create quilt', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '创建被子失败'), {
      status: 500,
    });
  }
}
