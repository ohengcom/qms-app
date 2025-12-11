import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  return withRateLimit(request, rateLimiters.health, async () => {
    try {
      // Check database connection
      await sql`SELECT 1 as test`;

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
  });
}
