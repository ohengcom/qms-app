import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export const dynamic = 'force-dynamic';

// This endpoint creates sample historical usage records for testing
export async function POST() {
  try {
    // Get all quilts
    const quilts = await sql`SELECT id, name, item_number, season FROM quilts LIMIT 10`;

    if (quilts.length === 0) {
      return NextResponse.json(
        { error: 'No quilts found. Please add some quilts first.' },
        { status: 400 }
      );
    }

    // Get today's month and day
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const records = [];

    // Create historical records for the past 3 years on the same date
    for (let yearOffset = 1; yearOffset <= 3; yearOffset++) {
      const year = today.getFullYear() - yearOffset;

      // Pick a random quilt for each year
      const randomQuilt = quilts[Math.floor(Math.random() * quilts.length)];

      // Create start date (same month/day, previous year)
      const startDate = new Date(year, currentMonth - 1, currentDay);

      // Create end date (7-30 days later)
      const daysUsed = Math.floor(Math.random() * 24) + 7; // 7-30 days
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + daysUsed);

      const id = crypto.randomUUID();

      await sql`
        INSERT INTO usage_records (
          id,
          quilt_id,
          start_date,
          end_date,
          usage_type,
          notes,
          created_at,
          updated_at
        ) VALUES (
          ${id},
          ${randomQuilt.id},
          ${startDate.toISOString()},
          ${endDate.toISOString()},
          'PERSONAL',
          ${`Historical usage record for ${year}`},
          ${new Date().toISOString()},
          ${new Date().toISOString()}
        )
      `;

      records.push({
        id,
        quiltId: randomQuilt.id,
        quiltName: randomQuilt.name,
        itemNumber: randomQuilt.item_number,
        season: randomQuilt.season,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        year,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${records.length} historical usage records`,
      records,
    });
  } catch (error) {
    console.error('Error seeding historical data:', error);
    return NextResponse.json(
      { error: 'Failed to seed historical data', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check if historical data exists
export async function GET() {
  try {
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const result = await sql`
      SELECT 
        u.id,
        u.quilt_id as "quiltId",
        u.start_date as "startDate",
        u.end_date as "endDate",
        q.name as "quiltName",
        q.item_number as "itemNumber",
        q.season,
        EXTRACT(YEAR FROM u.start_date) as year
      FROM usage_records u
      JOIN quilts q ON u.quilt_id = q.id
      WHERE 
        TO_CHAR(u.start_date, 'MM-DD') = ${monthDay}
        AND EXTRACT(YEAR FROM u.start_date) < EXTRACT(YEAR FROM CURRENT_DATE)
      ORDER BY u.start_date DESC
    `;

    return NextResponse.json({
      count: result.length,
      monthDay,
      records: result,
    });
  } catch (error) {
    console.error('Error checking historical data:', error);
    return NextResponse.json(
      { error: 'Failed to check historical data', details: String(error) },
      { status: 500 }
    );
  }
}
