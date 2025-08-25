import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/20/solid';
import { formatKSH } from '@/utils/currency';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category?: string;
  condition?: string;
  isFeatured?: boolean;
  description?: string;
  location?: string;
  originalPrice?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  category,
  condition = 'good',
  isFeatured = false,
  location,
  originalPrice,
}: ProductCardProps) {
  const conditionColors: Record<string, string> = {
    new: 'bg-green-100 text-green-800',
    'like-new': 'bg-blue-100 text-blue-800',
    good: 'bg-yellow-100 text-yellow-800',
    fair: 'bg-orange-100 text-orange-800',
    poor: 'bg-red-100 text-red-800',
  };

  const conditionText = condition.replace(/-/g, ' ');
  const showOriginalPrice = originalPrice && originalPrice > price;
  const discount = showOriginalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <Link href={`/products/${id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          
          {/* Condition Badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              conditionColors[condition] || 'bg-gray-100 text-gray-800'
            }`}>
              {conditionText}
            </span>
          </div>
          
          {/* Favorite Button */}
          <button 
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle favorite
            }}
          >
            <HeartIcon className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
          
          {/* Discount Badge */}
          {showOriginalPrice && (
            <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">{name}</h3>
            {category && (
              <p className="text-sm text-gray-500 mb-2">{category}</p>
            )}
          </div>
          
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-gray-900">
                {formatKSH(price)}
              </span>
              {showOriginalPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatKSH(originalPrice!)}
                </span>
              )}
            </div>
            
            {location && (
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {location}
              </div>
            )}
            
            <div className="mt-2 flex items-center">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    className={`h-4 w-4 ${
                      rating < 4 ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="ml-1 text-xs text-gray-500">(24)</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
