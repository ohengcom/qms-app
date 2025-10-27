import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function GET() {
  try {
    console.log('Debug: Testing quilts query...');
    
    // Test basic connection
    const connectionTest = await db.testConnection();
    console.log('Connection test:', connectionTest);
    
    // Get quilts directly
    const quilts = await db.getQuilts();
    console.log('Quilts result:', quilts);
    
    // Get count
    const count = await db.countQuilts();
    console.log('Count result:', count);
    
    return NextResponse.json({
      status: 'success',
      connection: connectionTest,
      quiltsCount: quilts?.length || 0,
      totalCount: count,
      quilts: quilts || [],
      debug: 'Direct database query test'
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}