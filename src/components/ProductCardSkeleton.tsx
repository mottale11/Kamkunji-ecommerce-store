import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content placeholder */}
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}
