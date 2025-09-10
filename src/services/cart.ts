import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  products: Database['public']['Tables']['products']['Row'] & {
    product_images?: Array<{ url: string }>;
    categories?: { name: string };
  };
};

export class CartService {
  static async getCart(supabase: SupabaseClient<Database>, userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products:product_id (*,
            product_images:product_images(*),
            categories:category_id (name)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data as CartItem[];
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  static async addToCart(supabase: SupabaseClient<Database>, productId: string, userId: string, quantity: number = 1): Promise<CartItem> {
    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

      if (existingItem) {
        // Update quantity if item exists
        const { data, error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Add new item to cart
      const { data, error } = await supabase
        .from('cart')
        .insert([
          { 
            product_id: productId, 
            quantity,
            user_id: userId 
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  static async updateCartItem(supabase: SupabaseClient<Database>, cartItemId: string, quantity: number): Promise<CartItem> {
    try {
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', cartItemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  static async removeFromCart(supabase: SupabaseClient<Database>, cartItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  static async clearCart(supabase: SupabaseClient<Database>, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}
