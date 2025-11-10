/**
 * Script to migrate AVAILABLE status to STORAGE
 * Removes AVAILABLE status from the system
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is not set');
  console.error('Usage: DATABASE_URL="your-connection-string" npm run migrate-status');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrateStatus() {
  try {
    console.log('🔄 Starting status migration...\n');

    // Get count of AVAILABLE records
    const availableCount = await sql`
      SELECT COUNT(*) as count
      FROM quilts
      WHERE current_status = 'AVAILABLE'
    `;

    console.log(`📊 Found ${availableCount[0]?.count || 0} quilts with AVAILABLE status\n`);

    if (availableCount[0]?.count > 0) {
      // Update AVAILABLE to STORAGE
      const result = await sql`
        UPDATE quilts
        SET current_status = 'STORAGE', updated_at = NOW()
        WHERE current_status = 'AVAILABLE'
        RETURNING id, item_number, name
      `;

      console.log('✅ Updated records:');
      result.forEach((quilt: any) => {
        console.log(`   #${quilt.item_number}: ${quilt.name}`);
      });

      console.log(`\n✨ Successfully migrated ${result.length} quilts from AVAILABLE to STORAGE`);
    } else {
      console.log('✅ No AVAILABLE records found. Migration not needed.');
    }

    // Show final status distribution
    const statusDist = await sql`
      SELECT current_status, COUNT(*) as count
      FROM quilts
      GROUP BY current_status
      ORDER BY current_status
    `;

    console.log('\n📊 Current status distribution:');
    statusDist.forEach((row: any) => {
      console.log(`   ${row.current_status}: ${row.count}`);
    });
  } catch (error) {
    console.error('❌ Error migrating status:', error);
    throw error;
  }
}

// Run the migration
migrateStatus()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
