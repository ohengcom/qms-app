import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

// Helper function to generate quilt name
function generateQuiltName(quilt: any): string {
  const brand = quilt.brand || '无';
  const color = quilt.color || '未知颜色';
  const weight = quilt.weightGrams || 0;

  // Map season to Chinese
  const seasonMap: Record<string, string> = {
    WINTER: '冬',
    SPRING_AUTUMN: '春秋',
    SUMMER: '夏',
  };
  const season = seasonMap[quilt.season] || '通用';

  return `${brand}${color}${weight}克${season}被`;
}

export async function POST() {
  try {
    console.log('🔄 Starting quilt name update...');

    // Get all quilts using the db helper
    const quilts = await db.getQuilts({ limit: 100 });

    console.log(`📊 Found ${quilts.length} quilts to update`);

    const updates = [];
    let updatedCount = 0;
    let skippedCount = 0;

    // Update each quilt
    for (const quilt of quilts) {
      const newName = generateQuiltName(quilt);
      const oldName = quilt.name;

      if (oldName === newName) {
        console.log(`⏭️  #${quilt.itemNumber}: Already correct - "${newName}"`);
        skippedCount++;
        updates.push({
          itemNumber: quilt.itemNumber,
          oldName,
          newName,
          status: 'skipped',
          reason: 'already correct',
        });
        continue;
      }

      // Update the quilt name
      await db.updateQuilt(quilt.id, {
        ...quilt,
        name: newName,
      });

      console.log(`✅ #${quilt.itemNumber}: "${oldName}" → "${newName}"`);
      updatedCount++;
      updates.push({
        itemNumber: quilt.itemNumber,
        oldName,
        newName,
        status: 'updated',
      });
    }

    const summary = {
      success: true,
      total: quilts.length,
      updated: updatedCount,
      skipped: skippedCount,
      updates,
    };

    console.log('✨ Update complete!');
    console.log(`   Updated: ${updatedCount} quilts`);
    console.log(`   Skipped: ${skippedCount} quilts`);
    console.log(`   Total:   ${quilts.length} quilts`);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('❌ Error updating quilt names:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
