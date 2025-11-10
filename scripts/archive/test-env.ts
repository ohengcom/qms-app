import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envLocalPath = path.join(process.cwd(), '.env.local');

console.log('File exists:', fs.existsSync(envLocalPath));
console.log('File path:', envLocalPath);

const result = dotenv.config({ path: envLocalPath });

if (result.error) {
  console.error('Error:', result.error);
} else {
  console.log('Parsed:', result.parsed);
  console.log('DATABASE_URL from process.env:', process.env.DATABASE_URL ? 'EXISTS' : 'NOT FOUND');
}
