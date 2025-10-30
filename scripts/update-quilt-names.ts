/**
 * Script to update existing quilt names based on new naming convention
 * Format: brand + color + weight + unit + season + 被
 * Example: 百思寒褐色1100克春秋被
 *
 * Usage: DATABASE_URL="your-connection-string" npm run update-quilt-names
 */

import { neon } from '@neondatabase/serverless';

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is not set');
  console.error('Usage: DATABASE_URL="your-connection-string" npm run update-quilt-names');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Helper function to generate quilt name
function generateQuiltName(quilt: any): string {
  const brand = quilt.brand || '无';
  const color = quilt.color || '未知颜色';
  const weight = quilt.weight_grams || 0;

  // Map season to Chinese
  const seasonMap: Record<string, string> = {
    WINTER: '冬',
    SPRING_AUTUMN: '春秋',
    SUMMER: '夏',
  };
  const season = seasonMap[quilt.season] || '通用';

  return `${brand}${color}${weight}克${season}被`;
}

async function updateQuiltNames() {
  try {
    console.log('🔄 Starting quilt name update...\n');

    // Get all quilts
    const quilts = await sql`
      SELECT id, item_number, name, brand, color, weight_grams, season
      FROM quilts
      ORDER BY item_number
    `;

    console.log(`📊 Found ${quilts.length} quilts to update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Update each quilt
    for (const quilt of quilts) {
      const newName = generateQuiltName(quilt);
      const oldName = quilt.name;

      if (oldName === newName) {
        console.log(`⏭️  #${quilt.item_number}: Already correct - "${newName}"`);
        skippedCount++;
        continue;
      }

      // Update the quilt name
      await sql`
        UPDATE quilts
        SET name = ${newName}, updated_at = NOW()
        WHERE id = ${quilt.id}
      `;

      console.log(`✅ #${quilt.item_number}: "${oldName}" → "${newName}"`);
      updatedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✨ Update complete!`);
    console.log(`   Updated: ${updatedCount} quilts`);
    console.log(`   Skipped: ${skippedCount} quilts (already correct)`);
    console.log(`   Total:   ${quilts.length} quilts`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Error updating quilt names:', error);
    throw error;
  }
}

// Run the update
updateQuiltNames()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
