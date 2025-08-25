'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

function CategoryPageContent({ params }: { params: { slug: string } }) {
  const { supabase } = useSupabase();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the slug from params
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    async function fetchCategoryAndProducts() {
      try {
        setLoading(true);
        setError(null);
        
        if (!slug) return;
        
        // First, get the category by slug
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .single();

        if (categoryError) throw categoryError;
        if (!categoryData) {
          setError('Category not found');
          return;
        }

        setCategory(categoryData);

        // Then, get products in this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_images(url),
            categories(name)
          `)
          .eq('category_id', categoryData.id)
          .eq('status', 'approved');

        if (productsError) throw productsError;
        
        // Transform the data to match our ProductCard props
        const formattedProducts = (productsData || []).map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.product_images?.[0]?.url || null,
          category: product.categories?.name,
          condition: product.condition,
          isFeatured: product.featured
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching category products:', err);
        setError('Failed to load category. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (supabase && slug) {
      fetchCategoryAndProducts();
    }
  }, [slug, supabase]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Error Loading Category</h2>
          <p className="mb-4">{error}</p>
          <a 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <span className="mr-2">←</span>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {category?.name || 'Category'}
        {products.length > 0 && ` (${products.length})`}
      </h1>
      
      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found in this category.</p>
          <a 
            href="/" 
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            Browse all products
          </a>
        </div>
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

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <CategoryPageContent params={params} />
    </Suspense>
  );
}
