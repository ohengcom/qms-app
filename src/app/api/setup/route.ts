import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function POST() {
  try {
    // First, create the database schema if it doesn't exist
    const { sql } = await import('@/lib/neon');

    // Create quilts table
    await sql`
      CREATE TABLE IF NOT EXISTS quilts (
        id TEXT PRIMARY KEY,
        item_number INTEGER,
        group_id INTEGER,
        name TEXT NOT NULL,
        season TEXT CHECK (season IN ('WINTER', 'SPRING_AUTUMN', 'SUMMER')),
        length_cm INTEGER,
        width_cm INTEGER,
        weight_grams INTEGER,
        fill_material TEXT,
        material_details TEXT,
        color TEXT,
        brand TEXT,
        purchase_date TIMESTAMP,
        location TEXT,
        packaging_info TEXT,
        current_status TEXT CHECK (current_status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'STORAGE')) DEFAULT 'AVAILABLE',
        notes TEXT,
        image_url TEXT,
        thumbnail_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create unified usage_records table
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

    // Create indexes for usage_records
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

    // Create unique constraint: one active record per quilt
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_per_quilt
      ON usage_records(quilt_id)
      WHERE end_date IS NULL
    `;

    // Check if database is already set up
    const quiltCount = await db.countQuilts();

    if (quiltCount > 0) {
      return NextResponse.json({
        message: 'Database schema created, already has data',
        quilts: quiltCount,
      });
    }

    // Create sample quilts using Neon
    const quilts = await Promise.all([
      db.createQuilt({
        itemNumber: 1,
        groupId: 1,
        name: 'Premium Down Winter Quilt',
        season: 'WINTER',
        lengthCm: 220,
        widthCm: 200,
        weightGrams: 2500,
        fillMaterial: 'Goose Down',
        materialDetails: '90% Goose Down, 10% Feathers',
        color: 'White',
        brand: 'Nordic Dreams',
        purchaseDate: new Date('2023-10-15'),
        location: 'Master Bedroom Closet',
        packagingInfo: 'Vacuum sealed bag',
        currentStatus: 'AVAILABLE',
        notes: 'Excellent for very cold nights',
      }),
      db.createQuilt({
        itemNumber: 2,
        groupId: 2,
        name: 'Cotton Comfort Quilt',
        season: 'SPRING_AUTUMN',
        lengthCm: 200,
        widthCm: 180,
        weightGrams: 1200,
        fillMaterial: 'Cotton',
        materialDetails: '100% Organic Cotton',
        color: 'Light Blue',
        brand: 'EcoSleep',
        purchaseDate: new Date('2023-03-10'),
        location: 'Master Bedroom',
        packagingInfo: 'Breathable cotton bag',
        currentStatus: 'AVAILABLE',
        notes: 'Perfect for mild weather',
      }),
      db.createQuilt({
        itemNumber: 3,
        groupId: 3,
        name: 'Light Summer Quilt',
        season: 'SUMMER',
        lengthCm: 200,
        widthCm: 180,
        weightGrams: 600,
        fillMaterial: 'Cotton',
        materialDetails: '100% Lightweight Cotton',
        color: 'Pastel Pink',
        brand: 'Summer Breeze',
        purchaseDate: new Date('2023-05-15'),
        location: 'Master Bedroom',
        packagingInfo: 'Mesh laundry bag',
        currentStatus: 'AVAILABLE',
        notes: 'Ultra-light for hot summer nights',
      }),
    ]);

    return NextResponse.json({
      message: 'Database initialized successfully with Neon!',
      data: {
        quilts: quilts.length,
        driver: 'Neon Serverless Driver',
      },
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check database status using Neon methods
    const quiltCount = await db.countQuilts();

    return NextResponse.json({
      status: 'Database connected',
      quilts: quiltCount,
      initialized: quiltCount > 0,
      driver: 'Neon Serverless Driver',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
