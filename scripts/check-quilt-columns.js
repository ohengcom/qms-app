// Simple script to check quilt data without TypeScript
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
  try {
    console.log('Fetching first quilt...\n');

    const quilts = await sql`SELECT * FROM quilts LIMIT 1`;

    if (quilts.length === 0) {
      console.log('No quilts found');
      return;
    }

    const quilt = quilts[0];
    console.log('All columns and values:');
    for (const [key, value] of Object.entries(quilt)) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkColumns();
