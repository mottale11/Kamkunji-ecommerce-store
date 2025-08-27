'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { FaTrash, FaShoppingCart, FaSignInAlt, FaArrowRight, FaLock } from 'react-icons/fa';
import { CartService, CartItem } from '@/services/cart';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import { toast } from 'react-hot-toast';

function CartPageContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const { supabase } = useSupabase();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Error checking auth status:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    // Load cart items
    const loadCart = async () => {
      try {
        const items = await CartService.getCartItemsWithDetails(supabase);
        setCartItems(items);
      } catch (err) {
        setError('Failed to load cart');
        console.error('Error loading cart:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const removeFromCart = async (id: string) => {
    try {
      setIsUpdating(true);
      CartService.removeFromCart(id);
      setCartItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsUpdating(true);
      CartService.clearCart();
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Failed to clear cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Add shipping/tax if needed
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-blue-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FaLock className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-blue-100">Please sign in to view your cart and checkout</p>
          </div>
          
          <div className="p-6 space-y-4">
            <Link 
              href={`/auth/signin?redirectTo=/cart`}
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Sign In to Your Account
            </Link>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Kamkunji Ndogo?</span>
              </div>
            </div>
            
            <Link
              href={`/auth/signup?redirectTo=/cart`}
              className="block w-full border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Create an Account
            </Link>
            
            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
              >
                Continue Shopping <FaArrowRight className="ml-1" size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for cart
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/" 
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <FaShoppingCart className="text-blue-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            href="/" 
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Main cart view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <span className="text-gray-500">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex items-start">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    disabled={isUpdating}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button 
                      className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                      onClick={() => {
                        // Decrease quantity logic
                      }}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 w-8 text-center">{item.quantity || 1}</span>
                    <button 
                      className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                      onClick={() => {
                        // Increase quantity logic
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-gray-900">
                    KES {item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end mt-4">
            <button
              onClick={clearCart}
              disabled={isUpdating || cartItems.length === 0}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Cart
            </button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:sticky lg:top-8 self-start">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">KES {calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              
              <div className="border-t border-gray-200 my-4"></div>
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>KES {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/checkout')}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdating || cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
            
            <div className="mt-4 text-center">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
              >
                Continue Shopping <FaArrowRight className="ml-1" size={12} />
              </Link>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
            <p className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Secure checkout with SSL encryption. Your payment information is protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}