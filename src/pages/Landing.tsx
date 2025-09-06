import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, Heart } from 'lucide-react';

const Landing: React.FC = () => {
  const features = [
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Premium Quality",
      description: "Carefully curated products from trusted brands worldwide"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "100% Authentic",
      description: "Guaranteed authentic products with quality assurance"
    },
    {
      icon: <Truck className="h-8 w-8 text-blue-500" />,
      title: "Fast Delivery",
      description: "Quick and reliable delivery to your doorstep"
    },
    {
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      title: "Customer Care",
      description: "24/7 support for all your beauty and wellness needs"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Discover Your
                <span className="block bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  Perfect Essentials
                </span>
              </h1>
              <p className="text-xl mb-8 text-purple-100 leading-relaxed">
                Premium beauty and wellness products tailored to your unique needs. 
                Experience the difference with our AI-powered recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="btn-primary text-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </Link>
                <Link to="/products" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Browse Products
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="/img1.png"
                  alt="Beauty Products"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 animate-bounce-gentle"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose R&F Essentials?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing you with the best beauty and wellness experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Beauty Routine?
            </h2>
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have discovered their perfect essentials with us.
            </p>
            <Link to="/signup" className="btn-secondary bg-white text-purple-600 hover:bg-gray-100">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;