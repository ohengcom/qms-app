import { NextResponse } from 'next/server';
import { authLogger } from '@/lib/logger';

export async function POST() {
  try {
    authLogger.info('User logging out');

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

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
    return NextResponse.json({ message: 'An error occurred during logout' }, { status: 500 });
  }
}
