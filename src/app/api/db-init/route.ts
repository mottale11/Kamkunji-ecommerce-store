import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/utils/db-init';

/**
 * API route to initialize the database
 * This can be called during application startup or manually when needed
 */
export async function GET() {
  try {
    const success = await initializeDatabase();
    
    if (success) {
      return NextResponse.json({ message: 'Database initialized successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Database initialization failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in DB initialization route:', error);
    return NextResponse.json({ message: 'Database initialization failed' }, { status: 500 });
  }
}