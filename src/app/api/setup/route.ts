import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function POST() {
  try {
    // Check if database is already set up
    const quiltCount = await db.countQuilts();
    
    if (quiltCount > 0) {
      return NextResponse.json({ 
        message: 'Database already initialized', 
        quilts: quiltCount 
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
        details: error instanceof Error ? error.message : 'Unknown error' 
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
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}