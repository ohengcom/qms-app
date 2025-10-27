import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function GET() {
  try {
    // Test basic database connection
    console.log('Testing Neon database connection...');
    
    // Try a simple connection test
    const connectionTest = await db.testConnection();
    console.log('Database connection successful:', connectionTest);
    
    // Check if tables exist
    const tables = await db.getTables();
    console.log('Available tables:', tables);
    
    // Try to count quilts
    let quiltCount = 0;
    try {
      quiltCount = await db.countQuilts();
      console.log('Quilt count:', quiltCount);
    } catch (error) {
      console.log('Quilt table error:', error);
    }
    
    return NextResponse.json({
      status: 'success',
      connection: 'Neon database connected successfully',
      driver: 'Neon Serverless Driver',
      tables: tables.map(t => t.table_name),
      quiltCount: quiltCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}