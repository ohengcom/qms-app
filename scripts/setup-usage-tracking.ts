/**
 * Setup Usage Tracking Database Schema
 * Verifies and optimizes indexes for usage tracking automation
 * Uses unified usage_records table
 */

import { sql } from '@/lib/neon';

async function setupUsageTracking() {
  console.log('Setting up usage tracking schema...');

  try {
    // 1. Verify table exists
    console.log('1. Verifying usage_records table...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'usage_records'
    `;

    if (tables.length === 0) {
      throw new Error('usage_records table not found. Please run database setup first.');
    }
    console.log('✓ usage_records table found');

    // 2. Add indexes
    console.log('2. Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_quilt_id
      ON usage_records(quilt_id)
    `;
    console.log('✓ Index on quilt_id created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_dates
      ON usage_records(start_date, end_date)
    `;
    console.log('✓ Index on dates created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_active
      ON usage_records(quilt_id)
      WHERE end_date IS NULL
    `;
    console.log('✓ Index on active records created');

    // 3. Add unique constraint: one active record per quilt
    console.log('3. Creating unique constraint...');
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
    console.log('✓ usage_records structure:');
    console.table(columns);

    // 5. Check for duplicate active records
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

    // 6. Show statistics
    console.log('6. Usage statistics...');
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE end_date IS NULL) as active,
        COUNT(*) FILTER (WHERE end_date IS NOT NULL) as completed
      FROM usage_records
    `;
    console.log('✓ Statistics:');
    console.table(stats);

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
  .catch(error => {
    console.error('\nSetup failed:', error);
    process.exit(1);
  });
