import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Building, QrCode, Sparkles, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

// Validation Schema
const schema = yup.object({
  business_name: yup.string().required('Business name is required').min(2, 'Must be at least 2 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Must be at least 6 characters').matches(/\d/, 'Must contain at least one number'),
}).required();

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerAuth({
      business_name: data.business_name,
      email: data.email,
      password: data.password
    });
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-50 to-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
          
          {/* Left Side - Registration Form */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 xl:p-16">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 sm:mb-12">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-primary-500 text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                  <span className="font-bold text-xl">F</span>
                </div>
                <span className="font-bold text-dark-900 text-lg">Feedlyze</span>
              </Link>
              <div className="text-sm text-dark-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto">
              <div className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-3">Create your account</h1>
                <p className="text-dark-500">Start collecting digital feedback today</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-700">Business/Organization Name</label>
                  <div className="relative">
                    <input
                      {...register('business_name')}
                      type="text"
                      placeholder="Your business or organization name"
                      className={`w-full px-4 py-3 bg-white border ${errors.business_name ? 'border-danger-500' : 'border-light-300'} rounded-xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                    />
                    <Building className="absolute right-3 top-3.5 h-5 w-5 text-dark-400" />
                  </div>
                  {errors.business_name && (
                    <p className="text-danger-500 text-sm mt-1">{errors.business_name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-700">Email</label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 bg-white border ${errors.email ? 'border-danger-500' : 'border-light-300'} rounded-xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                    />
                    <Mail className="absolute right-3 top-3.5 h-5 w-5 text-dark-400" />
                  </div>
                  {errors.email && (
                    <p className="text-danger-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-700">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type="password"
                      placeholder="Create a secure password"
                      className={`w-full px-4 py-3 bg-white border ${errors.password ? 'border-danger-500' : 'border-light-300'} rounded-xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                    />
                    <Lock className="absolute right-3 top-3.5 h-5 w-5 text-dark-400" />
                  </div>
                  {errors.password && (
                    <p className="text-danger-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-dark-500 mt-1">Must be at least 6 characters with one number</p>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-light-300 rounded"
                    />
                  </div>
                  <label htmlFor="terms" className="ml-3 text-sm text-dark-600">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full py-3.5 text-base font-medium rounded-xl"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              {/* Security Note */}
              <div className="mt-8 p-4 bg-light-50 rounded-xl border border-light-300">
                <p className="text-sm text-dark-600 text-center">
                  Your data is protected with standard security measures. All feedback collected is stored securely.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Value Proposition */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 xl:p-16 flex-col justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-lg mx-auto">
              {/* Feature Icons */}
              <div className="flex justify-center gap-6 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Value Proposition */}
              <div className="text-white text-center mb-8">
                <h2 className="text-2xl xl:text-3xl font-bold mb-4">
                  Digitize Your Feedback Process
                </h2>
                <p className="text-primary-100 leading-relaxed">
                  Create QR-based surveys to collect and analyze customer feedback digitally
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">QR Code Collection</h4>
                    <p className="text-primary-100 text-sm">Place QR codes to collect digital feedback</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Digital Organization</h4>
                    <p className="text-primary-100 text-sm">All responses stored in one dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Sentiment Analysis</h4>
                    <p className="text-primary-100 text-sm">Understand feedback patterns with AI assistance</p>
                  </div>
                </div>
              </div>

              {/* QR Code Demo */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">How It Works</h4>
                    <p className="text-primary-200 text-sm">Generate QR codes for your feedback forms</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-24 h-24 bg-white/30 rounded flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;