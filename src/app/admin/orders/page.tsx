'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaSort,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimes,
  FaPrint
} from 'react-icons/fa';

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
  };
  shipping_address?: {
    full_name: string;
    city: string;
    state: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, email),
          shipping_address
        `);

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`id.ilike.%${searchTerm}%,user.full_name.ilike.%${searchTerm}%,user.email.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
          : order
      ));

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast.error(`Failed to update order status: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string; icon: any } } = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: FaClock },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing', icon: FaClock },
      shipped: { color: 'bg-indigo-100 text-indigo-800', text: 'Shipped', icon: FaTruck },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled', icon: FaTimes },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="mr-1 h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const getStatusOptions = (currentStatus: string) => {
    const statusFlow: { [key: string]: string[] } = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    return statusFlow[currentStatus] || [];
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all customer orders and track their status
        </p>
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
                  placeholder="Search orders by ID, customer name, or email..."
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
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
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
              <option value="total_amount">Total Amount</option>
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

      {/* Orders table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error ? (
            <div className="text-center py-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.shipping_address?.city}, {order.shipping_address?.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.full_name || 'Guest'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            <FaEye className="mr-1 h-3 w-3" />
                            View
                          </Link>
                          
                          {/* Status update dropdown */}
                          {getStatusOptions(order.status).length > 0 && (
                            <div className="relative inline-block text-left">
                              <select
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <option value="">Update Status</option>
                                {getStatusOptions(order.status).map((status) => (
                                  <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                            title="Print order"
                          >
                            <FaPrint className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-yellow-500">
                <FaClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.filter(o => o.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-blue-500">
                <FaClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.filter(o => o.status === 'processing').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-indigo-500">
                <FaTruck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Shipped</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.filter(o => o.status === 'shipped').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-green-500">
                <FaCheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Delivered</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.filter(o => o.status === 'delivered').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}