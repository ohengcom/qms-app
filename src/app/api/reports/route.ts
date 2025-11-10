import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET /api/reports - Get report data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'inventory';
    const format = searchParams.get('format') || 'json';

    let reportData: any = {};

    switch (reportType) {
      case 'inventory':
        reportData = await generateInventoryReport();
        break;
      case 'usage':
        reportData = await generateUsageReport();
        break;
      case 'analytics':
        reportData = await generateAnalyticsReport();
        break;
      case 'status':
        reportData = await generateStatusReport();
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      const csv = convertToCSV(reportData, reportType);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reportType,
      generatedAt: new Date().toISOString(),
      data: reportData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function generateInventoryReport() {
  const quilts = await sql`
    SELECT 
      q.id,
      q.item_number,
      q.name,
      q.season,
      q.length_cm,
      q.width_cm,
      q.weight_grams,
      q.fill_material,
      q.color,
      q.brand,
      q.location,
      q.current_status,
      q.notes,
      q.created_at,
      q.updated_at
    FROM quilts q
    ORDER BY q.item_number
  `;

  return {
    summary: {
      totalQuilts: quilts.length,
      byStatus: {
        available: quilts.filter(q => q.current_status === 'AVAILABLE').length,
        inUse: quilts.filter(q => q.current_status === 'IN_USE').length,
        storage: quilts.filter(q => q.current_status === 'STORAGE').length,
        maintenance: quilts.filter(q => q.current_status === 'MAINTENANCE').length,
      },
      bySeason: {
        winter: quilts.filter(q => q.season === 'WINTER').length,
        springAutumn: quilts.filter(q => q.season === 'SPRING_AUTUMN').length,
        summer: quilts.filter(q => q.season === 'SUMMER').length,
      },
    },
    quilts: quilts.map(q => ({
      itemNumber: q.item_number,
      name: q.name,
      season: q.season,
      dimensions: `${q.length_cm}×${q.width_cm}cm`,
      weight: `${q.weight_grams}g`,
      material: q.fill_material,
      color: q.color,
      brand: q.brand,
      location: q.location,
      status: q.current_status,
      notes: q.notes,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    })),
  };
}

async function generateUsageReport() {
  const usagePeriods = await sql`
    SELECT 
      up.id,
      up.quilt_id,
      up.start_date,
      up.end_date,
      up.duration_days,
      up.usage_type,
      up.notes,
      q.name as quilt_name,
      q.item_number,
      q.season
    FROM usage_periods up
    JOIN quilts q ON up.quilt_id = q.id
    ORDER BY up.start_date DESC
  `;

  const currentUsage = await sql`
    SELECT 
      cu.id,
      cu.quilt_id,
      cu.started_at,
      cu.usage_type,
      cu.notes,
      q.name as quilt_name,
      q.item_number,
      q.season
    FROM current_usage cu
    JOIN quilts q ON cu.quilt_id = q.id
  `;

  return {
    summary: {
      totalUsagePeriods: usagePeriods.length,
      currentlyInUse: currentUsage.length,
      totalUsageDays: usagePeriods.reduce((sum, p) => sum + (p.duration_days || 0), 0),
      averageUsageDays:
        usagePeriods.length > 0
          ? Math.round(
              usagePeriods.reduce((sum, p) => sum + (p.duration_days || 0), 0) / usagePeriods.length
            )
          : 0,
    },
    usagePeriods: usagePeriods.map(p => ({
      quiltName: p.quilt_name,
      itemNumber: p.item_number,
      season: p.season,
      startDate: p.start_date,
      endDate: p.end_date,
      durationDays: p.duration_days,
      usageType: p.usage_type,
      notes: p.notes,
    })),
    currentUsage: currentUsage.map(c => ({
      quiltName: c.quilt_name,
      itemNumber: c.item_number,
      season: c.season,
      startedAt: c.started_at,
      usageType: c.usage_type,
      notes: c.notes,
      daysInUse: Math.floor(
        (new Date().getTime() - new Date(c.started_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
  };
}

async function generateAnalyticsReport() {
  // Reuse analytics data
  const quilts = await sql`SELECT season, current_status FROM quilts`;
  const usagePeriods = await sql`
    SELECT duration_days, start_date, q.season
    FROM usage_periods up
    JOIN quilts q ON up.quilt_id = q.id
  `;

  return {
    inventory: {
      total: quilts.length,
      statusDistribution: {
        available: quilts.filter(q => q.current_status === 'AVAILABLE').length,
        inUse: quilts.filter(q => q.current_status === 'IN_USE').length,
        storage: quilts.filter(q => q.current_status === 'STORAGE').length,
        maintenance: quilts.filter(q => q.current_status === 'MAINTENANCE').length,
      },
      seasonDistribution: {
        winter: quilts.filter(q => q.season === 'WINTER').length,
        springAutumn: quilts.filter(q => q.season === 'SPRING_AUTUMN').length,
        summer: quilts.filter(q => q.season === 'SUMMER').length,
      },
    },
    usage: {
      totalPeriods: usagePeriods.length,
      totalDays: usagePeriods.reduce((sum, p) => sum + (p.duration_days || 0), 0),
      averageDays:
        usagePeriods.length > 0
          ? Math.round(
              usagePeriods.reduce((sum, p) => sum + (p.duration_days || 0), 0) / usagePeriods.length
            )
          : 0,
      bySeason: {
        winter: usagePeriods.filter(p => p.season === 'WINTER').length,
        springAutumn: usagePeriods.filter(p => p.season === 'SPRING_AUTUMN').length,
        summer: usagePeriods.filter(p => p.season === 'SUMMER').length,
      },
    },
  };
}

async function generateStatusReport() {
  const quilts = await sql`
    SELECT 
      q.item_number,
      q.name,
      q.current_status,
      q.season,
      q.location,
      q.updated_at,
      cu.started_at as usage_started
    FROM quilts q
    LEFT JOIN current_usage cu ON q.id = cu.quilt_id
    ORDER BY q.current_status, q.item_number
  `;

  return {
    summary: {
      available: quilts.filter(q => q.current_status === 'AVAILABLE').length,
      inUse: quilts.filter(q => q.current_status === 'IN_USE').length,
      storage: quilts.filter(q => q.current_status === 'STORAGE').length,
      maintenance: quilts.filter(q => q.current_status === 'MAINTENANCE').length,
    },
    quilts: quilts.map(q => ({
      itemNumber: q.item_number,
      name: q.name,
      status: q.current_status,
      season: q.season,
      location: q.location,
      lastUpdated: q.updated_at,
      usageStarted: q.usage_started,
      daysInCurrentStatus: q.usage_started
        ? Math.floor(
            (new Date().getTime() - new Date(q.usage_started).getTime()) / (1000 * 60 * 60 * 24)
          )
        : null,
    })),
  };
}

function convertToCSV(data: any, reportType: string): string {
  let headers: string[] = [];
  let rows: any[] = [];

  switch (reportType) {
    case 'inventory':
      headers = [
        'Item Number',
        'Name',
        'Season',
        'Dimensions',
        'Weight',
        'Material',
        'Color',
        'Brand',
        'Location',
        'Status',
        'Notes',
      ];
      rows = data.quilts.map((q: any) => [
        q.itemNumber,
        q.name,
        q.season,
        q.dimensions,
        q.weight,
        q.material,
        q.color,
        q.brand,
        q.location,
        q.status,
        q.notes,
      ]);
      break;
    case 'usage':
      headers = [
        'Quilt Name',
        'Item Number',
        'Season',
        'Start Date',
        'End Date',
        'Duration Days',
        'Usage Type',
        'Notes',
      ];
      rows = data.usagePeriods.map((p: any) => [
        p.quiltName,
        p.itemNumber,
        p.season,
        p.startDate,
        p.endDate,
        p.durationDays,
        p.usageType,
        p.notes,
      ]);
      break;
    case 'status':
      headers = [
        'Item Number',
        'Name',
        'Status',
        'Season',
        'Location',
        'Last Updated',
        'Days in Status',
      ];
      rows = data.quilts.map((q: any) => [
        q.itemNumber,
        q.name,
        q.status,
        q.season,
        q.location,
        q.lastUpdated,
        q.daysInCurrentStatus,
      ]);
      break;
    default:
      headers = ['Data'];
      rows = [['No data available']];
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map((cell: any) => `"${cell || ''}"`).join(',')),
  ].join('\n');

  return csvContent;
}
