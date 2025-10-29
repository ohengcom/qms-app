import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

// Define protected routes that require authentication
const protectedPaths = [
  '/quilts',
  '/usage',
  '/import',
  '/export',
  '/settings',
  '/analytics',
  '/reports',
  '/seasonal',
  '/maintenance',
];

// Define API routes that require authentication
const protectedApiPaths = [
  '/api/quilts',
  '/api/usage',
  '/api/import',
  '/api/export',
  '/api/analytics',
  '/api/reports',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API routes
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isProtectedApiPath = protectedApiPaths.some(path => pathname.startsWith(path));

  if (!isProtectedPath && !isProtectedApiPath) {
    // Public route, allow access
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('qms-session');

  if (!sessionCookie) {
    // No session, redirect to login
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
    console.error('Invalid session token:', error);

    // Clear invalid cookie
    const response = isProtectedApiPath
      ? NextResponse.json({ message: 'Session expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('qms-session');
    return response;
  }
}

// Configure which routes to run middleware on
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
