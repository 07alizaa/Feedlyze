import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, CheckCircle, KeyRound, Shield } from 'lucide-react';
import api from '../../config/api';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
}).required();

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsSuccess(true);
      toast.success('Reset link sent!');
    } catch (_error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-light-50 to-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
            {/* Left Side - Success Message */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-3">Check your email</h2>
                <p className="text-dark-500 mb-8">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                <Link to="/login">
                  <Button fullWidth className="py-3.5 text-base font-medium rounded-xl">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 xl:p-16 flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"></div>
              </div>
              <div className="relative z-10 max-w-lg mx-auto text-center">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl xl:text-3xl font-bold text-white mb-4">
                  Email Sent Successfully
                </h2>
                <p className="text-primary-100 leading-relaxed">
                  A password reset link has been sent to your email. The link will expire in 1 hour for security reasons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-50 to-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">

          {/* Left Side - Form */}
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
                Remember password?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto">
              <Link to="/login" className="inline-flex items-center text-dark-500 hover:text-dark-800 mb-6 transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>

              <div className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-3">Forgot Password?</h1>
                <p className="text-dark-500">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-700">Email Address</label>
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

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full py-3.5 text-base font-medium rounded-xl"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 sm:mt-12 pt-6 border-t border-light-300 text-center">
                <p className="text-sm text-dark-500">
                  Need help?{' '}
                  <a href="mailto:support@feedlyze.com" className="text-primary-600 hover:underline">Contact Support</a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Branding */}
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
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Value Proposition */}
              <div className="text-white text-center mb-8">
                <h2 className="text-2xl xl:text-3xl font-bold mb-4">
                  Secure Password Recovery
                </h2>
                <p className="text-primary-100 leading-relaxed">
                  We take your account security seriously. Our password reset process is secure and encrypted.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Enter Your Email</h4>
                    <p className="text-primary-100 text-sm">We'll verify your account exists</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Check Your Inbox</h4>
                    <p className="text-primary-100 text-sm">Click the secure reset link we send</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Create New Password</h4>
                    <p className="text-primary-100 text-sm">Set a strong, unique password</p>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-white flex-shrink-0" />
                  <p className="text-white text-sm">
                    Reset links expire after 1 hour for your security. Never share your reset link with anyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
