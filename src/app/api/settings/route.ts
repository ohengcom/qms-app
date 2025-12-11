/**
 * Settings REST API - Application Settings
 *
 * GET /api/settings - Get application settings
 * PUT /api/settings - Update application settings
 *
 * Requirements: 1.2, 1.3 - REST API for settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { systemSettingsRepository } from '@/lib/repositories/system-settings.repository';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

// Input schema for updating settings
const updateAppSettingsSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  language: z.enum(['zh', 'en']).optional(),
  itemsPerPage: z.number().min(10).max(100).optional(),
  defaultView: z.enum(['list', 'grid']).optional(),
  doubleClickAction: z.enum(['none', 'view', 'status', 'edit']).optional(),
  usageDoubleClickAction: z.enum(['none', 'view', 'edit']).optional(),
});

/**
 * GET /api/settings
 *
 * Get application settings including:
 * - App name
 * - Language preference
 * - Items per page
 * - Default view mode
 * - Double click actions
 */
export async function GET() {
  try {
    const appName = await systemSettingsRepository.getAppName();
    const doubleClickAction = await systemSettingsRepository.getDoubleClickAction();
    const usageDoubleClickAction = await systemSettingsRepository.getUsageDoubleClickAction();

    return NextResponse.json({
      appName,
      language: 'zh' as const,
      itemsPerPage: 25,
      defaultView: 'list' as const,
      doubleClickAction: doubleClickAction || 'status',
      usageDoubleClickAction: usageDoubleClickAction || 'view',
    });
  } catch (error) {
    dbLogger.error('Failed to fetch app settings', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '获取应用设置失败'), {
      status: 500,
    });
  }
}

/**
 * PUT /api/settings
 *
 * Update application settings.
 *
 * Request Body: UpdateAppSettingsInput
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = updateAppSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '设置数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Update app name in database if provided
    if (input.appName) {
      await systemSettingsRepository.updateAppName(input.appName);
    }

    // Update double click action if provided
    if (input.doubleClickAction) {
      await systemSettingsRepository.updateDoubleClickAction(input.doubleClickAction);
    }

    // Update usage double click action if provided
    if (input.usageDoubleClickAction) {
      await systemSettingsRepository.updateUsageDoubleClickAction(input.usageDoubleClickAction);
    }

    return NextResponse.json({
      success: true,
      settings: input,
    });
  } catch (error) {
    dbLogger.error('Failed to update app settings', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '更新应用设置失败'), {
      status: 500,
    });
  }
}
