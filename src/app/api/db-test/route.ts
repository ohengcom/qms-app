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
    
    // Try to count quilts and get sample data
    let quiltCount = 0;
    let sampleQuilts: any[] = [];
    try {
      quiltCount = await db.countQuilts();
      console.log('Quilt count:', quiltCount);
      
      // Get all quilts to see what's actually in the database
      sampleQuilts = await db.getQuilts({ limit: 50 });
      console.log('Sample quilts:', sampleQuilts?.length, 'records');
      console.log('First few quilts:', sampleQuilts?.slice(0, 3));
    } catch (error) {
      console.log('Quilt table error:', error);
    }
    
    return NextResponse.json({
      status: 'success',
      connection: 'Neon database connected successfully',
      driver: 'Neon Serverless Driver',
      tables: tables.map(t => t.table_name),
      quiltCount: quiltCount,
      sampleQuilts: sampleQuilts?.slice(0, 5), // First 5 quilts for inspection
      totalQuiltsFound: sampleQuilts?.length || 0,
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