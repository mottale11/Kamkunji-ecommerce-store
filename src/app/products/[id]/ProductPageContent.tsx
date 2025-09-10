'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaWhatsapp, FaHeart, FaRegHeart, FaArrowLeft, FaMapMarkerAlt, FaShoppingCart } from 'react-icons/fa';
import { MdOutlineDescription, MdInfoOutline, MdOutlinePhotoLibrary } from 'react-icons/md';
import { useSupabase } from '@/components/SupabaseProvider';
import { formatKSH } from '@/utils/currency';
import { CartService } from '@/services/cart';

interface ProductPageContentProps {
  id: string;
}

export default function ProductPageContent({ id }: ProductPageContentProps) {
  // Safely get Supabase client
  let supabase = null;
  try {
    const supabaseContext = useSupabase();
    supabase = supabaseContext.supabase;
  } catch (err) {
    console.warn('Supabase context not available:', err);
  }

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        
        if (!supabase) {
          throw new Error('Database connection not available');
        }

        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*), categories(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Product not found');
        
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (id && supabase) {
      fetchProduct();
    } else if (id && !supabase) {
      setError('Database connection not available. Please refresh the page.');
      setLoading(false);
    }
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Error Loading Product</h2>
          <p className="mb-4">{error || 'Product not found'}</p>
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const toggleWishlist = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const updated = isInWishlist 
        ? wishlist.filter((item: any) => item.id !== product.id)
        : [...wishlist, { id: product.id, name: product.name, price: product.price }];
      
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  const handleWhatsAppClick = () => {
    const message = `Hi, I'm interested in "${product.name}" listed here: ${window.location.href}`;
    window.open(`https://wa.me/254111882253?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.product_images?.length > 0 && (
                  <Image
                    src={product.product_images[currentImage].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="flex space-x-2 overflow-x-auto">
                {product.product_images?.map((img: any, index: number) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      currentImage === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-2xl font-bold text-green-600">
                    {formatKSH(product.price)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2"
                >
                  <FaWhatsapp />
                  <span>Order via WhatsApp</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={toggleWishlist}
                    className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {isInWishlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    <span>{isInWishlist ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={() => {
                      CartService.addToCart(product.id);
                      window.location.href = '/cart';
                    }}
                    className="flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <FaShoppingCart />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>

              {/* Product Meta */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                {product.category && (
                  <div className="flex">
                    <span className="text-gray-600 w-24">Category:</span>
                    <span>{product.categories?.name}</span>
                  </div>
                )}
                {product.condition && (
                  <div className="flex">
                    <span className="text-gray-600 w-24">Condition:</span>
                    <span className="capitalize">{product.condition}</span>
                  </div>
                )}
                {product.location && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 mr-2" />
                    <span>{product.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                }`}
              >
                <MdOutlineDescription />
                <span>Description</span>
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-6 py-4 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'specs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                }`}
              >
                <MdInfoOutline />
                <span>Specifications</span>
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-6 py-4 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'gallery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                }`}
              >
                <MdOutlinePhotoLibrary />
                <span>Gallery</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose">
                  {product.description || 'No description available.'}
                </div>
              )}
              {activeTab === 'specs' && (
                <div className="space-y-3">
                  {product.specifications ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(product.specifications, null, 2)}</pre>
                  ) : (
                    <p>No specifications available.</p>
                  )}
                </div>
              )}
              {activeTab === 'gallery' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.product_images?.map((img: any) => (
                    <div key={img.id} className="aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
