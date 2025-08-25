import { supabase } from '../utils/supabase';
import { Database } from '../types/database.types';
import { ProductWithImages, getProductById } from './products';

// First, let's create the wishlist table in Supabase if it doesn't exist
export async function createWishlistTable() {
  // This function would typically be run during initial setup
  // For this implementation, we'll assume the table already exists or will be created via schema.sql
  // In a real application, you might want to check if the table exists and create it if not
}

/**
 * Add a product to a user's wishlist
 */
export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    // Check if the product is already in the wishlist
    const { data: existing } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Already in wishlist
      return true;
    }

    // Add to wishlist
    const { error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        product_id: productId,
      });

    if (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
}

/**
 * Remove a product from a user's wishlist
 */
export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
}

/**
 * Check if a product is in a user's wishlist
 */
export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
      console.error('Error checking wishlist:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

/**
 * Get all products in a user's wishlist
 */
export async function getWishlist(userId: string): Promise<ProductWithImages[]> {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }

    // Fetch the actual products
    const productIds = data.map(item => item.product_id);
    if (productIds.length === 0) {
      return [];
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*, product_images(url)')
      .in('id', productIds)
      .eq('status', 'approved');

    if (productsError) {
      console.error('Error fetching wishlist products:', productsError);
      return [];
    }

    // Transform the data to match the ProductWithImages type
    return products.map((product: any) => ({
      ...product,
      images: product.product_images || [],
    })) as ProductWithImages[];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

/**
 * Get the count of products in a user's wishlist
 */
export async function getWishlistCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return 0;
  }
}