import { NextRequest, NextResponse } from 'next/server';
import { adminAuthService } from '@/services/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, password } = await request.json();

    // Validate input
    if (!email || !fullName || !password) {
      return NextResponse.json(
        { error: 'Email, full name, and password are required' },
        { status: 400 }
      );
    }

    // Create admin user
    const result = await adminAuthService.createAdminUser(email, fullName, password);

    if (result.success) {
      return NextResponse.json({
        message: 'Admin user created successfully',
        user: {
          id: result.user?.id,
          email: result.user?.email,
          full_name: result.user?.full_name,
          role: result.user?.role
        }
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create admin user' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin setup endpoint',
    usage: 'POST with { email, fullName, password } to create admin user'
  });
}
