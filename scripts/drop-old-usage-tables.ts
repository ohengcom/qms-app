/**
 * Drop old usage tables after successful migration
 * WARNING: This will permanently delete current_usage and usage_periods tables
 */

import { sql } from '@/lib/neon';
import * as readline from 'readline';

async function dropOldUsageTables() {
  console.log('⚠️  WARNING: This will permanently delete the following tables:');
  console.log('   - current_usage');
  console.log('   - usage_periods');
  console.log('\n   Make sure you have verified that the new usage_records table works correctly!');
  
  // Create readline interface for user confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('\nType "DELETE" to confirm: ', resolve);
  });
  rl.close();

  if (answer !== 'DELETE') {
    console.log('\n❌ Operation cancelled.');
    process.exit(0);
  }

  try {
    console.log('\n🗑️  Dropping old tables...');

    // Drop current_usage table
    await sql`DROP TABLE IF EXISTS current_usage CASCADE`;
    console.log('✅ Dropped current_usage table');

    // Drop usage_periods table
    await sql`DROP TABLE IF EXISTS usage_periods CASCADE`;
    console.log('✅ Dropped usage_periods table');

    // Verify tables are gone
    const remainingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('current_usage', 'usage_periods')
    `;

    if (remainingTables.length === 0) {
      console.log('\n✅ Old tables successfully removed!');
    } else {
      console.warn('\n⚠️  Some tables still exist:', remainingTables);
    }

  } catch (error) {
    console.error('\n❌ Error dropping tables:', error);
    throw error;
  }
}

// Run the cleanup
dropOldUsageTables()
  .then(() => {
    console.log('\n✨ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });
