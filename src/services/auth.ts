import { supabase } from '../utils/supabase';
import { getUserByEmail, createUser } from './users';
import { User } from './users';

/**
 * Sign in with email
 * In a real application, this would involve password verification
 * For this demo, we're just checking if the user exists
 */
export async function signIn(email: string): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return { user: null, error: 'User not found' };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { user: null, error: 'Failed to sign in' };
  }
}

/**
 * Sign up a new user
 */
export async function signUp({
  email,
  full_name,
  phone,
}: {
  email: string;
  full_name: string;
  phone?: string;
}): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { user: null, error: 'User already exists' };
    }
    
    // Create new user
    const user = await createUser({
      email,
      full_name,
      phone,
    });
    
    if (!user) {
      return { user: null, error: 'Failed to create user' };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { user: null, error: 'Failed to sign up' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: 'Failed to sign out' };
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    return { session: null, error: 'Failed to get session' };
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return false;
    }
    
    const user = await getUserByEmail(data.session.user.email || '');
    
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}