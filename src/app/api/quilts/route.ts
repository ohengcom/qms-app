import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/neon';

// GET /api/quilts - Get all quilts
export async function GET(request: NextRequest) {
  try {
    console.log('API /api/quilts GET: Starting...');
    
    const quilts = await db.getQuilts();
    const total = await db.countQuilts();
    
    console.log('API /api/quilts GET: Success, returning', quilts.length, 'quilts');
    if (quilts.length > 0) {
      console.log('API /api/quilts GET: First quilt dimensions:', {
        lengthCm: quilts[0].lengthCm,
        widthCm: quilts[0].widthCm,
        weightGrams: quilts[0].weightGrams,
      });
    }
    
    return NextResponse.json({
      quilts,
      total,
      success: true,
    });
  } catch (error) {
    console.error('API /api/quilts GET: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch quilts',
        details: error instanceof Error ? error.message : 'Unknown error',
        quilts: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

// POST /api/quilts - Create new quilt
export async function POST(request: NextRequest) {
  try {
    console.log('API /api/quilts POST: Starting...');
    
    const data = await request.json();
    console.log('API /api/quilts POST: Data received:', data);
    
    const quilt = await db.createQuilt(data);
    
    console.log('API /api/quilts POST: Quilt created successfully:', quilt.id);
    
    return NextResponse.json(quilt);
  } catch (error) {
    console.error('API /api/quilts POST: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create quilt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}