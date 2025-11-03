/**
 * Seed Test Data Script
 * Adds sample quilts to the database for testing
 */

import { db } from '../src/lib/neon';

const testQuilts = [
  {
    itemNumber: 1001,
    name: 'Winter Comfort Quilt',
    season: 'WINTER' as const,
    lengthCm: 220,
    widthCm: 200,
    weightGrams: 2500,
    fillMaterial: 'Down',
    color: 'White',
    location: 'Master Bedroom',
    currentStatus: 'STORAGE' as const,
    brand: 'Premium Bedding',
  },
  {
    itemNumber: 1002,
    name: 'Summer Breeze Quilt',
    season: 'SUMMER' as const,
    lengthCm: 200,
    widthCm: 180,
    weightGrams: 800,
    fillMaterial: 'Cotton',
    color: 'Blue',
    location: 'Guest Room',
    currentStatus: 'STORAGE' as const,
    brand: 'Cool Sleep',
  },
  {
    itemNumber: 1003,
    name: 'Spring/Autumn All-Season',
    season: 'SPRING_AUTUMN' as const,
    lengthCm: 210,
    widthCm: 190,
    weightGrams: 1500,
    fillMaterial: 'Polyester',
    color: 'Beige',
    location: 'Master Bedroom',
    currentStatus: 'IN_USE' as const,
    brand: 'Comfort Plus',
  },
];

async function seedData() {
  console.log('🌱 Starting database seeding...');

  try {
    // Test connection first
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connected');

    // Check current quilt count
    const currentCount = await db.countQuilts();
    console.log(`📊 Current quilts in database: ${currentCount}`);

    if (currentCount > 0) {
      console.log('⚠️  Database already has quilts. Skipping seed.');
      console.log('   To re-seed, delete existing quilts first.');
      return;
    }

    // Add test quilts
    console.log(`📝 Adding ${testQuilts.length} test quilts...`);
    
    for (const quilt of testQuilts) {
      const result = await db.createQuilt(quilt);
      console.log(`   ✓ Added: ${quilt.name} (ID: ${result.id})`);
    }

    // Verify
    const newCount = await db.countQuilts();
    console.log(`\n✅ Seeding complete! Total quilts: ${newCount}`);

    // Show sample
    const quilts = await db.getQuilts({ limit: 5 });
    console.log('\n📋 Sample quilts:');
    quilts.forEach((q: any) => {
      console.log(`   - #${q.itemNumber}: ${q.name} (${q.season})`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed function
seedData()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error:', error);
    process.exit(1);
  });
