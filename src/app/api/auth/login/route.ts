/**
 * Authentication REST API - Login
 *
 * POST /api/auth/login - Authenticate user
 *
 * Requirements: 5.3 - Consistent API response format
 */

import { NextRequest } from 'next/server';
import {
  verifyPassword,
  generateJWT,
  SESSION_DURATION,
  isRateLimited,
  recordFailedAttempt,
  clearFailedAttempts,
  getClientIP,
} from '@/lib/auth';
import { authLogger } from '@/lib/logger';
import { systemSettingsRepository } from '@/lib/repositories/system-settings.repository';
import {
  createSuccessResponse,
  createBadRequestResponse,
  createUnauthorizedResponse,
  createRateLimitResponse,
  createInternalErrorResponse,
} from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const { password, remember } = await request.json();

    // Validate input
    if (!password || typeof password !== 'string') {
      return createBadRequestResponse('密码是必需的');
    }

    // Get client IP for rate limiting
    const ip = getClientIP(request.headers);

    // Check rate limiting
    if (isRateLimited(ip)) {
      authLogger.warn('Rate limit exceeded', { ip });
      return createRateLimitResponse('登录尝试次数过多，请15分钟后重试');
    }

    // Get password hash from database (fallback to environment variable)
    let passwordHash = await systemSettingsRepository.getPasswordHash();

    // Fallback to environment variable if not in database
    if (!passwordHash) {
      passwordHash = process.env.QMS_PASSWORD_HASH || null;
    }

    if (!passwordHash) {
      authLogger.error('Password hash is not configured in database or environment');
      return createInternalErrorResponse('认证未配置');
    }

    // Verify password
    const isValid = await verifyPassword(password, passwordHash);

    if (!isValid) {
      // Record failed attempt
      recordFailedAttempt(ip);
      authLogger.warn('Invalid login attempt', { ip });

      return createUnauthorizedResponse('密码错误');
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(ip);
    authLogger.info('Successful login', { ip, remember });

    // Generate JWT token
    const duration = remember ? SESSION_DURATION.remember : SESSION_DURATION.default;
    const token = generateJWT({ userId: 'owner', remember: !!remember }, duration);

    // Create response with unified format
    const response = createSuccessResponse({
      authenticated: true,
      message: '登录成功',
    });

    // Set HTTP-only cookie
    response.cookies.set('qms-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: duration,
      path: '/',
    });

    return response;
  } catch (error) {
    authLogger.error('Login error', error as Error);
    return createInternalErrorResponse('登录过程中发生错误', error);
  }
}
