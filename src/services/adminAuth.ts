import { supabase } from '../utils/supabase';
import { Database } from '../types/database.types';

export type AdminUser = Database['public']['Tables']['users']['Row'];

// Simple password hashing function (in production, use bcrypt)
function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use: return bcrypt.hashSync(password, 10);
  return btoa(password + 'kamkunji-salt');
}

function verifyPassword(password: string, hash: string): boolean {
  // This is a simple verification for demo purposes
  // In production, use: return bcrypt.compareSync(password, hash);
  return hash === btoa(password + 'kamkunji-salt');
}

export const adminAuthService = {
  // Authenticate admin user
  async authenticate(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      if (!verifyPassword(password, user.password_hash)) {
        return { success: false, error: 'Invalid credentials' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  },

  // Get admin user by email
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error getting admin user:', error);
      return null;
    }
  },

  // Create admin user (for initial setup)
  async createAdminUser(email: string, fullName: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const passwordHash = hashPassword(password);

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          full_name: fullName,
          password_hash: passwordHash,
          role: 'admin'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating admin user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error: 'Failed to create admin user' };
    }
  }
};
