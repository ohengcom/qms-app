#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

/**
 * Validate password strength
 */
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Main setup function
 */
async function setupPassword() {
  console.log('\n🔐 QMS Password Setup\n');

  const password = process.argv[2];

  if (!password) {
    console.error('❌ Error: Password not provided\n');
    console.log('Usage: npm run setup-password <your-password>\n');
    console.log('Example: npm run setup-password MySecurePass123\n');
    process.exit(1);
  }

  // Validate password strength
  const validation = validatePassword(password);

  if (!validation.valid) {
    console.error('❌ Password does not meet requirements:\n');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    console.log('\nPassword Requirements:');
    console.log('  - At least 8 characters');
    console.log('  - At least one uppercase letter');
    console.log('  - At least one lowercase letter');
    console.log('  - At least one number\n');
    process.exit(1);
  }

  console.log('✅ Password meets requirements');
  console.log('⏳ Generating secure hash...\n');

  // Generate password hash
  const hash = await bcrypt.hash(password, 12);

  // Generate JWT secret
  const jwtSecret = randomBytes(32).toString('hex');

  console.log('✅ Setup complete!\n');
  console.log('━'.repeat(70));
  console.log('\n📝 Add these to your .env.local file:\n');
  console.log(`QMS_PASSWORD_HASH="${hash}"`);
  console.log(`QMS_JWT_SECRET="${jwtSecret}"`);
  console.log('\n━'.repeat(70));
  console.log('\n⚠️  IMPORTANT:');
  console.log('   - Keep these values secret!');
  console.log('   - Do NOT commit .env.local to version control');
  console.log('   - Store the password securely');
  console.log('   - For production, add these to Vercel environment variables\n');
}

// Run the setup
setupPassword().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
