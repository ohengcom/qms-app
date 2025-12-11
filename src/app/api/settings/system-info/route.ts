/**
 * System Info API Route
 *
 * Returns system information including version from package.json
 */

import { NextResponse } from 'next/server';
import packageJson from '../../../../../package.json';

export async function GET() {
  try {
    return NextResponse.json({
      version: packageJson.version,
      framework: 'Next.js 16',
      deployment: 'Vercel',
      database: 'Neon PostgreSQL',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    return NextResponse.json({ error: 'Failed to fetch system info' }, { status: 500 });
  }
}
