import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const schema = yup.object({
  interests: yup.array().of(yup.string()).min(1, 'Please select at least one interest'),
  minBudget: yup.number().min(0, 'Minimum budget must be positive').required('Minimum budget is required'),
  maxBudget: yup.number().min(yup.ref('minBudget'), 'Maximum budget must be greater than minimum').required('Maximum budget is required'),
  skinType: yup.string().required('Please select your skin type'),
  preferredBrands: yup.array().of(yup.string()),
  phone: yup.string(),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  country: yup.string().required('Country is required'),
});

type FormData = yup.InferType<typeof schema>;

const DataCollection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      interests: [],
      preferredBrands: [],
      country: 'Nigeria',
    },
  });

  const watchedInterests = watch('interests') || [];
  const watchedBrands = watch('preferredBrands') || [];

  const interestOptions = [
    'Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Body Care', 
    'Wellness', 'Anti-aging', 'Acne Treatment', 'Moisturizing', 'Sun Protection'
  ];

  const brandOptions = [
    'The Ordinary', 'CeraVe', 'Neutrogena', 'Olay', 'L\'Oréal', 
    'Maybelline', 'Clinique', 'Estée Lauder', 'Nivea', 'Dove'
  ];

  const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];

  const toggleInterest = (interest: string) => {
    const current = watchedInterests;
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    setValue('interests', updated);
  };

  const toggleBrand = (brand: string) => {
    const current = watchedBrands;
    const updated = current.includes(brand)
      ? current.filter(b => b !== brand)
      : [...current, brand];
    setValue('preferredBrands', updated);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await updateProfile({
        interests: data.interests,
        min_budget: data.minBudget,
        max_budget: data.maxBudget,
        skin_type: data.skinType,
        preferred_brands: data.preferredBrands,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
      });
      navigate('/products');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's Personalize Your Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us understand your preferences so we can recommend the perfect products for you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Interests */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                What are you interested in? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      watchedInterests.includes(interest)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {errors.interests && (
                <p className="mt-2 text-sm text-red-600">{errors.interests.message}</p>
              )}
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Minimum Budget (₦) *
                </label>
                <input
                  {...register('minBudget', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="e.g., 5000"
                />
                {errors.minBudget && (
                  <p className="mt-1 text-sm text-red-600">{errors.minBudget.message}</p>
                )}
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Maximum Budget (₦) *
                </label>
                <input
                  {...register('maxBudget', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="e.g., 50000"
                />
                {errors.maxBudget && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxBudget.message}</p>
                )}
              </div>
            </div>

            {/* Skin Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                What's your skin type? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {skinTypes.map((type) => (
                  <label key={type} className="cursor-pointer">
                    <input
                      {...register('skinType')}
                      type="radio"
                      value={type}
                      className="sr-only"
                    />
                    <div className="p-3 rounded-lg border-2 text-center transition-all duration-200 hover:border-purple-300 peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:text-purple-700">
                      {type}
                    </div>
                  </label>
                ))}
              </div>
              {errors.skinType && (
                <p className="mt-2 text-sm text-red-600">{errors.skinType.message}</p>
              )}
            </div>

            {/* Preferred Brands */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Preferred Brands (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {brandOptions.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      watchedBrands.includes(brand)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input-field"
                    placeholder="+234 123 456 7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select {...register('country')} className="input-field">
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    {...register('state')}
                    type="text"
                    className="input-field"
                    placeholder="e.g., Lagos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    className="input-field"
                    placeholder="e.g., Ikeja"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    {...register('address')}
                    className="input-field"
                    rows={3}
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Saving...' : 'Continue to Products'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DataCollection;