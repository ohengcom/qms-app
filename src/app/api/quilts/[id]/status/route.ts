import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newStatus, startDate, endDate, notes } = body;

    console.log('Smart status update for quilt:', id, 'to:', newStatus);

    // Get current quilt data
    const currentQuilt = await db.getQuiltById(id);
    if (!currentQuilt) {
      return NextResponse.json({ error: 'Quilt not found' }, { status: 404 });
    }

    const oldStatus = currentQuilt.current_status;
    let usageRecord = null;

    // Logic 1: Changing TO IN_USE - Create new usage record
    if (newStatus === 'IN_USE' && oldStatus !== 'IN_USE') {
      console.log('Creating new usage record...');
      const recordStartDate = startDate || new Date().toISOString().split('T')[0];
      usageRecord = await db.createUsageRecord(id, recordStartDate, notes);
    }

    // Logic 2: Changing FROM IN_USE - End active usage record
    if (oldStatus === 'IN_USE' && newStatus !== 'IN_USE') {
      console.log('Ending active usage record...');
      const recordEndDate = endDate || new Date().toISOString().split('T')[0];
      usageRecord = await db.endUsageRecord(id, recordEndDate);
    }

    // Update quilt status
    const updatedQuilt = await db.updateQuiltStatus(id, newStatus);

    return NextResponse.json({
      success: true,
      quilt: updatedQuilt,
      usageRecord,
      message:
        newStatus === 'IN_USE'
          ? 'Quilt status updated and usage tracking started'
          : oldStatus === 'IN_USE'
            ? 'Quilt status updated and usage tracking ended'
            : 'Quilt status updated',
    });
  } catch (error) {
    console.error('Smart status update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
