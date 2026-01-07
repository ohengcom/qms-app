/**
 * Authentication REST API - Logout
 *
 * POST /api/auth/logout - Log out user
 *
 * Requirements: 5.3 - Consistent API response format
 */

import { authLogger } from '@/lib/logger';
import { createSuccessResponse, createInternalErrorResponse } from '@/lib/api/response';

export async function POST() {
  try {
    authLogger.info('User logging out');

    // Create response with unified format
    const response = createSuccessResponse({
      loggedOut: true,
      message: '登出成功',
    });

    // Clear the session cookie
    response.cookies.set('qms-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    authLogger.error('Logout error', error as Error);
    return createInternalErrorResponse('登出过程中发生错误', error);
  }
}
