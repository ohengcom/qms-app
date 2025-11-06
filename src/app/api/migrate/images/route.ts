/**
 * API Route: Run image fields migration
 * POST /api/migrate/images
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function POST() {
  try {
    console.log('Starting migration 006: Add quilt images...');

    // Add main_image field
    await sql`
      ALTER TABLE quilts
      ADD COLUMN IF NOT EXISTS main_image TEXT
    `;
    console.log('✓ Added main_image column');

    // Add attachment_images field
    await sql`
      ALTER TABLE quilts
      ADD COLUMN IF NOT EXISTS attachment_images TEXT[] DEFAULT '{}'
    `;
    console.log('✓ Added attachment_images column');

    // Add comments
    await sql`
      COMMENT ON COLUMN quilts.main_image IS 'Main image of the quilt stored as Base64 encoded string'
    `;
    
    await sql`
      COMMENT ON COLUMN quilts.attachment_images IS 'Array of additional images stored as Base64 encoded strings'
    `;
    console.log('✓ Added column comments');

    console.log('✅ Migration 006 completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      fields: ['main_image', 'attachment_images'],
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
