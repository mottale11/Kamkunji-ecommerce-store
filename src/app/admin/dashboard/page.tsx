'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign, 
  FaChartLine, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import Link from 'next/link';

// Prevent this page from being pre-rendered during build
export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  approvedProducts: number;
  pendingProducts: number;
}

// Move StatCard component outside to avoid re-creation on each render
const StatCard = ({ title, value, icon: Icon, color, href }: any) => {
  if (!Icon) {
    console.error('Icon is undefined for StatCard:', { title, icon: Icon });
    return null;
  }

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${href ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}>
      {href ? (
        <Link href={href}>
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                  <dd className="text-lg font-medium text-gray-900">{value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="text-lg font-medium text-gray-900">{value}</dd>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Build-time safe component
function AdminDashboardBuildSafe() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  // During build time, return the safe component
  if (typeof window === 'undefined') {
    return <AdminDashboardBuildSafe />;
  }

  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    approvedProducts: 0,
    pendingProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    if (supabase) {
      fetchDashboardData();
    }
  }, [supabase]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Debug: Let's see what products actually exist
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) {
        console.error('Error fetching all products:', productsError);
      } else {
        console.log('All products in database:', allProducts);
      }

      // Fetch approved products count
      const { count: approvedProductsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch pending products count
      const { count: pendingProductsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch pending orders count
      const { count: pendingOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Fetch recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent products
      const { data: recentProductsData } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        pendingOrders: pendingOrdersCount || 0,
        approvedProducts: approvedProductsCount || 0,
        pendingProducts: pendingProductsCount || 0,
      });

      setRecentOrders(recentOrdersData || []);
      setRecentProducts(recentProductsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; icon: any } } = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: FaClock },
      shipped: { color: 'bg-indigo-100 text-indigo-800', icon: FaClock },
      delivered: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaExclamationTriangle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your ecommerce store performance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={FaUsers}
          color="bg-blue-500"
          href="/admin/users"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={FaBox}
          color="bg-green-500"
          href="/admin/products"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={FaShoppingCart}
          color="bg-purple-500"
          href="/admin/orders"
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          icon={FaDollarSign}
          color="bg-yellow-500"
        />
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders.toLocaleString()}
          icon={FaClock}
          color="bg-orange-500"
          href="/admin/orders"
        />
        <StatCard
          title="Approved Products"
          value={stats.approvedProducts.toLocaleString()}
          icon={FaCheckCircle}
          color="bg-green-500"
          href="/admin/products"
        />
        <StatCard
          title="Pending Products"
          value={stats.pendingProducts.toLocaleString()}
          icon={FaExclamationTriangle}
          color="bg-yellow-500"
          href="/admin/products"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.user?.full_name || 'Guest'} • KES {order.total_amount}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Products</h3>
              <Link
                href="/admin/products"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.categories?.name || 'Uncategorized'} • ${product.price}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(product.status)}
                    <span className="text-xs text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaBox className="mr-2 h-4 w-4" />
              Add Product
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <FaShoppingCart className="mr-2 h-4 w-4" />
              Manage Orders
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
            >
              <FaUsers className="mr-2 h-4 w-4" />
              View Users
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <FaChartLine className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}