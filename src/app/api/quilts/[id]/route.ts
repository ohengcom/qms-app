import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/neon';

// GET /api/quilts/[id] - Get quilt by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API /api/quilts/[id] GET: Starting for ID:', id);
    
    const quilt = await db.getQuiltById(id);
    
    if (!quilt) {
      return NextResponse.json(
        { error: 'Quilt not found' },
        { status: 404 }
      );
    }
    
    console.log('API /api/quilts/[id] GET: Success');
    return NextResponse.json(quilt);
  } catch (error) {
    console.error('API /api/quilts/[id] GET: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch quilt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/quilts/[id] - Update quilt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API /api/quilts/[id] PUT: Starting for ID:', id);
    
    const data = await request.json();
    console.log('API /api/quilts/[id] PUT: Data received:', data);
    
    const quilt = await db.updateQuilt(id, data);
    
    if (!quilt) {
      return NextResponse.json(
        { error: 'Quilt not found' },
        { status: 404 }
      );
    }
    
    console.log('API /api/quilts/[id] PUT: Success');
    return NextResponse.json(quilt);
  } catch (error) {
    console.error('API /api/quilts/[id] PUT: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update quilt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/quilts/[id] - Delete quilt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API /api/quilts/[id] DELETE: Starting for ID:', id);
    
    const success = await db.deleteQuilt(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Quilt not found' },
        { status: 404 }
      );
    }
    
    console.log('API /api/quilts/[id] DELETE: Success');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /api/quilts/[id] DELETE: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete quilt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}