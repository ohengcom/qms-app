/**
 * Change Password REST API
 *
 * POST /api/settings/change-password - Change user password
 *
 * Requirements: 1.2, 1.3 - REST API for settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { systemSettingsRepository } from '@/lib/repositories/system-settings.repository';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createError, ErrorCodes } from '@/lib/error-handler';
import { dbLogger } from '@/lib/logger';

// Input schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

/**
 * POST /api/settings/change-password
 *
 * Change the user password.
 *
 * Request Body:
 * - currentPassword: Current password for verification
 * - newPassword: New password (min 8 characters)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        createError(ErrorCodes.VALIDATION_FAILED, '密码数据验证失败', {
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get current password hash from database (fallback to environment)
    let currentHash = await systemSettingsRepository.getPasswordHash();
    if (!currentHash) {
      currentHash = process.env.QMS_PASSWORD_HASH || null;
    }

    if (!currentHash) {
      return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '密码哈希未配置'), {
        status: 500,
      });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, currentHash);
    if (!isValid) {
      return NextResponse.json(createError(ErrorCodes.UNAUTHORIZED, '当前密码不正确'), {
        status: 401,
      });
    }

    // Generate new hash
    const newHash = await hashPassword(newPassword);

    // Save new hash to database
    await systemSettingsRepository.updatePasswordHash(newHash);

    return NextResponse.json({
      success: true,
      message: '密码修改成功',
    });
  } catch (error) {
    dbLogger.error('Failed to change password', { error });
    return NextResponse.json(createError(ErrorCodes.INTERNAL_ERROR, '修改密码失败'), {
      status: 500,
    });
  }
}
