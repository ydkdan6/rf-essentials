import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Upload, Plus, Minus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';

const schema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().min(0, 'Price must be positive').required('Price is required'),
  category: yup.string().required('Category is required'),
  brand: yup.string().required('Brand is required'),
  image_url: yup.string().url('Must be a valid URL').required('Image URL is required'),
  stock_quantity: yup.number().min(0, 'Stock must be positive').required('Stock quantity is required'),
  is_active: yup.boolean(),
});

type FormData = yup.InferType<typeof schema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.brand,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
      });
      setTags(product.tags || []);
      setAdditionalImages(product.images || []);
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        category: 'skincare',
        brand: '',
        image_url: '',
        stock_quantity: 0,
        is_active: true,
      });
      setTags([]);
      setAdditionalImages([]);
    }
  }, [product, reset]);

  const categories = ['skincare', 'makeup', 'haircare', 'fragrance', 'wellness'];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addImage = () => {
    if (newImageUrl.trim() && !additionalImages.includes(newImageUrl.trim())) {
      setAdditionalImages([...additionalImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (imageToRemove: string) => {
    setAdditionalImages(additionalImages.filter(img => img !== imageToRemove));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const productData = {
        ...data,
        tags,
        images: additionalImages,
        updated_at: new Date().toISOString(),
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      {...register('name')}
                      className="input-field"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      {...register('brand')}
                      className="input-field"
                      placeholder="Enter brand name"
                    />
                    {errors.brand && (
                      <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₦) *
                    </label>
                    <input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      className="input-field"
                      placeholder="0"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select {...register('category')} className="input-field">
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      {...register('stock_quantity', { valueAsNumber: true })}
                      type="number"
                      className="input-field"
                      placeholder="0"
                    />
                    {errors.stock_quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        {...register('is_active')}
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Active Product</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="input-field"
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Image URL *
                  </label>
                  <input
                    {...register('image_url')}
                    type="url"
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
                  )}
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images
                  </label>
                  <div className="space-y-2">
                    {additionalImages.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          value={image}
                          readOnly
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="input-field flex-1"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="input-field flex-1"
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-6">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;