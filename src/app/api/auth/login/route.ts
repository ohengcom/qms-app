import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const { password, remember } = await request.json();

    // Validate input
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    // Get client IP for rate limiting
    const ip = getClientIP(request.headers);

    // Check rate limiting
    if (isRateLimited(ip)) {
      authLogger.warn('Rate limit exceeded', { ip });
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // Get password hash from database (fallback to environment variable)
    let passwordHash = await systemSettingsRepository.getPasswordHash();

    // Fallback to environment variable if not in database
    if (!passwordHash) {
      passwordHash = process.env.QMS_PASSWORD_HASH || null;
    }

    if (!passwordHash) {
      authLogger.error('Password hash is not configured in database or environment');
      return NextResponse.json({ message: 'Authentication is not configured' }, { status: 500 });
    }

    // Verify password
    const isValid = await verifyPassword(password, passwordHash);

    if (!isValid) {
      // Record failed attempt
      recordFailedAttempt(ip);
      authLogger.warn('Invalid login attempt', { ip });

      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(ip);
    authLogger.info('Successful login', { ip, remember });

    // Generate JWT token
    const duration = remember ? SESSION_DURATION.remember : SESSION_DURATION.default;
    const token = generateJWT({ userId: 'owner', remember: !!remember }, duration);

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

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
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  }
}
