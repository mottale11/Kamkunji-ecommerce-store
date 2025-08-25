'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCheck, 
  FaTimes,
  FaFilter,
  FaSort
} from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
  product_images?: Array<{
    id: string;
    url: string;
    is_primary: boolean;
  }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_images(*)
        `);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      
      // Debug: Log what we're getting
      console.log('Products fetched from database:', data);
      console.log('Products count:', data?.length || 0);
      
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const updateProductStatus = async (productId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(`Product ${newStatus} successfully`);
      
      // Update the local state immediately for better UX
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: newStatus as any, updated_at: new Date().toISOString() }
            : product
        )
      );
    } catch (err: any) {
      console.error('Error updating product status:', err);
      toast.error('Failed to update product status');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      
      // First, delete the product images
      const { error: imageError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if (imageError) throw imageError;

      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProducts(products.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (err: any) {
      console.error('Error deleting product:', err);
      toast.error(`Failed to delete product: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPrimaryImage = (product: Product) => {
    if (product.product_images && product.product_images.length > 0) {
      const primaryImage = product.product_images.find(img => img.is_primary);
      return primaryImage || product.product_images[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all products in your store
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search products..."
                />
              </div>
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="created_at">Date Created</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Sort order */}
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={() => setSortOrder('asc')}
            className={`px-3 py-1 text-sm rounded-md ${
              sortOrder === 'asc'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaSort className="inline mr-1 h-3 w-3" />
            Ascending
          </button>
          <button
            onClick={() => setSortOrder('desc')}
            className={`px-3 py-1 text-sm rounded-md ${
              sortOrder === 'desc'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaSort className="inline mr-1 h-3 w-3 rotate-180" />
            Descending
          </button>
        </div>
      </div>

      {/* Products grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error ? (
            <div className="text-center py-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product image */}
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    {getPrimaryImage(product) ? (
                      <Image
                        src={getPrimaryImage(product)!.url}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      {getStatusBadge(product.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        KES {product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.categories?.name || 'Uncategorized'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      Created: {new Date(product.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          <FaEye className="mr-1 h-3 w-3" />
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                        >
                          <FaEdit className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </div>

                      <div className="flex space-x-1">
                        {product.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateProductStatus(product.id, 'approved')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                              title="Approve product"
                            >
                              <FaCheck className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => updateProductStatus(product.id, 'rejected')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                              title="Reject product"
                            >
                              <FaTimes className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteProduct(product.id)}
                          disabled={deletingId === product.id}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                          title="Delete product"
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
