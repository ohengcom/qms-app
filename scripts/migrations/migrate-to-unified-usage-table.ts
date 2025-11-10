/**
 * Migrate from current_usage + usage_periods to unified usage_records table
 * This script will:
 * 1. Create new usage_records table
 * 2. Migrate data from both old tables
 * 3. Verify data integrity
 * 4. Drop old tables (optional)
 */

import { sql } from '@/lib/neon';

async function migrateToUnifiedUsageTable() {
  console.log('🚀 Starting migration to unified usage_records table...\n');

  try {
    // Step 1: Create new usage_records table
    console.log('📋 Step 1: Creating new usage_records table...');
    await sql`
      CREATE TABLE IF NOT EXISTS usage_records (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        quilt_id TEXT NOT NULL REFERENCES quilts(id) ON DELETE CASCADE,
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        usage_type TEXT CHECK (usage_type IN ('REGULAR', 'GUEST', 'SPECIAL_OCCASION', 'SEASONAL_ROTATION')) DEFAULT 'REGULAR',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Table created\n');

    // Step 2: Create indexes
    console.log('📋 Step 2: Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_quilt_id 
      ON usage_records(quilt_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_dates 
      ON usage_records(start_date, end_date)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_usage_records_active 
      ON usage_records(quilt_id) 
      WHERE end_date IS NULL
    `;
    console.log('✅ Indexes created\n');

    // Step 3: Create unique constraint
    console.log('📋 Step 3: Creating unique constraint...');
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_per_quilt
      ON usage_records(quilt_id)
      WHERE end_date IS NULL
    `;
    console.log('✅ Unique constraint created\n');

    // Step 4: Check if old tables exist
    console.log('📋 Step 4: Checking for old tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('current_usage', 'usage_periods')
    `;
    const tableNames = tables.map((t: any) => t.table_name);
    console.log('Found tables:', tableNames);

    // Step 5: Migrate data from current_usage
    if (tableNames.includes('current_usage')) {
      console.log('\n📋 Step 5: Migrating data from current_usage...');
      const currentUsageData = await sql`SELECT * FROM current_usage`;
      console.log(`Found ${currentUsageData.length} active usage records`);

      if (currentUsageData.length > 0) {
        for (const record of currentUsageData) {
          await sql`
            INSERT INTO usage_records (
              id, quilt_id, start_date, end_date, usage_type, notes, created_at
            ) VALUES (
              ${record.id},
              ${record.quilt_id},
              ${record.started_at},
              NULL,
              ${record.usage_type || 'REGULAR'},
              ${record.notes || null},
              ${record.created_at || new Date().toISOString()}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }
        console.log(`✅ Migrated ${currentUsageData.length} records from current_usage`);
      }
    }

    // Step 6: Migrate data from usage_periods
    if (tableNames.includes('usage_periods')) {
      console.log('\n📋 Step 6: Migrating data from usage_periods...');
      const usagePeriodsData = await sql`SELECT * FROM usage_periods`;
      console.log(`Found ${usagePeriodsData.length} historical usage records`);

      if (usagePeriodsData.length > 0) {
        for (const record of usagePeriodsData) {
          await sql`
            INSERT INTO usage_records (
              id, quilt_id, start_date, end_date, usage_type, notes, created_at
            ) VALUES (
              ${record.id},
              ${record.quilt_id},
              ${record.start_date},
              ${record.end_date},
              ${record.usage_type || 'REGULAR'},
              ${record.notes || null},
              ${record.created_at || new Date().toISOString()}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        }
        console.log(`✅ Migrated ${usagePeriodsData.length} records from usage_periods`);
      }
    }

    // Step 7: Verify data
    console.log('\n📋 Step 7: Verifying migrated data...');
    const totalRecords = await sql`SELECT COUNT(*) as count FROM usage_records`;
    const activeRecords = await sql`
      SELECT COUNT(*) as count FROM usage_records WHERE end_date IS NULL
    `;
    const completedRecords = await sql`
      SELECT COUNT(*) as count FROM usage_records WHERE end_date IS NOT NULL
    `;

    console.log('✅ Verification results:');
    console.log(`   Total records: ${totalRecords[0].count}`);
    console.log(`   Active records: ${activeRecords[0].count}`);
    console.log(`   Completed records: ${completedRecords[0].count}`);

    // Step 8: Check for duplicates
    console.log('\n📋 Step 8: Checking for duplicate active records...');
    const duplicates = await sql`
      SELECT quilt_id, COUNT(*) as count
      FROM usage_records
      WHERE end_date IS NULL
      GROUP BY quilt_id
      HAVING COUNT(*) > 1
    `;

    if (duplicates.length > 0) {
      console.warn('⚠️  Found duplicate active records:');
      console.table(duplicates);
    } else {
      console.log('✅ No duplicate active records found');
    }

    // Step 9: Show table structure
    console.log('\n📋 Step 9: Final table structure:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'usage_records'
      ORDER BY ordinal_position
    `;
    console.table(columns);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT: Old tables (current_usage, usage_periods) are still present.');
    console.log('   After verifying everything works correctly, you can drop them by running:');
    console.log('   npm run drop-old-usage-tables');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateToUnifiedUsageTable()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
