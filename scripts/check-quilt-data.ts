import { sql } from '../src/lib/neon';

async function checkQuiltData() {
  try {
    console.log('Checking quilt data...\n');

    // Get first quilt with all fields
    const quilts = await sql`SELECT * FROM quilts LIMIT 1`;

    if (quilts.length === 0) {
      console.log('No quilts found in database');
      return;
    }

    const quilt = quilts[0];
    console.log('First quilt data:');
    console.log(JSON.stringify(quilt, null, 2));

    console.log('\nColumn names:');
    console.log(Object.keys(quilt));

    console.log('\nDimension fields:');
    console.log('length_cm:', quilt.length_cm);
    console.log('width_cm:', quilt.width_cm);
    console.log('weight_grams:', quilt.weight_grams);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkQuiltData();
