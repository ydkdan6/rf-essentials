import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button onClick={() => navigate('/orders')} className="btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const trackingSteps = [
    { status: 'pending', label: 'Order Placed', icon: Clock, completed: true },
    { status: 'processing', label: 'Processing', icon: Package, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { status: 'shipped', label: 'Shipped', icon: Truck, completed: ['shipped', 'delivered'].includes(order.status) },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle, completed: order.status === 'delivered' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/orders')}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Orders
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-600">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </motion.div>

        {/* Tracking Progress */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-8">Order Progress</h2>
          
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
            <div 
              className="absolute top-5 left-0 h-0.5 bg-purple-600 transition-all duration-500"
              style={{ 
                width: `${(trackingSteps.findIndex(step => step.status === order.status) + 1) / trackingSteps.length * 100}%` 
              }}
            ></div>
            
            <div className="relative flex justify-between">
              {trackingSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step.completed 
                        ? 'bg-purple-600 border-purple-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      step.completed ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Tracking Number</h3>
              <p className="text-blue-700 font-mono">{order.tracking_number}</p>
            </div>
          )}
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
          
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product?.name}</h3>
                  <p className="text-gray-600">{item.product?.brand}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    ₦{item.price.toLocaleString()} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-2xl font-bold text-purple-600">
                ₦{order.total_amount.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderTracking;