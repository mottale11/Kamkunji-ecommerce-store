'use client';

import { useState, useEffect } from 'react';
import { CartService } from '@/services/cart';

export default function CartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cartCount = CartService.getCartCount();
      setCount(cartCount);
    };

    // Update count on mount
    updateCount();

    // Listen for storage changes (when cart is updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        updateCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event listener for cart updates within the same tab
    const handleCartUpdate = () => {
      updateCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {count}
    </span>
  );
}
