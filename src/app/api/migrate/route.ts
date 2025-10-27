import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST() {
  try {
    console.log('Starting database schema check...');
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // First, let's check if we can connect
    await sql`SELECT 1`;
    console.log('Database connection successful');
    
    // Check current schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Current tables:', tables.map(t => t.table_name));
    
    // If no tables exist, we need to create the schema
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
    const quiltCountResult = await sql`SELECT COUNT(*) as count FROM quilts`;
    const quiltCount = Number(quiltCountResult[0]?.count || 0);
    console.log('Quilt count:', quiltCount);
    
    return NextResponse.json({
      status: 'success',
      message: 'Database schema is properly set up',
      tables: tables.map(t => t.table_name),
      quiltCount,
    });
    
  } catch (error) {
    console.error('Schema check error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}