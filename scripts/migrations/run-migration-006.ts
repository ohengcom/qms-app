/**
 * Migration Script: Add image fields to quilts table
 * Run with: npm run migrate:images
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Load environment variables
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('Loaded environment from .env.local');
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded environment from .env');
} else {
  console.error('No .env or .env.local file found!');
  process.exit(1);
}

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables!');
  process.exit(1);
}

// Create SQL client
const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('Starting migration 006: Add quilt images...');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '006_add_quilt_images.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 100) + '...');
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Migration 006 completed successfully!');
    console.log('Added fields:');
    console.log('  - main_image (TEXT)');
    console.log('  - attachment_images (TEXT[])');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
