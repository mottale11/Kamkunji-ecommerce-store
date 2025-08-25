'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaWhatsapp, FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import { formatKSH } from '@/utils/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  category?: { name: string };
}

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, currentProductId }) => {
  const scrollContainer = React.useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainer.current) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    scrollContainer.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">You May Also Like</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="Previous products"
          >
            <FaChevronLeft />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            aria-label="Next products"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollContainer}
          className="flex space-x-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }} // Hide scrollbar for Firefox
        >
          {products
            .filter(product => product.id !== currentProductId)
            .map((product) => (
              <div key={product.id} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm overflow-hidden group">
                <div className="relative">
                  <div className="aspect-square relative bg-gray-100">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:opacity-90 transition-opacity duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                      <Link 
                        href={`/products/${product.id}`}
                        className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100 transition-colors"
                        title="View details"
                      >
                        <FaInfoCircle size={16} />
                      </Link>
                      <button 
                        onClick={() => {
                          const message = `Hi, I'm interested in "${product.name}" listed here: ${window.location.origin}/products/${product.id}`;
                          window.open(`https://wa.me/254111882253?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                        title="Order on WhatsApp"
                      >
                        <FaWhatsapp size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/products/${product.id}`} className="block hover:text-blue-600 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  </Link>
                  {product.category && (
                    <p className="text-xs text-gray-500">{product.category.name}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatKSH(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
