import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Save, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
  fullName: yup.string().required('Full name is required'),
  phone: yup.string(),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  country: yup.string().required('Country is required'),
  interests: yup.array().of(yup.string()),
  minBudget: yup.number().min(0, 'Minimum budget must be positive'),
  maxBudget: yup.number().min(yup.ref('minBudget'), 'Maximum budget must be greater than minimum'),
  skinType: yup.string(),
  preferredBrands: yup.array().of(yup.string()),
});

type FormData = yup.InferType<typeof schema>;

const Profile: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, profile, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: user?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      country: profile?.country || 'Nigeria',
      interests: profile?.interests || [],
      minBudget: profile?.min_budget || 0,
      maxBudget: profile?.max_budget || 100000,
      skinType: profile?.skin_type || '',
      preferredBrands: profile?.preferred_brands || [],
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
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        interests: data.interests,
        min_budget: data.minBudget,
        max_budget: data.maxBudget,
        skin_type: data.skinType,
        preferred_brands: data.preferredBrands,
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center space-x-2 btn-secondary"
            >
              <Edit className="h-4 w-4" />
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('fullName')}
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phone')}
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="+234 123 456 7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    {...register('country')}
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
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
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., Lagos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    {...register('city')}
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., Ikeja"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    {...register('address')}
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={3}
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
              
              {/* Interests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Interests
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      disabled={!editing}
                      onClick={() => editing && toggleInterest(interest)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 disabled:cursor-not-allowed ${
                        watchedInterests.includes(interest)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300'
                      } ${!editing ? 'opacity-60' : ''}`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget (₦)
                  </label>
                  <input
                    {...register('minBudget', { valueAsNumber: true })}
                    type="number"
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 5000"
                  />
                  {errors.minBudget && (
                    <p className="mt-1 text-sm text-red-600">{errors.minBudget.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget (₦)
                  </label>
                  <input
                    {...register('maxBudget', { valueAsNumber: true })}
                    type="number"
                    disabled={!editing}
                    className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 50000"
                  />
                  {errors.maxBudget && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxBudget.message}</p>
                  )}
                </div>
              </div>

              {/* Skin Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skin Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {skinTypes.map((type) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        {...register('skinType')}
                        type="radio"
                        value={type}
                        disabled={!editing}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                        !editing ? 'opacity-60 cursor-not-allowed' : 'hover:border-purple-300'
                      }`}>
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Brands */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Brands
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {brandOptions.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      disabled={!editing}
                      onClick={() => editing && toggleBrand(brand)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 disabled:cursor-not-allowed ${
                        watchedBrands.includes(brand)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300'
                      } ${!editing ? 'opacity-60' : ''}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {editing && (
              <div className="border-t pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;