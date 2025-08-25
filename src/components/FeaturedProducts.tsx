'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from './SupabaseProvider';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { ProductWithImages } from '@/services/products';
import { FaHeart, FaMapMarkerAlt, FaStar, FaEye, FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { formatKSH, formatDiscount } from '@/utils/currency';

export default function FeaturedProducts() {
  const { supabase } = useSupabase();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            condition,
            featured,
            categories(name),
            product_images(
              url
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(10);

        if (fetchError) throw fetchError;
        
        // Safely transform the data with null checks
        const formattedProducts = (data || []).map(product => ({
          id: product.id,
          name: product.name || 'Unnamed Product',
          price: product.price || 0,
          imageUrl: product.product_images?.[0]?.url || null,
          category: product.categories?.name || 'Uncategorized',
          condition: product.condition || 'good',
          isFeatured: Boolean(product.featured),
          description: product.description || '',
          location: product.location || '',
          originalPrice: product.original_price || 0,
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (supabase) {
      fetchFeaturedProducts();
    }
  }, [supabase]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="text-center py-12">
          <p className="text-gray-500">No featured products available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
            category={product.category}
            condition={product.condition}
            isFeatured={product.isFeatured}
            description={product.description}
            location={product.location}
            originalPrice={product.originalPrice}
          />
        ))}
      </div>
    </div>
  );
}