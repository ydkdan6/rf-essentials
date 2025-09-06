import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getProductRecommendations } from '../../lib/gemini';

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const { user, profile } = useAuth();
  const { addToCart } = useCart();

  const categories = ['all', 'skincare', 'makeup', 'haircare', 'fragrance', 'wellness'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange]);

  useEffect(() => {
    if (user && profile && products.length > 0) {
      loadRecommendations();
    }
  }, [user, profile, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory
      );
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    setFilteredProducts(filtered);
  };

  const loadRecommendations = async () => {
    if (!profile || !products.length) return;

    setLoadingRecommendations(true);
    try {
      const recommendedProducts = await getProductRecommendations({
        interests: profile.interests || [],
        minBudget: profile.min_budget || 0,
        maxBudget: profile.max_budget || 100000,
        skinType: profile.skin_type,
        preferredBrands: profile.preferred_brands,
        availableProducts: products,
      });

      setRecommendations(recommendedProducts);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      // Fallback to budget-based recommendations
      const fallbackRecs = products
        .filter(p => p.price >= (profile.min_budget || 0) && p.price <= (profile.max_budget || 100000))
        .slice(0, 6);
      setRecommendations(fallbackRecs);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) return;
    
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-xl mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
          <p className="text-gray-600">Discover premium beauty and wellness products</p>
        </motion.div>

        {/* Recommendations Section */}
        {user && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            </div>
            
            {loadingRecommendations ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 aspect-square rounded-lg mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {recommendations.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
                        <p className="font-bold text-purple-600 text-sm">₦{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₦)</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₦)</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="input-field"
                placeholder="100000"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center text-gray-600">
            <Filter className="h-5 w-5 mr-2" />
            <span>{filteredProducts.length} products found</span>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card overflow-hidden group"
            >
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/products/${product.id}`}>
                  <p className="text-sm text-purple-600 font-medium mb-1">{product.brand}</p>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-purple-600">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    Stock: {product.stock_quantity}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link to={`/products/${product.id}`} className="flex-1">
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      View Details
                    </button>
                  </Link>
                  {user && (
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange({ min: 0, max: 100000 });
              }}
              className="mt-4 btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;