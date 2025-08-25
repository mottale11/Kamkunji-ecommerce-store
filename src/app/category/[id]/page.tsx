'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaThLarge, FaList, FaHeart, FaEye, FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';
import { getCategoryById } from '@/services/categories';
import { getProducts } from '@/services/products';
import { Category } from '@/services/categories';
import { ProductWithImages } from '@/services/products';

export default function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategoryAndProducts() {
      try {
        setLoading(true);
        setError(null);
        
        // Ensure id is a string
        const categoryId = Array.isArray(id) ? id[0] : id;
        
        // Fetch category details
        const categoryData = await getCategoryById(categoryId);
        setCategory(categoryData);
        
        // Fetch products for this category
        const productsData = await getProducts({ category_id: categoryId, status: 'approved' });
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading category page:', err);
        setError('Failed to load category and products. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      loadCategoryAndProducts();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Category not found'}</p>
          <Link href="/" className="inline-flex items-center mt-2 text-blue-600 hover:underline">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition-colors"
            title="Back to Home"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{products.length} items</span>
          <span>•</span>
          <Link href="/" className="hover:text-blue-600 transition-colors">Browse All Categories</Link>
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p>No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Filter and Sort Options */}
          <div className="col-span-full mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-4">
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Filter by Price</option>
                <option value="low">Low to High</option>
                <option value="high">High to Low</option>
              </select>
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sort by</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors" title="Grid View">
                <FaThLarge className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors" title="List View">
                <FaList className="w-5 h-5" />
              </button>
            </div>
          </div>
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all group relative">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square">
                  <Image
                    src={product.images?.[0]?.url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-bold">KES {product.price.toLocaleString()}</p>
                    <div className="flex space-x-2">
                      <Link 
                        href={`https://wa.me/254111882253?text=I'm%20interested%20in%20${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-green-600 transition-colors"
                        title="Order via WhatsApp"
                      >
                        <FaWhatsapp className="w-5 h-5" />
                      </Link>
                      <Link href={`/products/${product.id}`} className="text-gray-600 hover:text-blue-600 transition-colors" title="View Details">
                        <FaEye className="w-5 h-5" />
                      </Link>
                      <button className="text-gray-600 hover:text-red-500 transition-colors" title="Add to Wishlist">
                        <FaHeart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 capitalize">{product.condition}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}