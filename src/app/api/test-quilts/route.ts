import { NextResponse } from 'next/server';
import { quiltRepository } from '@/lib/repositories/quilt.repository';

export async function GET() {
  try {
    const quilts = await quiltRepository.findAll({ limit: 5 });
    
    const count = await quiltRepository.count();
    
    return NextResponse.json({
      success: true,
      quiltsFound: quilts.length,
      totalCount: count,
      sampleQuilts: quilts.slice(0, 2),
    });
  } catch (error) {
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
