/**
 * Initialize System Settings API
 *
 * This endpoint creates the system_settings table and initializes it with default values.
 * Should be called once after deployment to set up password storage in database.
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { hashPassword } from '@/lib/auth/password';
import { dbLogger } from '@/lib/logger';

export async function POST() {
  try {
    dbLogger.info('Starting system settings initialization...');

    // Create table
    dbLogger.info('Creating system_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key)
    `;

    // Create trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS trigger_update_system_settings_updated_at ON system_settings
    `;
    await sql`
      CREATE TRIGGER trigger_update_system_settings_updated_at
        BEFORE UPDATE ON system_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_system_settings_updated_at()
    `;

    dbLogger.info('Table and triggers created successfully');

    // Initialize password hash
    const envPasswordHash = process.env.QMS_PASSWORD_HASH;
    let passwordHash: string;

    if (envPasswordHash) {
      dbLogger.info('Using password hash from QMS_PASSWORD_HASH environment variable');
      passwordHash = envPasswordHash;
    } else {
      // Generate default password hash (admin123)
      dbLogger.warn('No QMS_PASSWORD_HASH found, generating default password (admin123)');
      passwordHash = await hashPassword('admin123');
    }

    await sql`
      INSERT INTO system_settings (key, value, description)
      VALUES (
        'password_hash',
        ${passwordHash},
        'Bcrypt hash of the admin password'
      )
      ON CONFLICT (key) DO UPDATE SET value = ${passwordHash}
    `;

    // Initialize app name
    await sql`
      INSERT INTO system_settings (key, value, description)
      VALUES (
        'app_name',
        'QMS - Quilt Management System',
        'Application display name'
      )
      ON CONFLICT (key) DO NOTHING
    `;

    // Verify settings
    const settings = await sql`
      SELECT key, description FROM system_settings
    `;

    dbLogger.info('System settings initialized successfully', {
      settingsCount: settings.length,
    });

    return NextResponse.json({
      success: true,
      message: 'System settings initialized successfully',
      settings: settings.map((s: any) => ({
        key: s.key,
        description: s.description,
      })),
      warning: !envPasswordHash
        ? 'Default password "admin123" was used. Please change it immediately in Settings page!'
        : undefined,
    });
  } catch (error) {
    dbLogger.error('Failed to initialize system settings', error as Error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy browser access
export async function GET() {
  return POST();
}
