import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
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
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
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
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Order Number</h3>
              <p className="text-gray-600 text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-center">
              <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Payment Status</h3>
              <p className="text-green-600 font-medium capitalize">{order.payment_status}</p>
            </div>
            <div className="text-center">
              <Truck className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Order Status</h3>
              <p className="text-blue-600 font-medium capitalize">{order.status}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">{item.product?.brand}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-purple-600">₦{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/orders/${order.id}/track`} className="btn-primary">
              Track Your Order
            </Link>
            <Link to="/products" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
          <p className="text-gray-600 text-sm">
            You will receive an email confirmation shortly with your order details.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;