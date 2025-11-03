import { NextResponse } from 'next/server';
import { quiltRepository } from '@/lib/repositories/quilt.repository';

export async function GET() {
  try {
    console.log('Testing quilt repository...');
    
    const quilts = await quiltRepository.findAll({ limit: 5 });
    console.log('Found quilts:', quilts.length);
    
    const count = await quiltRepository.count();
    console.log('Total count:', count);
    
    return NextResponse.json({
      success: true,
      quiltsFound: quilts.length,
      totalCount: count,
      sampleQuilts: quilts.slice(0, 2),
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
