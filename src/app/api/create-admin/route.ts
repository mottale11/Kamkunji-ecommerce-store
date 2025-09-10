import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Create user with admin role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Create profile with admin privileges
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        is_admin: true
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to create admin profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        is_admin: true
      }
    });

  } catch (error) {
    console.error('Error in create-admin route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
