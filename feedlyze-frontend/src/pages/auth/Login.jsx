import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, QrCode, Sparkles, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

// Validation Schema
const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-50 to-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
          
          {/* Left Side - Login Form */}
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
                New user?{' '}
                <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                  Register
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto">
              <div className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-3">Welcome back</h1>
                <p className="text-dark-500">Sign in to your Feedlyze account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  {errors.email && <p className="text-danger-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-dark-700">Password</label>
                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type="password"
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 bg-white border ${errors.password ? 'border-danger-500' : 'border-light-300'} rounded-xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                    />
                    <Lock className="absolute right-3 top-3.5 h-5 w-5 text-dark-400" />
                  </div>
                  {errors.password && <p className="text-danger-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-light-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-dark-600">
                    Remember me
                  </label>
                </div>

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full py-3.5 text-base font-medium rounded-xl"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-light-300"></div>
                <span className="mx-4 text-sm text-dark-500">Or continue with</span>
                <div className="flex-1 border-t border-light-300"></div>
              </div>

              {/* Google Login Only */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 border border-light-300 rounded-xl hover:bg-light-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-dark-700 font-medium">Continue with Google</span>
              </button>

              {/* Footer */}
              <div className="mt-8 sm:mt-12 pt-6 border-t border-light-300 text-center">
                <p className="text-sm text-dark-500">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
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
                  Digitize Your Feedback Collection
                </h2>
                <p className="text-primary-100 leading-relaxed">
                  Transform paper-based feedback into digital insights with QR codes and AI-assisted analysis.
                </p>
              </div>

              {/* How It Works Steps */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Create Digital Surveys</h4>
                    <p className="text-primary-100 text-sm">Replace paper forms with structured digital feedback</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Deploy QR Codes</h4>
                    <p className="text-primary-100 text-sm">Place printed codes where you need feedback</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Analyze Responses</h4>
                    <p className="text-primary-100 text-sm">View collected feedback in your centralized dashboard</p>
                  </div>
                </div>
              </div>

              {/* User Feedback */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white text-sm italic mb-3">
                  "Feedlyze helped us transition from paper feedback cards to digital collection, saving hours of manual data entry."
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full mr-3"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Restaurant Manager</p>
                    <p className="text-primary-200 text-xs">Local Business User</p>
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

export default Login;