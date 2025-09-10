import { supabase } from './supabase';
import { Database } from '../types/database.types';

/**
 * Initialize the database with required tables and data
 * This should be run during application setup
 */
export async function initializeDatabase() {
  try {
    // Check if tables exist, create them if they don't
    await createTablesIfNotExist();
    
    // Insert initial data if needed
    await insertInitialData();
    
    console.log('Database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
}

async function createTablesIfNotExist() {
  // Check and create categories table
  await supabase.rpc('create_categories_table_if_not_exists');
  
  // Check and create products table
  await supabase.rpc('create_products_table_if_not_exists');
  
  // Check and create product_images table
  await supabase.rpc('create_product_images_table_if_not_exists');
  
  // Check and create orders table
  await supabase.rpc('create_orders_table_if_not_exists');
  
  // Check and create order_items table
  await supabase.rpc('create_order_items_table_if_not_exists');
  
  // Check and create cart table
  await supabase.rpc('create_cart_table_if_not_exists');
  
  // Check and create wishlist table
  await supabase.rpc('create_wishlist_table_if_not_exists');
  
  // Create necessary indexes
  await createIndexes();
}

async function createIndexes() {
  // Create indexes for better query performance
  const { error: productCategoryIndexError } = await supabase.rpc('create_index_if_not_exists', {
    table_name: 'products',
    index_name: 'idx_products_category',
    columns: 'category_id',
  });
  
  const { error: productStatusIndexError } = await supabase.rpc('create_index_if_not_exists', {
    table_name: 'products',
    index_name: 'idx_products_status',
    columns: 'status',
  });
  
  const { error: orderUserIndexError } = await supabase.rpc('create_index_if_not_exists', {
    table_name: 'orders',
    index_name: 'idx_orders_user',
    columns: 'user_id',
  });
  
  const { error: orderStatusIndexError } = await supabase.rpc('create_index_if_not_exists', {
    table_name: 'orders',
    index_name: 'idx_orders_status',
    columns: 'status',
  });
  
  if (productCategoryIndexError || productStatusIndexError || orderUserIndexError || orderStatusIndexError) {
    console.error('Error creating indexes:', {
      productCategoryIndexError,
      productStatusIndexError,
      orderUserIndexError,
      orderStatusIndexError,
    });
    throw new Error('Failed to create database indexes');
  }
}

async function insertInitialData() {
  // Check if we already have categories
  const { data: existingCategories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .limit(1);

  if (categoriesError) {
    console.error('Error checking for existing categories:', categoriesError);
    throw categoriesError;
  }

  // Only insert initial categories if none exist
  if (!existingCategories || existingCategories.length === 0) {
    const defaultCategories = [
      { name: 'Electronics' },
      { name: 'Clothing' },
      { name: 'Home & Garden' },
      { name: 'Books' },
      { name: 'Toys & Games' },
      { name: 'Sports & Outdoors' },
      { name: 'Beauty & Personal Care' },
      { name: 'Automotive' },
      { name: 'Other' },
    ];

    const { error: insertError } = await supabase
      .from('categories')
      .insert(defaultCategories);

    if (insertError) {
      console.error('Error inserting default categories:', insertError);
      throw insertError;
    }
  }
}

// Create a function to check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public')
    .eq('tablename', tableName);

  if (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }

  return data && data.length > 0;
}

// Create a function to run SQL migrations
async function runMigrations() {
  try {
    // Example migration - add new columns or modify existing ones
    const { error: migrationError } = await supabase.rpc('run_migrations');
    
    if (migrationError) {
      console.error('Error running migrations:', migrationError);
      throw migrationError;
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running database migrations:', error);
    throw error;
  }
}

// Export utility functions
export const dbUtils = {
  tableExists,
  runMigrations,
  initializeDatabase,
};

// Run initialization if this module is run directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}