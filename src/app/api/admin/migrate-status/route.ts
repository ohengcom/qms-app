import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function POST() {
  try {
    console.log('🔄 Starting status migration...');

    // Get count of AVAILABLE records
    const availableCount = await sql`
      SELECT COUNT(*) as count
      FROM quilts
      WHERE current_status = 'AVAILABLE'
    `;

    const count = Number(availableCount[0]?.count || 0);
    console.log(`📊 Found ${count} quilts with AVAILABLE status`);

    if (count > 0) {
      // Update AVAILABLE to STORAGE
      const result = await sql`
        UPDATE quilts
        SET current_status = 'STORAGE', updated_at = NOW()
        WHERE current_status = 'AVAILABLE'
        RETURNING id, item_number, name
      `;

      console.log(`✅ Migrated ${result.length} quilts from AVAILABLE to STORAGE`);

      // Get final status distribution
      const statusDist = await sql`
        SELECT current_status, COUNT(*) as count
        FROM quilts
        GROUP BY current_status
        ORDER BY current_status
      `;

      return NextResponse.json({
        success: true,
        migrated: result.length,
        records: result.map((r: any) => ({
          itemNumber: r.item_number,
          name: r.name,
        })),
        statusDistribution: statusDist.map((r: any) => ({
          status: r.current_status,
          count: Number(r.count),
        })),
      });
    } else {
      return NextResponse.json({
        success: true,
        migrated: 0,
        message: 'No AVAILABLE records found',
      });
    }
  } catch (error) {
    console.error('❌ Error migrating status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
