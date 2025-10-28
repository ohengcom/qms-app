import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function GET() {
  try {
    console.log('Direct quilts API: Fetching quilts...');

    // Get quilts from database
    const quilts = await db.getQuilts({
      limit: 50,
      offset: 0,
    });

    console.log('Direct quilts API: Quilts fetched:', quilts?.length || 0, 'records');

    // Get total count
    const total = await db.countQuilts();

    const response = {
      quilts: quilts || [],
      total: total || 0,
      hasMore: false,
    };

    console.log('Direct quilts API: Returning response with', response.quilts.length, 'quilts');

    return NextResponse.json(response);
  } catch (error) {
    console.error('Direct quilts API: Error occurred:', error);

    return NextResponse.json(
      {
        quilts: [],
        total: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
