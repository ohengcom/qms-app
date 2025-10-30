/**
 * Setup Usage Tracking Database Schema
 * Adds necessary indexes and constraints for usage tracking automation
 */

import { sql } from '@/lib/neon';

async function setupUsageTracking() {
  console.log('Setting up usage tracking schema...');

  try {
    // 1. Ensure status column exists
    console.log('1. Checking status column...');
    await sql`
      ALTER TABLE usage_records 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE'
    `;
    console.log('✓ Status column ready');

    // 2. Add index for active records query optimization
    console.log('2. Creating index for active records...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_quilt_status
      ON usage_records(quilt_id, status)
      WHERE end_date IS NULL
    `;
    console.log('✓ Index created');

    // 3. Add unique constraint: one active record per quilt
    console.log('3. Creating unique constraint for active records...');
    try {
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_per_quilt
        ON usage_records(quilt_id)
        WHERE end_date IS NULL
      `;
      console.log('✓ Unique constraint created');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('✓ Unique constraint already exists');
      } else {
        throw error;
      }
    }

    // 4. Verify table structure
    console.log('4. Verifying table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'usage_records'
      ORDER BY ordinal_position
    `;
    console.log('✓ Table structure:');
    console.table(columns);

    // 5. Check for any existing duplicate active records
    console.log('5. Checking for duplicate active records...');
    const duplicates = await sql`
      SELECT quilt_id, COUNT(*) as count
      FROM usage_records
      WHERE end_date IS NULL
      GROUP BY quilt_id
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length > 0) {
      console.warn('⚠ Found duplicate active records:');
      console.table(duplicates);
      console.warn('Please manually resolve these duplicates before proceeding.');
    } else {
      console.log('✓ No duplicate active records found');
    }

    console.log('\n✅ Usage tracking setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up usage tracking:', error);
    throw error;
  }
}

// Run the setup
setupUsageTracking()
  .then(() => {
    console.log('\nSetup completed. You can now use the usage tracking automation.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nSetup failed:', error);
    process.exit(1);
  });
