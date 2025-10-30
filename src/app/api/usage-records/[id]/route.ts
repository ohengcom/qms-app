import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// PUT /api/usage-records/[id] - Update a usage record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate, usageType, notes } = body;

    if (!startDate) {
      return NextResponse.json(
        { success: false, error: 'Start date is required' },
        { status: 400 }
      );
    }

    // Validate dates
    if (endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { success: false, error: 'Start date cannot be after end date' },
        { status: 400 }
      );
    }

    // Validate usage type if provided
    if (usageType && !['REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION'].includes(usageType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid usage type' },
        { status: 400 }
      );
    }

    console.log('Updating usage record:', id);

    const now = new Date().toISOString();

    const result = await sql`
      UPDATE usage_records
      SET 
        start_date = ${startDate},
        end_date = ${endDate || null},
        usage_type = ${usageType || 'REGULAR'},
        notes = ${notes || null},
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usage record not found' },
        { status: 404 }
      );
    }

    console.log('Usage record updated successfully:', result[0]);

    return NextResponse.json({
      success: true,
      record: result[0],
      message: 'Usage record updated successfully',
    });
  } catch (error) {
    console.error('Update usage record error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update usage record',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/usage-records/[id] - Delete a usage record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('Deleting usage record:', id);

    const result = await sql`
      DELETE FROM usage_records
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Usage record not found' },
        { status: 404 }
      );
    }

    console.log('Usage record deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Usage record deleted successfully',
    });
  } catch (error) {
    console.error('Delete usage record error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete usage record',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
