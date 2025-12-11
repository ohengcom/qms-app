/**
 * Migration Script: Add single active usage record constraint
 *
 * Requirements: 13.2 - Single active usage record
 *
 * This script adds a partial unique index to ensure each quilt
 * can have at most one active usage record.
 *
 * Usage: npx tsx scripts/migrations/run-migration-008.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('🚀 Starting migration: Add single active usage record constraint');
  console.log('');

  try {
    // First, check if there are any quilts with multiple active usage records
    console.log('📋 Checking for existing violations...');
    const violations = await sql`
      SELECT quilt_id, COUNT(*) as active_count
      FROM usage_records
      WHERE end_date IS NULL
      GROUP BY quilt_id
      HAVING COUNT(*) > 1
    `;

    if (violations.length > 0) {
      console.log('⚠️  Found quilts with multiple active usage records:');
      for (const v of violations) {
        console.log(`   - Quilt ${v.quilt_id}: ${v.active_count} active records`);
      }
      console.log('');
      console.log('🔧 Fixing violations by keeping only the most recent active record...');

      // For each quilt with violations, keep only the most recent active record
      for (const v of violations) {
        await sql`
          UPDATE usage_records
          SET end_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE quilt_id = ${v.quilt_id}
            AND end_date IS NULL
            AND id NOT IN (
              SELECT id FROM usage_records
              WHERE quilt_id = ${v.quilt_id}
                AND end_date IS NULL
              ORDER BY start_date DESC
              LIMIT 1
            )
        `;
        console.log(`   ✅ Fixed quilt ${v.quilt_id}`);
      }
      console.log('');
    } else {
      console.log('✅ No violations found');
      console.log('');
    }

    // Check if index already exists
    console.log('📋 Checking if index already exists...');
    const existingIndex = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE indexname = 'idx_usage_records_single_active_per_quilt'
    `;

    if (existingIndex.length > 0) {
      console.log('ℹ️  Index already exists, skipping creation');
    } else {
      // Create the partial unique index
      console.log('📝 Creating partial unique index...');
      await sql`
        CREATE UNIQUE INDEX idx_usage_records_single_active_per_quilt
        ON usage_records (quilt_id)
        WHERE end_date IS NULL
      `;
      console.log('✅ Index created successfully');
    }

    // Add comment to the index
    console.log('📝 Adding index comment...');
    await sql`
      COMMENT ON INDEX idx_usage_records_single_active_per_quilt IS 
      'Ensures each quilt can have at most one active usage record (end_date IS NULL). Requirements: 13.2'
    `;
    console.log('✅ Comment added');

    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('The following constraint is now in place:');
    console.log('- Each quilt can have at most one active usage record (end_date IS NULL)');
    console.log('- Multiple completed usage records (with end_date set) are still allowed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
