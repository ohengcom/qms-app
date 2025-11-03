import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET() {
  try {
    // Get raw data directly from database
    const rawQuilts = await sql`SELECT * FROM quilts LIMIT 3`;
    
    return NextResponse.json({
      message: 'Raw quilt data from database',
      count: rawQuilts.length,
      quilts: rawQuilts.map((q: any) => ({
        id: q.id,
        item_number: q.item_number,
        name: q.name,
        length_cm: q.length_cm,
        width_cm: q.width_cm,
        weight_grams: q.weight_grams,
        // Show all column names
        allColumns: Object.keys(q),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch debug data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
