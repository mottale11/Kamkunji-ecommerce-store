import supabase from '@/utils/supabase';
import { Database } from '@/types/database.types';

type WishlistItem = Database['public']['Tables']['wishlist']['Row'] & {
  products: Database['public']['Tables']['products']['Row'] & {
    product_images?: Array<{ url: string }>;
    categories?: { name: string };
  };
};

/**
 * Get all products in a user's wishlist
 */
export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products:product_id (*,
          product_images:product_images(*),
          categories:category_id (name)
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data as WishlistItem[];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Add a product to a user's wishlist
 */
export const addToWishlist = async (productId: string, userId: string) => {
  try {
    // Check if item is already in wishlist
    const { data: existingItem } = await supabase
      .from('wishlist')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (existingItem) {
      return existingItem; // Already in wishlist
    }

    // Add to wishlist
    const { data, error } = await supabase
      .from('wishlist')
      .insert([
        { 
          product_id: productId, 
          user_id: userId 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove a product from a user's wishlist
 */
export const removeFromWishlist = async (wishlistItemId: string) => {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', wishlistItemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Check if a product is in a user's wishlist
 */
export const isInWishlist = async (productId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    throw error;
  }
};