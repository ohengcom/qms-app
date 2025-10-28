import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/neon';

// PATCH /api/quilts/[id]/status - Update quilt status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API /api/quilts/[id]/status PATCH: Starting for ID:', id);
    
    const { status } = await request.json();
    console.log('API /api/quilts/[id]/status PATCH: New status:', status);
    
    if (!status || !['AVAILABLE', 'IN_USE', 'STORAGE', 'MAINTENANCE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const quilt = await db.updateQuiltStatus(id, status);
    
    if (!quilt) {
      return NextResponse.json(
        { error: 'Quilt not found' },
        { status: 404 }
      );
    }
    
    console.log('API /api/quilts/[id]/status PATCH: Success');
    return NextResponse.json(quilt);
  } catch (error) {
    console.error('API /api/quilts/[id]/status PATCH: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update quilt status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}