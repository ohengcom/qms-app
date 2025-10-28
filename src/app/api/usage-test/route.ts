import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET /api/usage-test - Test usage table structure
export async function GET(request: NextRequest) {
  try {
    console.log('Testing usage table structure...');

    // Check usage_periods table structure
    const usagePeriodsStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'usage_periods' 
      ORDER BY ordinal_position
    `;

    console.log('usage_periods structure:', usagePeriodsStructure);

    // Try to select from usage_periods table
    let usagePeriodsData: any[] = [];
    try {
      usagePeriodsData = await sql`SELECT * FROM usage_periods LIMIT 5`;
    } catch (error) {
      console.log('Error selecting from usage_periods:', error);
    }

    // Check current_usage table structure
    const currentUsageStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'current_usage' 
      ORDER BY ordinal_position
    `;

    console.log('current_usage structure:', currentUsageStructure);

    return NextResponse.json({
      success: true,
      tables: {
        usage_periods: {
          structure: usagePeriodsStructure,
          data: usagePeriodsData,
          count: usagePeriodsData.length
        },
        current_usage: {
          structure: currentUsageStructure
        }
      }
    });

  } catch (error) {
    console.error('Usage test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test usage tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}