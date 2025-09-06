import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Eye,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('products').select('id, stock_quantity', { count: 'exact' }),
        supabase.from('orders').select('id, total_amount, status', { count: 'exact' }),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const pendingOrders = ordersRes.data?.filter(order => order.status === 'pending').length || 0;
      const lowStockProducts = productsRes.data?.filter(product => product.stock_quantity < 10).length || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      });

      // Fetch sales data for charts
      const { data: salesByMonth } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .eq('payment_status', 'paid');

      // Process sales data by month
      const monthlyData = salesByMonth?.reduce((acc: any, order) => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + order.total_amount;
        return acc;
      }, {});

      const salesChartData = Object.entries(monthlyData || {}).map(([month, revenue]) => ({
        month,
        revenue,
      }));

      setSalesData(salesChartData);

      // Fetch category data
      const { data: products } = await supabase
        .from('products')
        .select('category');

      const categoryCount = products?.reduce((acc: any, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});

      const categoryChartData = Object.entries(categoryCount || {}).map(([category, count]) => ({
        name: category,
        value: count,
      }));

      setCategoryData(categoryChartData);

      // Fetch recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          users(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('R&F Essentials - Sales Report', 20, 30);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Stats
    doc.setFontSize(14);
    doc.text('Overview:', 20, 65);
    doc.setFontSize(10);
    doc.text(`Total Users: ${stats.totalUsers}`, 20, 80);
    doc.text(`Total Products: ${stats.totalProducts}`, 20, 90);
    doc.text(`Total Orders: ${stats.totalOrders}`, 20, 100);
    doc.text(`Total Revenue: ₦${stats.totalRevenue.toLocaleString()}`, 20, 110);
    doc.text(`Pending Orders: ${stats.pendingOrders}`, 20, 120);
    doc.text(`Low Stock Products: ${stats.lowStockProducts}`, 20, 130);
    
    // Recent Orders
    doc.setFontSize(14);
    doc.text('Recent Orders:', 20, 150);
    doc.setFontSize(10);
    
    let yPos = 165;
    recentOrders.forEach((order, index) => {
      doc.text(
        `${index + 1}. Order #${order.id.slice(0, 8)} - ₦${order.total_amount.toLocaleString()} - ${order.status}`,
        20,
        yPos
      );
      yPos += 10;
    });
    
    doc.save('rf-essentials-report.pdf');
  };

  const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Overview of your R&F Essentials business</p>
            </div>
            <button
              onClick={generateReport}
              className="btn-primary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'purple' },
            { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'blue' },
            { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'green' },
            { title: 'Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'pink' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Sales</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-purple-600 hover:text-purple-700 flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">{order.users?.full_name}</td>
                    <td className="py-3 px-4 font-semibold">
                      ₦{order.total_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="card p-6 text-center">
            <Package className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Products</h3>
            <p className="text-gray-600 mb-4">Add, edit, or remove products from your catalog</p>
            <Link to="/admin/products" className="btn-primary">
              Manage Products
            </Link>
          </div>

          <div className="card p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
            <p className="text-gray-600 mb-4">Track and manage customer orders</p>
            <Link to="/admin/orders" className="btn-primary">
              View Orders
            </Link>
          </div>

          <div className="card p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Data</h3>
            <p className="text-gray-600 mb-4">View and manage customer information</p>
            <Link to="/admin/customers" className="btn-primary">
              View Customers
            </Link>
          </div>
        </motion.div>

        {/* Alerts */}
        {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 space-y-4"
          >
            {stats.pendingOrders > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">
                    You have {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''} that need attention
                  </span>
                </div>
              </div>
            )}
            
            {stats.lowStockProducts > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">
                    {stats.lowStockProducts} product{stats.lowStockProducts !== 1 ? 's' : ''} running low on stock
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;