import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    // Test basic database connection
    console.log('Testing database connection...');
    
    // Try a simple query
    const result = await db.$queryRaw`SELECT 1 as test`;
    console.log('Database connection successful:', result);
    
    // Check if tables exist
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Available tables:', tables);
    
    // Try to count quilts
    let quiltCount = 0;
    try {
      quiltCount = await db.quilt.count();
      console.log('Quilt count:', quiltCount);
    } catch (error) {
      console.log('Quilt table error:', error);
    }
    
    return NextResponse.json({
      status: 'success',
      connection: 'Database connected successfully',
      tables: tables,
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