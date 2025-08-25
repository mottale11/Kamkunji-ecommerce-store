'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { 
  FaChartLine, 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign,
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaChartPie
} from 'react-icons/fa';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  orderStatusCounts: { status: string; count: number }[];
  userGrowth: { month: string; users: number }[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    monthlyRevenue: [],
    topProducts: [],
    orderStatusCounts: [],
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch total counts
      const [usersCount, productsCount, ordersCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ]);

      // Fetch revenue data
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calculate total revenue
      const totalRevenue = orders?.reduce((sum, order) => 
        order.status === 'delivered' ? sum + (order.total_amount || 0) : sum, 0
      ) || 0;

      // Calculate monthly revenue
      const monthlyRevenue = calculateMonthlyRevenue(orders || [], startDate, endDate);

      // Fetch top products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price,
          product:products(name)
        `);

      const topProducts = calculateTopProducts(orderItems || []);

      // Calculate order status counts
      const orderStatusCounts = calculateOrderStatusCounts(orders || []);

      // Calculate user growth
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const userGrowth = calculateUserGrowth(users || [], startDate, endDate);

      setReportData({
        totalRevenue,
        totalOrders: ordersCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalProducts: productsCount.count || 0,
        monthlyRevenue,
        topProducts,
        orderStatusCounts,
        userGrowth
      });

    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (orders: any[], startDate: Date, endDate: Date) => {
    const months: { [key: string]: number } = {};
    
    // Initialize months
    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
      const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[monthKey] = 0;
    }

    // Sum revenue by month
    orders.forEach(order => {
      if (order.status === 'delivered') {
        const monthKey = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (months[monthKey] !== undefined) {
          months[monthKey] += order.total_amount || 0;
        }
      }
    });

    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
  };

  const calculateTopProducts = (orderItems: any[]) => {
    const productSales: { [key: string]: { sales: number; revenue: number } } = {};

    orderItems.forEach(item => {
      const productName = item.product?.name || 'Unknown Product';
      if (!productSales[productName]) {
        productSales[productName] = { sales: 0, revenue: 0 };
      }
      productSales[productName].sales += item.quantity || 0;
      productSales[productName].revenue += (item.quantity || 0) * (item.price || 0);
    });

    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const calculateOrderStatusCounts = (orders: any[]) => {
    const statusCounts: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  };

  const calculateUserGrowth = (users: any[], startDate: Date, endDate: Date) => {
    const months: { [key: string]: number } = {};
    
    // Initialize months
    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
      const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[monthKey] = 0;
    }

    // Count users by month
    users.forEach(user => {
      const monthKey = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (months[monthKey] !== undefined) {
        months[monthKey]++;
      }
    });

    return Object.entries(months).map(([month, users]) => ({ month, users }));
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }: any) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {trend && (
                <dd className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center">
                    {trend === 'up' ? (
                      <FaArrowUp className="mr-1 h-3 w-3" />
                    ) : (
                                              <FaArrowDown className="mr-1 h-3 w-3" />
                    )}
                    {trendValue}
                  </div>
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights into your ecommerce performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            aria-label="Select date range"
            title="Select date range"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaDollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">KES {reportData.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <StatCard
          title="Total Orders"
          value={reportData.totalOrders.toLocaleString()}
          icon={FaShoppingCart}
          color="bg-blue-500"
          trend="up"
          trendValue="+8% from last period"
        />
        <StatCard
          title="Total Users"
          value={reportData.totalUsers.toLocaleString()}
          icon={FaUsers}
          color="bg-purple-500"
          trend="up"
          trendValue="+15% from last period"
        />
        <StatCard
          title="Total Products"
          value={reportData.totalProducts.toLocaleString()}
          icon={FaBox}
          color="bg-yellow-500"
          trend="up"
          trendValue="+5% from last period"
        />
      </div>

      {/* Charts and detailed analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Monthly Revenue Trend
            </h3>
            <div className="space-y-3">
              {reportData.monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (item.revenue / Math.max(...reportData.monthlyRevenue.map(r => r.revenue))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      KES {item.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Performing Products
            </h3>
            <div className="space-y-3">
              {reportData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm text-gray-900 truncate max-w-32">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.sales} units sold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Order Status Distribution
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {reportData.orderStatusCounts.map((status) => (
              <div key={status.status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{status.count}</div>
                <div className="text-sm text-gray-500 capitalize">{status.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            User Growth Trend
          </h3>
          <div className="space-y-3">
            {reportData.userGrowth.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (item.users / Math.max(...reportData.userGrowth.map(u => u.users))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.users} users
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Key Insights
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaChartLine className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Revenue Growth</span>
              </div>
              <p className="mt-1 text-sm text-blue-700">
                Revenue has increased by 12% compared to the previous period
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaUsers className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">User Acquisition</span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                New user registrations are up by 15% this period
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaBox className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-900">Product Performance</span>
              </div>
              <p className="mt-1 text-sm text-yellow-700">
                Top 5 products account for 40% of total revenue
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}