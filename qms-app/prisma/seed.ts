import { PrismaClient, Season, QuiltStatus, UsageType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.usageAnalytics.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.currentUsage.deleteMany();
  await prisma.usagePeriod.deleteMany();
  await prisma.quilt.deleteMany();
  await prisma.seasonalRecommendation.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  // Create seasonal recommendations
  const seasonalRecommendations = await Promise.all([
    prisma.seasonalRecommendation.create({
      data: {
        season: Season.WINTER,
        minWeight: 1500,
        maxWeight: 3000,
        materials: JSON.stringify(['down', 'wool', 'thick cotton']),
        description: 'Heavy quilts for cold winter nights',
        priority: 1,
      },
    }),
    prisma.seasonalRecommendation.create({
      data: {
        season: Season.SPRING_AUTUMN,
        minWeight: 800,
        maxWeight: 1800,
        materials: JSON.stringify(['cotton', 'bamboo', 'light down']),
        description: 'Medium weight quilts for transitional seasons',
        priority: 2,
      },
    }),
    prisma.seasonalRecommendation.create({
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

  console.log(`✅ Created ${seasonalRecommendations.length} seasonal recommendations`);

  // Create system settings
  const systemSettings = await Promise.all([
    prisma.systemSetting.create({
      data: {
        key: 'default_location',
        value: 'Master Bedroom',
        description: 'Default storage location for new quilts',
        category: 'storage',
      },
    }),
    prisma.systemSetting.create({
      data: {
        key: 'maintenance_reminder_days',
        value: '90',
        description: 'Days between maintenance reminders',
        category: 'maintenance',
      },
    }),
    prisma.systemSetting.create({
      data: {
        key: 'seasonal_rotation_enabled',
        value: 'true',
        description: 'Enable automatic seasonal recommendations',
        category: 'features',
      },
    }),
  ]);

  console.log(`✅ Created ${systemSettings.length} system settings`);

  // Create sample quilts
  const quilts = await Promise.all([
    // Winter Quilts
    prisma.quilt.create({
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
    prisma.quilt.create({
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
    prisma.quilt.create({
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
    prisma.quilt.create({
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
    prisma.quilt.create({
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
    prisma.quilt.create({
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

  console.log(`✅ Created ${quilts.length} sample quilts`);

  // Create current usage for one quilt
  const currentUsage = await prisma.currentUsage.create({
    data: {
      quiltId: quilts[2].id, // Cotton Comfort Quilt
      startedAt: new Date('2024-10-01'),
      expectedEndDate: new Date('2024-11-15'),
      usageType: UsageType.REGULAR,
      notes: 'Currently using for autumn season',
    },
  });

  console.log(`✅ Created current usage record`);

  // Create some usage history
  const usagePeriods = await Promise.all([
    prisma.usagePeriod.create({
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
    prisma.usagePeriod.create({
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

  console.log(`✅ Created ${usagePeriods.length} usage period records`);

  // Create maintenance records
  const maintenanceRecords = await Promise.all([
    prisma.maintenanceRecord.create({
      data: {
        quiltId: quilts[0].id,
        type: 'wash',
        description: 'Professional dry cleaning',
        performedAt: new Date('2024-03-15'),
        cost: 25.00,
        nextDueDate: new Date('2024-09-15'),
      },
    }),
    prisma.maintenanceRecord.create({
      data: {
        quiltId: quilts[2].id,
        type: 'inspection',
        description: 'General condition check',
        performedAt: new Date('2024-09-01'),
        nextDueDate: new Date('2024-12-01'),
      },
    }),
  ]);

  console.log(`✅ Created ${maintenanceRecords.length} maintenance records`);

  // Create a default user
  const user = await prisma.user.create({
    data: {
      email: 'admin@qms.local',
      name: 'QMS Administrator',
      preferences: {
        defaultView: 'grid',
        notificationsEnabled: true,
        seasonalReminders: true,
      },
    },
  });

  console.log(`✅ Created default user: ${user.email}`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });