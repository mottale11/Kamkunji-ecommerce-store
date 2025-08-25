import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

export class CartService {
  // Get cart items from localStorage (in a real app, this would be from a cart table)
  static getCartItems(): string[] {
    if (typeof window === 'undefined') return [];
    
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  }

  // Add item to cart
  static addToCart(productId: string): void {
    if (typeof window === 'undefined') return;
    
    const cartItems = this.getCartItems();
    if (!cartItems.includes(productId)) {
      cartItems.push(productId);
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  // Remove item from cart
  static removeFromCart(productId: string): void {
    if (typeof window === 'undefined') return;
    
    const cartItems = this.getCartItems();
    const updatedCart = cartItems.filter(id => id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  // Clear cart
  static clearCart(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('cart');
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  // Get cart count
  static getCartCount(): number {
    return this.getCartItems().length;
  }

  // Check if item is in cart
  static isInCart(productId: string): boolean {
    const cartItems = this.getCartItems();
    return cartItems.includes(productId);
  }

  // Get cart items with product details - now requires supabase client as parameter
  static async getCartItemsWithDetails(supabase: SupabaseClient<Database>): Promise<CartItem[]> {
    const cartItemIds = this.getCartItems();
    
    if (cartItemIds.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          condition,
          location,
          phone,
          status,
          created_at,
          product_images (url),
          categories:category_id (name)
        `)
        .in('id', cartItemIds)
        .eq('status', 'approved');

      if (error) throw error;

      return data.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.product_images?.[0]?.url || '/placeholder-product.jpg',
        description: product.description,
        category: product.categories?.name || 'Unknown',
        condition: product.condition,
        location: product.location,
        phone: product.phone,
        status: product.status,
        created_at: product.created_at,
      }));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  }
}
