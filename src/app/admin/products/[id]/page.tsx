'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import type { Database } from '@/types/database.types';
import { useSupabase } from '@/components/SupabaseProvider';

type Product = Database['public']['Tables']['products']['Row'] & {
  product_images: Array<{
    id: string;
    url: string;
    is_primary: boolean;
    created_at: string;
  }>;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { id } = await params;
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Product not found');

        setProduct(data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params, supabase]);

  const handleSuccess = () => {
    router.push('/admin/products');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-700 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <h3 className="text-yellow-800 font-medium">Product Not Found</h3>
        <p className="text-yellow-700 mt-2">The requested product could not be found.</p>
        <button 
          onClick={() => router.push('/admin/products')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Transform the product data to match the form's expected format
  const initialData = {
    ...product,
    images: product.product_images?.map(img => img.url) || [],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm 
        initialData={initialData} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
