/**
 * Setup Usage Tracking Database Schema
 * Verifies and optimizes indexes for usage tracking automation
 * Uses existing current_usage and usage_periods tables
 */

import { sql } from '@/lib/neon';

async function setupUsageTracking() {
  console.log('Setting up usage tracking schema...');

  try {
    // 1. Verify tables exist
    console.log('1. Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('current_usage', 'usage_periods')
    `;
    
    const tableNames = tables.map((t: any) => t.table_name);
    console.log('✓ Found tables:', tableNames);

    if (!tableNames.includes('current_usage')) {
      throw new Error('current_usage table not found');
    }
    if (!tableNames.includes('usage_periods')) {
      throw new Error('usage_periods table not found');
    }

    // 2. Add indexes for current_usage
    console.log('2. Creating indexes for current_usage...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_current_usage_quilt_id
      ON current_usage(quilt_id)
    `;
    console.log('✓ Index on quilt_id created');

    // 3. Add unique constraint: one active record per quilt
    console.log('3. Creating unique constraint for current_usage...');
    try {
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_one_current_per_quilt
        ON current_usage(quilt_id)
      `;
      console.log('✓ Unique constraint created');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('✓ Unique constraint already exists');
      } else {
        throw error;
      }
    }

    // 4. Add indexes for usage_periods
    console.log('4. Creating indexes for usage_periods...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_periods_quilt_id
      ON usage_periods(quilt_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_periods_dates
      ON usage_periods(start_date, end_date)
    `;
    console.log('✓ Indexes created');

    // 5. Verify table structures
    console.log('5. Verifying table structures...');
    
    const currentUsageColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'current_usage'
      ORDER BY ordinal_position
    `;
    console.log('✓ current_usage structure:');
    console.table(currentUsageColumns);

    const usagePeriodsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'usage_periods'
      ORDER BY ordinal_position
    `;
    console.log('✓ usage_periods structure:');
    console.table(usagePeriodsColumns);

    // 6. Check for duplicate current usage
    console.log('6. Checking for duplicate current usage...');
    const duplicates = await sql`
      SELECT quilt_id, COUNT(*) as count
      FROM current_usage
      GROUP BY quilt_id
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length > 0) {
      console.warn('⚠ Found duplicate current usage records:');
      console.table(duplicates);
      console.warn('Please manually resolve these duplicates before proceeding.');
    } else {
      console.log('✓ No duplicate current usage records found');
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
