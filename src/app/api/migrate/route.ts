import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST() {
  try {
    console.log('Starting database migration...');
    
    // First, let's check if we can connect
    await db.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    
    // Check current schema
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ` as any[];
    
    console.log('Current tables:', tables.map(t => t.table_name));
    
    // If no tables exist, we need to push the schema
    if (tables.length === 0) {
      console.log('No tables found, schema needs to be created');
      return NextResponse.json({
        status: 'error',
        message: 'Database schema not found. Please run database setup or check Neon console.',
        tables: [],
      }, { status: 500 });
    }
    
    // Check if quilt table exists and has the right structure
    const quiltTableExists = tables.some(t => t.table_name === 'quilts');
    
    if (!quiltTableExists) {
      return NextResponse.json({
        status: 'error',
        message: 'Quilt table not found. Database schema incomplete.',
        tables: tables.map(t => t.table_name),
      }, { status: 500 });
    }
    
    // Test quilt table access
    const quiltCount = await db.quilt.count();
    console.log('Quilt count:', quiltCount);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database schema is properly set up',
      tables: tables.map(t => t.table_name),
      quiltCount,
    });
    
  } catch (error) {
    console.error('Migration check error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}