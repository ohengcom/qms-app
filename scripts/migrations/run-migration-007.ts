/**
 * Migration Script: Create notifications table
 * Run with: npx tsx scripts/run-migration-007.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Load environment variables
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

let envLoaded = false;
if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (result.error) {
    console.error('Error loading .env.local:', result.error);
  } else {
    console.log('Loaded environment from .env.local');
    envLoaded = true;
  }
} else if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env:', result.error);
  } else {
    console.log('Loaded environment from .env');
    envLoaded = true;
  }
}

if (!envLoaded) {
  console.error('No .env or .env.local file found!');
  process.exit(1);
}

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables!');
  console.error('Please make sure DATABASE_URL is set in your .env.local file');
  process.exit(1);
}

console.log('✓ DATABASE_URL is configured');

// Create SQL client
const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🚀 Starting migration 007: Create notifications table...');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '007_create_notifications.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 80) + '...');
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Migration 007 completed successfully!');
    console.log('📋 Created:');
    console.log('   - notifications table');
    console.log('   - Indexes for performance optimization');
    console.log('   - Trigger for updated_at timestamp');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
