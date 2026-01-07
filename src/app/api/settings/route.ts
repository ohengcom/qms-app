/**
 * Settings REST API - Application Settings
 *
 * GET /api/settings - Get application settings
 * PUT /api/settings - Update application settings
 *
 * Requirements: 1.2, 1.3 - REST API for settings
 * Requirements: 5.3 - Consistent API response format
 * Requirements: 11.1 - Input sanitization
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { systemSettingsRepository } from '@/lib/repositories/system-settings.repository';
import { sanitizeApiInput } from '@/lib/sanitization';
import {
  createSuccessResponse,
  createValidationErrorResponse,
  createInternalErrorResponse,
} from '@/lib/api/response';

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

    return createSuccessResponse({
      settings: {
        appName,
        language: 'zh' as const,
        itemsPerPage: 25,
        defaultView: 'list' as const,
        doubleClickAction: doubleClickAction || 'status',
        usageDoubleClickAction: usageDoubleClickAction || 'view',
      },
    });
  } catch (error) {
    return createInternalErrorResponse('获取应用设置失败', error);
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
    const rawBody = await request.json();

    // Sanitize input to prevent XSS (Requirements: 11.1)
    const body = sanitizeApiInput(rawBody);

    // Validate input using Zod schema
    const validationResult = updateAppSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(
        '设置数据验证失败',
        validationResult.error.flatten().fieldErrors as Record<string, string[]>
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

    return createSuccessResponse({
      updated: true,
      settings: input,
    });
  } catch (error) {
    return createInternalErrorResponse('更新应用设置失败', error);
  }
}
