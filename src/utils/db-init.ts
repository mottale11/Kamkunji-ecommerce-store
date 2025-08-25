import { supabase } from './supabase';

/**
 * Initialize the database with required tables if they don't exist
 * This is a utility function that can be run during application startup
 */
export async function initializeDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Check if categories table exists and has data
    const { count: categoryCount, error: categoryError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (categoryError) {
      console.error('Error checking categories table:', categoryError);
      return false;
    }
    
    // If no categories exist, insert default ones
    if (categoryCount === 0) {
      console.log('Inserting default categories...');
      const { error } = await supabase
        .from('categories')
        .insert([
          { name: 'Electronics', icon: '🖥️' },
          { name: 'Furniture', icon: '🪑' },
          { name: 'Clothing', icon: '👕' },
          { name: 'Books', icon: '📚' },
          { name: 'Kitchen', icon: '🍳' },
          { name: 'Sports', icon: '⚽' },
          { name: 'Toys', icon: '🧸' },
          { name: 'Beauty', icon: '💄' }
        ]);
      
      if (error) {
        console.error('Error inserting default categories:', error);
        return false;
      }
    }
    
    // Check if admin user exists
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .maybeSingle();
    
    if (adminError) {
      console.error('Error checking admin user:', adminError);
      return false;
    }
    
    // If no admin user exists, create a default one
    if (!adminUser) {
      console.log('Creating default admin user...');
      const { error } = await supabase
        .from('users')
        .insert({
          email: 'admin@example.com',
          full_name: 'Admin User',
          role: 'admin'
        });
      
      if (error) {
        console.error('Error creating default admin user:', error);
        return false;
      }
    }
    
    console.log('Database initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}