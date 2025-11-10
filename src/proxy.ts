/**
 * Next.js 16 Proxy Configuration
 * Replaces deprecated middleware.ts
 * 
 * Handles authentication and route protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { authLogger } from '@/lib/logger';

// Define protected routes that require authentication
const protectedPaths = [
  '/', // Dashboard/home page
  '/quilts',
  '/usage',
  '/settings',
  '/analytics',
];

// Define API routes that require authentication
const protectedApiPaths = [
  '/api/trpc', // tRPC endpoints (quilts, usage, etc.)
  '/api/dashboard',
  '/api/admin',
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API routes
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Allow health check, public API routes, and static files
  if (
    pathname === '/api/health' || 
    pathname === '/api/db-test' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname === '/clear-cache.html'
  ) {
    return NextResponse.next();
  }

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => {
    if (path === '/') {
      return pathname === '/'; // Exact match for root
    }
    return pathname.startsWith(path);
  });
  const isProtectedApiPath = protectedApiPaths.some(path => pathname.startsWith(path));

  if (!isProtectedPath && !isProtectedApiPath) {
    // Public route, allow access
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('qms-session');

  if (!sessionCookie) {
    // No session, redirect to login
    authLogger.warn('Unauthorized access attempt', { pathname });
    
    if (isProtectedApiPath) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify JWT token
  try {
    verifyJWT(sessionCookie.value);
    // Token is valid, allow access
    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    authLogger.warn('Invalid or expired session token', { pathname, error: (error as Error).message });

    // Clear invalid cookie
    const response = isProtectedApiPath
      ? NextResponse.json({ message: 'Session expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('qms-session');
    return response;
  }
}

// Configure which routes to run proxy on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
