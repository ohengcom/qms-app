/**
 * Notification System Test Script
 * 
 * This script helps you test the notification system by:
 * 1. Creating test notifications
 * 2. Triggering notification checks
 * 3. Verifying the system works correctly
 * 
 * Usage: npx tsx scripts/test-notifications.ts
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
  console.log('✓ Loaded environment from .env.local');
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Loaded environment from .env');
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  console.log('\nPlease set DATABASE_URL in your .env.local file');
  console.log('You can find it in your Vercel project settings or Neon dashboard');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function createTestNotifications() {
  console.log('\n📝 Creating test notifications...\n');

  try {
    // Test notification 1: High priority maintenance reminder
    const notif1 = await sql`
      INSERT INTO notifications (
        type, priority, title, message, action_url, metadata
      ) VALUES (
        'maintenance_reminder',
        'high',
        '维护提醒：测试被子A',
        '被子"测试被子A"已连续使用 35 天，建议进行清洗或晾晒维护。',
        '/quilts',
        '{"daysInUse": 35, "test": true}'
      )
      RETURNING id, type, priority, title
    `;
    console.log('✓ Created high priority maintenance reminder:', notif1[0]);

    // Test notification 2: Medium priority maintenance reminder
    const notif2 = await sql`
      INSERT INTO notifications (
        type, priority, title, message, action_url, metadata
      ) VALUES (
        'maintenance_reminder',
        'medium',
        '维护提醒：测试被子B',
        '被子"测试被子B"已连续使用 32 天，建议进行清洗或晾晒维护。',
        '/quilts',
        '{"daysInUse": 32, "test": true}'
      )
      RETURNING id, type, priority, title
    `;
    console.log('✓ Created medium priority maintenance reminder:', notif2[0]);

    // Test notification 3: Low priority disposal suggestion
    const notif3 = await sql`
      INSERT INTO notifications (
        type, priority, title, message, action_url, metadata
      ) VALUES (
        'disposal_suggestion',
        'low',
        '淘汰建议：测试被子C',
        '被子"测试被子C"已经 400 天未使用，建议考虑是否需要保留。',
        '/quilts',
        '{"daysSinceLastUse": 400, "test": true}'
      )
      RETURNING id, type, priority, title
    `;
    console.log('✓ Created low priority disposal suggestion:', notif3[0]);

    // Test notification 4: Weather change (for future use)
    const notif4 = await sql`
      INSERT INTO notifications (
        type, priority, title, message, action_url, metadata
      ) VALUES (
        'weather_change',
        'high',
        '天气变化提醒：温度降低8.5°C',
        '温度从 25.0°C 降低到 16.5°C，建议检查当前使用的被子是否合适。',
        '/quilts',
        '{"previousTemp": 25.0, "currentTemp": 16.5, "tempChange": 8.5, "test": true}'
      )
      RETURNING id, type, priority, title
    `;
    console.log('✓ Created weather change notification:', notif4[0]);

    console.log('\n✅ Successfully created 4 test notifications!\n');
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
    throw error;
  }
}

async function viewNotifications() {
  console.log('\n📋 Current notifications:\n');

  try {
    const notifications = await sql`
      SELECT 
        id,
        type,
        priority,
        title,
        is_read,
        created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (notifications.length === 0) {
      console.log('No notifications found.');
    } else {
      console.table(notifications.map(n => ({
        Type: n.type,
        Priority: n.priority,
        Title: n.title,
        Read: n.is_read ? '✓' : '✗',
        Created: new Date(n.created_at).toLocaleString(),
      })));
    }

    // Show unread count
    const unreadCount = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE is_read = false
    `;
    console.log(`\n📊 Unread notifications: ${unreadCount[0].count}`);
  } catch (error) {
    console.error('❌ Error viewing notifications:', error);
    throw error;
  }
}

async function clearTestNotifications() {
  console.log('\n🗑️  Clearing test notifications...\n');

  try {
    const result = await sql`
      DELETE FROM notifications
      WHERE metadata->>'test' = 'true'
      RETURNING id
    `;

    console.log(`✓ Deleted ${result.length} test notifications`);
  } catch (error) {
    console.error('❌ Error clearing test notifications:', error);
    throw error;
  }
}

async function checkNotificationTable() {
  console.log('\n🔍 Checking notification table...\n');

  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      )
    `;

    if (!tableExists[0].exists) {
      console.error('❌ Notifications table does not exist!');
      console.log('\nPlease run the migration first:');
      console.log('1. Go to Neon Console: https://console.neon.tech/');
      console.log('2. Open SQL Editor');
      console.log('3. Run the SQL from: migrations/007_create_notifications.sql');
      process.exit(1);
    }

    console.log('✓ Notifications table exists');

    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position
    `;

    console.log('\n📊 Table structure:');
    console.table(columns.map(c => ({
      Column: c.column_name,
      Type: c.data_type,
    })));

    // Check indexes
    const indexes = await sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'notifications'
    `;

    console.log('\n🔑 Indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
  } catch (error) {
    console.error('❌ Error checking notification table:', error);
    throw error;
  }
}

// Main menu
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Notification System Test Script      ║');
  console.log('╚════════════════════════════════════════╝');

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'check':
        await checkNotificationTable();
        break;
      case 'create':
        await createTestNotifications();
        await viewNotifications();
        break;
      case 'view':
        await viewNotifications();
        break;
      case 'clear':
        await clearTestNotifications();
        await viewNotifications();
        break;
      default:
        console.log('\nUsage: npx tsx scripts/test-notifications.ts <command>\n');
        console.log('Commands:');
        console.log('  check  - Check if notification table exists and view structure');
        console.log('  create - Create test notifications');
        console.log('  view   - View current notifications');
        console.log('  clear  - Clear test notifications');
        console.log('\nExample:');
        console.log('  npx tsx scripts/test-notifications.ts create');
        process.exit(0);
    }

    console.log('\n✅ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

main();
