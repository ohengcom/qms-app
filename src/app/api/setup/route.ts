import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST() {
  try {
    // Check if database is already set up
    const quiltCount = await db.quilt.count();
    
    if (quiltCount > 0) {
      return NextResponse.json({ 
        message: 'Database already initialized', 
        quilts: quiltCount 
      });
    }

    // Run the seed data creation
    const { PrismaClient, Season, QuiltStatus, UsageType } = await import('@prisma/client');
    
    // Create seasonal recommendations
    const seasonalRecommendations = await Promise.all([
      db.seasonalRecommendation.create({
        data: {
          season: Season.WINTER,
          minWeight: 1500,
          maxWeight: 3000,
          materials: JSON.stringify(['down', 'wool', 'thick cotton']),
          description: 'Heavy quilts for cold winter nights',
          priority: 1,
        },
      }),
      db.seasonalRecommendation.create({
        data: {
          season: Season.SPRING_AUTUMN,
          minWeight: 800,
          maxWeight: 1800,
          materials: JSON.stringify(['cotton', 'bamboo', 'light down']),
          description: 'Medium weight quilts for transitional seasons',
          priority: 2,
        },
      }),
      db.seasonalRecommendation.create({
        data: {
          season: Season.SUMMER,
          minWeight: 300,
          maxWeight: 1000,
          materials: JSON.stringify(['cotton', 'linen', 'bamboo']),
          description: 'Light quilts for warm summer nights',
          priority: 3,
        },
      }),
    ]);

    // Create system settings
    const systemSettings = await Promise.all([
      db.systemSetting.create({
        data: {
          key: 'default_location',
          value: 'Master Bedroom',
          description: 'Default storage location for new quilts',
          category: 'storage',
        },
      }),
      db.systemSetting.create({
        data: {
          key: 'maintenance_reminder_days',
          value: '90',
          description: 'Days between maintenance reminders',
          category: 'maintenance',
        },
      }),
    ]);

    // Create sample quilts
    const quilts = await Promise.all([
      // Winter Quilts
      db.quilt.create({
        data: {
          itemNumber: 1,
          groupId: 1,
          name: 'Premium Down Winter Quilt',
          season: Season.WINTER,
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
          currentStatus: QuiltStatus.AVAILABLE,
          notes: 'Excellent for very cold nights',
        },
      }),
      db.quilt.create({
        data: {
          itemNumber: 2,
          groupId: 1,
          name: 'Wool Blend Winter Quilt',
          season: Season.WINTER,
          lengthCm: 210,
          widthCm: 180,
          weightGrams: 2200,
          fillMaterial: 'Wool Blend',
          materialDetails: '70% Wool, 30% Polyester',
          color: 'Cream',
          brand: 'Cozy Nights',
          purchaseDate: new Date('2022-11-20'),
          location: 'Guest Room Closet',
          packagingInfo: 'Cotton storage bag',
          currentStatus: QuiltStatus.STORAGE,
          notes: 'Great for guests during winter',
        },
      }),

      // Spring/Autumn Quilts
      db.quilt.create({
        data: {
          itemNumber: 3,
          groupId: 2,
          name: 'Cotton Comfort Quilt',
          season: Season.SPRING_AUTUMN,
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
          currentStatus: QuiltStatus.IN_USE,
          notes: 'Perfect for mild weather',
        },
      }),
      db.quilt.create({
        data: {
          itemNumber: 4,
          groupId: 2,
          name: 'Bamboo Fiber Quilt',
          season: Season.SPRING_AUTUMN,
          lengthCm: 220,
          widthCm: 200,
          weightGrams: 1400,
          fillMaterial: 'Bamboo Fiber',
          materialDetails: '100% Bamboo Fiber',
          color: 'Natural',
          brand: 'Green Sleep',
          purchaseDate: new Date('2023-04-05'),
          location: 'Linen Closet',
          packagingInfo: 'Eco-friendly packaging',
          currentStatus: QuiltStatus.AVAILABLE,
          notes: 'Hypoallergenic and moisture-wicking',
        },
      }),

      // Summer Quilts
      db.quilt.create({
        data: {
          itemNumber: 5,
          groupId: 3,
          name: 'Light Summer Quilt',
          season: Season.SUMMER,
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
          currentStatus: QuiltStatus.AVAILABLE,
          notes: 'Ultra-light for hot summer nights',
        },
      }),
      db.quilt.create({
        data: {
          itemNumber: 6,
          groupId: 3,
          name: 'Linen Blend Summer Quilt',
          season: Season.SUMMER,
          lengthCm: 210,
          widthCm: 190,
          weightGrams: 800,
          fillMaterial: 'Linen Blend',
          materialDetails: '60% Linen, 40% Cotton',
          color: 'Light Gray',
          brand: 'Natural Comfort',
          purchaseDate: new Date('2023-06-01'),
          location: 'Guest Room',
          packagingInfo: 'Linen storage bag',
          currentStatus: QuiltStatus.AVAILABLE,
          notes: 'Breathable and cooling',
        },
      }),
    ]);

    // Create current usage for one quilt
    const currentUsage = await db.currentUsage.create({
      data: {
        quiltId: quilts[2].id, // Cotton Comfort Quilt
        startedAt: new Date('2024-10-01'),
        expectedEndDate: new Date('2024-11-15'),
        usageType: UsageType.REGULAR,
        notes: 'Currently using for autumn season',
      },
    });

    // Create some usage history
    const usagePeriods = await Promise.all([
      db.usagePeriod.create({
        data: {
          quiltId: quilts[0].id, // Premium Down Winter Quilt
          startDate: new Date('2023-12-01'),
          endDate: new Date('2024-02-28'),
          seasonUsed: 'winter',
          usageType: UsageType.REGULAR,
          durationDays: 89,
          notes: 'Used throughout winter 2023-2024',
        },
      }),
      db.usagePeriod.create({
        data: {
          quiltId: quilts[4].id, // Light Summer Quilt
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          seasonUsed: 'summer',
          usageType: UsageType.REGULAR,
          durationDays: 92,
          notes: 'Perfect for summer 2024',
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Database initialized successfully!',
      data: {
        quilts: quilts.length,
        seasonalRecommendations: seasonalRecommendations.length,
        systemSettings: systemSettings.length,
        usagePeriods: usagePeriods.length,
        currentUsage: 1,
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
    // Check database status
    const quiltCount = await db.quilt.count();
    const userCount = await db.user.count();
    
    return NextResponse.json({
      status: 'Database connected',
      quilts: quiltCount,
      users: userCount,
      initialized: quiltCount > 0,
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