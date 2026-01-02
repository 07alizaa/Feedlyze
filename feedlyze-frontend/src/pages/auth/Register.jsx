import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Mail, Lock, Building, Star, MessageCircle, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">

      {/* Main Split Card */}
      <div className="bg-white w-full max-w-[1400px] min-h-[850px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative bg-white">

          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/25">
                <span className="font-bold text-xl">F</span>
              </div>
            </Link>
            <div className="text-sm font-medium text-dark-500">
              Already a member?{' '}
              <Link to="/login" className="text-dark-900 font-bold hover:underline ml-1">
                Sign In
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-dark-900 mb-3">Create your account</h2>
              <p className="text-dark-500">Start collecting actionable feedback today.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Business Name Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-dark-700 ml-1">Business Name*</label>
                <div className="relative group">
                  <input
                    {...register('business_name')}
                    type="text"
                    placeholder="e.g. Acme Corp"
                    className={`w-full px-4 py-3.5 bg-light-50 border ${errors.business_name ? 'border-danger-500' : 'border-light-200 group-hover:border-primary-300'} rounded-2xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-dark-400" />
                  </div>
                </div>
                {errors.business_name && <p className="text-danger-500 text-xs ml-1">{errors.business_name.message}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-dark-700 ml-1">Email Address*</label>
                <div className="relative group">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="hello@example.com"
                    className={`w-full px-4 py-3.5 bg-light-50 border ${errors.email ? 'border-danger-500' : 'border-light-200 group-hover:border-primary-300'} rounded-2xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-dark-400" />
                  </div>
                </div>
                {errors.email && <p className="text-danger-500 text-xs ml-1">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-dark-700 ml-1">Password*</label>
                <div className="relative group">
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••••••"
                    className={`w-full px-4 py-3.5 bg-light-50 border ${errors.password ? 'border-danger-500' : 'border-light-200 group-hover:border-primary-300'} rounded-2xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-dark-400" />
                  </div>
                </div>
                {errors.password && <p className="text-danger-500 text-xs ml-1">{errors.password.message}</p>}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start text-sm pt-2">
                <div className="flex items-center h-5">
                  <input type="checkbox" className="w-4 h-4 rounded border-light-300 text-primary-500 focus:ring-primary-500" />
                </div>
                <label className="ml-3 text-dark-500">
                  I agree to the <a href="#" className="font-semibold text-dark-900 hover:text-primary-500 hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-dark-900 hover:text-primary-500 hover:underline">Privacy Policy</a>
                </label>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                className="bg-primary-500 hover:bg-primary-600 shadow-xl shadow-primary-500/25 py-4 text-base rounded-2xl mt-4"
              >
                {isLoading ? 'Creating Account...' : 'Get Started Free'}
              </Button>
            </form>

            <div className="mt-8 text-center bg-light-50 p-4 rounded-2xl border border-light-100">
              <p className="text-sm text-dark-600">
                "Feedlyze transformed how we handle customer feedback. Highly recommended!"
              </p>
              <div className="flex justify-center mt-2 text-warning-500">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 lg:mt-0 flex justify-center lg:justify-start text-xs text-dark-400 font-medium">
            © 2024 Feedlyze Inc.
          </div>
        </div>

        {/* Right Side - Visual Section */}
        <div className="hidden lg:flex w-1/2 bg-primary-500 relative overflow-hidden flex-col items-center justify-center p-12">

          {/* Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full border-[60px] border-white"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full border-[60px] border-white"></div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 w-full max-w-lg">

            {/* Floating Mockup Card - Survey Builder Style */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl p-8 mb-12 transform hover:scale-[1.02] transition-transform duration-500 relative"
            >
              {/* Decorative Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -right-6 -top-6 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2"
              >
                <div className="bg-success-100 p-1.5 rounded-lg"><CheckCircle className="w-5 h-5 text-success-600" /></div>
                <span className="text-sm font-bold text-dark-900">Survey Ready</span>
              </motion.div>

              {/* Mockup Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-dark-900">How was your experience?</h3>
                <p className="text-sm text-dark-500 mt-1">Help us improve our service</p>
              </div>

              {/* Mockup Options */}
              <div className="space-y-3">
                <div className="p-3 border border-light-200 rounded-xl flex items-center gap-3 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <div className="w-5 h-5 rounded-full border-2 border-light-300"></div>
                  <span className="text-sm font-medium text-dark-700">Excellent, loved it! 😍</span>
                </div>
                <div className="p-3 border-2 border-primary-500 bg-primary-50 rounded-xl flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-2 border-primary-500 bg-primary-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-bold text-dark-900">It was okay 🙂</span>
                </div>
                <div className="p-3 border border-light-200 rounded-xl flex items-center gap-3 cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <div className="w-5 h-5 rounded-full border-2 border-light-300"></div>
                  <span className="text-sm font-medium text-dark-700">Could be better 😐</span>
                </div>
              </div>
            </motion.div>

            {/* Text Content */}
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Join 10,000+ Businesses</h3>
              <p className="text-primary-100 text-sm leading-relaxed max-w-sm mx-auto">
                Create custom surveys, generate QR codes, and start gathering valuable insights in less than 5 minutes.
              </p>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-8">
                <div className="w-2 h-2 bg-white rounded-full opacity-40"></div>
                <div className="w-2 h-2 bg-white rounded-full opacity-100"></div>
                <div className="w-2 h-2 bg-white rounded-full opacity-40"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
