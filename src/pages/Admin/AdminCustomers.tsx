import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Mail, Phone, MapPin, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User, UserProfile } from '../../types';
import jsPDF from 'jspdf';

interface CustomerData extends User {
  profile?: UserProfile;
  orderCount?: number;
  totalSpent?: number;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles(*),
          orders(total_amount)
        `)
        .eq('role', 'buyer');

      if (usersError) throw usersError;

      const customersWithStats = users?.map(user => ({
        ...user,
        profile: user.user_profiles?.[0],
        orderCount: user.orders?.length || 0,
        totalSpent: user.orders?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0,
      })) || [];

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.profile?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const generateCustomerReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('R&F Essentials - Customer Report', 20, 30);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Customer Summary:', 20, 65);
    doc.setFontSize(10);
    doc.text(`Total Customers: ${customers.length}`, 20, 80);
    doc.text(`Active Customers: ${customers.filter(c => c.orderCount > 0).length}`, 20, 90);
    
    // Customer List
    doc.setFontSize(14);
    doc.text('Customer List:', 20, 110);
    doc.setFontSize(8);
    
    let yPos = 125;
    customers.slice(0, 20).forEach((customer, index) => {
      doc.text(
        `${index + 1}. ${customer.full_name} - ${customer.email} - Orders: ${customer.orderCount} - Spent: ₦${customer.totalSpent.toLocaleString()}`,
        20,
        yPos
      );
      yPos += 10;
    });
    
    doc.save('rf-essentials-customers.pdf');
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
              <p className="text-gray-600">View and manage customer data</p>
            </div>
            <button
              onClick={generateCustomerReport}
              className="btn-primary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Customers', value: customers.length, icon: Users, color: 'purple' },
            { title: 'Active Customers', value: customers.filter(c => c.orderCount > 0).length, icon: Users, color: 'green' },
            { title: 'Avg Orders/Customer', value: (customers.reduce((sum, c) => sum + c.orderCount, 0) / customers.length || 0).toFixed(1), icon: Users, color: 'blue' },
            { title: 'Avg Spent/Customer', value: `₦${(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0).toLocaleString()}`, icon: Users, color: 'pink' },
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

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Customer</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Location</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Orders</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Total Spent</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {customer.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.full_name}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {customer.profile?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.profile.phone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {customer.profile?.city && customer.profile?.country ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {customer.profile.city}, {customer.profile.country}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium">{customer.orderCount}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-purple-600">
                      ₦{customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No customers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;