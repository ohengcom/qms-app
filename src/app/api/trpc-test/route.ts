import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function GET() {
  try {
    console.log('TRPC Test: Starting diagnostic...');

    // Test environment variables
    const hasDbUrl = !!process.env.DATABASE_URL;
    console.log('TRPC Test: DATABASE_URL exists:', hasDbUrl);

    // Test database connection
    console.log('TRPC Test: Testing database connection...');
    const connectionTest = await db.testConnection();
    console.log('TRPC Test: Connection result:', connectionTest);

    // Test getting quilts
    console.log('TRPC Test: Testing getQuilts...');
    const quilts = await db.getQuilts({ limit: 5 });
    console.log('TRPC Test: Quilts result:', quilts?.length || 0, 'records');

    // Test count
    console.log('TRPC Test: Testing countQuilts...');
    const count = await db.countQuilts();
    console.log('TRPC Test: Count result:', count);

    return NextResponse.json({
      status: 'success',
      diagnostics: {
        hasDbUrl,
        connectionTest,
        quiltsCount: quilts?.length || 0,
        totalCount: count,
        firstQuilt: quilts?.[0] || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('TRPC Test: Error occurred:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
