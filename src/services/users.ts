import { supabase } from '../utils/supabase';
import { Database } from '../types/database.types';

export type User = Database['public']['Tables']['users']['Row'];

/**
 * Get a user by their ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as User;
}

/**
 * Get a user by their email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data as User;
}

/**
 * Create a new user
 */
export async function createUser({
  email,
  full_name,
  password_hash,
  role = 'user',
}: {
  email: string;
  full_name: string;
  password_hash: string;
  role?: 'user' | 'admin';
}): Promise<User | null> {
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      full_name,
      password_hash,
      role,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data as User;
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  updates: {
    email?: string;
    full_name?: string;
    password_hash?: string;
    role?: 'user' | 'admin';
  }
): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return data as User;
}

/**
 * Get all users with optional filtering
 */
export async function getUsers({
  role,
  limit = 50,
  offset = 0,
}: {
  role?: 'user' | 'admin';
  limit?: number;
  offset?: number;
} = {}): Promise<User[]> {
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data as User[];
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase.from('users').delete().eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
}

/**
 * Authenticate a user with email
 * In a real application, this would involve password verification
 * For this demo, we're just checking if the user exists
 */
export async function authenticateUser(email: string): Promise<User | null> {
  return await getUserByEmail(email);
}