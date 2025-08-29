'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import SupabaseWrapper from '@/components/SupabaseWrapper';

// Prevent this page from being pre-rendered during build
export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <SupabaseWrapper>
      <SearchPageContent />
    </SupabaseWrapper>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { supabase } = useSupabase();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function searchProducts() {
      try {
        setLoading(true);
        setError(null);
        
        if (!query.trim()) {
          setProducts([]);
          return;
        }

        const { data, error: searchError } = await supabase
          .from('products')
          .select(`
            *,
            product_images(url),
            categories(name)
          `)
          .ilike('name', `%${query}%`)
          .eq('status', 'approved');

        if (searchError) throw searchError;
        
        // Transform the data to match our ProductCard props
        const formattedProducts = (data || []).map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.product_images?.[0]?.url,
          category: product.categories?.name,
          condition: product.condition,
          isFeatured: product.featured
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (supabase) {
      const debounceTimer = setTimeout(() => {
        searchProducts();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [query, supabase]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Searching for "{query}"</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {products.length > 0 
          ? `Search results for "${query}" (${products.length})`
          : `No results found for "${query}"`
        }
      </h1>
      
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>
      )}
    </div>
  );
}
