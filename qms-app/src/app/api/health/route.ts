import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    
    // Check Redis connection (if using Redis)
    // You can add Redis health check here if needed
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: 'connected',
      // redis: 'connected', // Add if using Redis
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(healthStatus, { status: 503 });
  }
}