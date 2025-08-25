'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaFolder, FaShoppingBag, FaMobile, FaLaptop, FaCar, FaHome, FaGamepad, FaTshirt, FaBook, FaWhatsapp } from 'react-icons/fa';
import { useSupabase } from './SupabaseProvider';

// Icon mapping for categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('phone') || name.includes('mobile')) return FaMobile;
  if (name.includes('laptop') || name.includes('computer')) return FaLaptop;
  if (name.includes('car') || name.includes('vehicle')) return FaCar;
  if (name.includes('house') || name.includes('home')) return FaHome;
  if (name.includes('game') || name.includes('console')) return FaGamepad;
  if (name.includes('clothing') || name.includes('fashion')) return FaTshirt;
  if (name.includes('book') || name.includes('study')) return FaBook;
  if (name.includes('shopping') || name.includes('market')) return FaShoppingBag;
  return FaFolder;
};

export default function CategoryList() {
  const { supabase } = useSupabase();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);

        // Check if Supabase client is available
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        // Fetch categories from Supabase
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (fetchError) {
          console.error('Error fetching categories:', {
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
            code: fetchError.code
          });
          throw fetchError;
        }

        setCategories(data || []);
      } catch (err: any) {
        console.error('Error in CategoryList:', err);
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-red-800 mb-3">Database Connection Error</h3>
            <p className="text-red-700 mb-4">
              Failed to load categories from the database.
            </p>
            <div className="text-sm bg-white p-4 rounded-lg border border-red-200 max-w-md mx-auto">
              <p className="font-medium mb-2 text-red-800">Error details:</p>
              <p className="text-red-600">{error}</p>
            </div>
            <p className="text-sm mt-4 text-red-600">
              Make sure your Supabase project is running and the database schema is properly set up.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-4xl mb-4">ℹ️</div>
            <h3 className="text-xl font-bold text-blue-800 mb-3">No Categories Found</h3>
            <p className="text-blue-700 mb-4">
              No categories have been created yet. Categories will appear here once they are added to the database.
            </p>
            <div className="text-sm bg-white p-4 rounded-lg border border-blue-200 max-w-md mx-auto">
              <p className="font-medium mb-2 text-blue-800">To add categories:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-left">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to the Table Editor</li>
                <li>Add categories to the 'categories' table</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {categories.map((category, index) => {
        const IconComponent = getCategoryIcon(category.name);
        return (
          <Link 
            key={category.id} 
            href={`/category/${category.id}`}
            className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-center">
              {/* Category Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 transform group-hover:scale-110">
                <IconComponent className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300" size={28} />
              </div>
              
              {/* Category Name */}
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {category.name}
              </h3>
              
              {/* Category Description */}
              {category.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              {/* Explore Button */}
              <div className="flex items-center justify-center space-x-2 text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                <span className="text-sm font-medium">Explore</span>
                <FaArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}