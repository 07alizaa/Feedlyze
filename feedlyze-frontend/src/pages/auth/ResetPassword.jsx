import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Lock, ArrowLeft, CheckCircle, KeyRound, Shield, Eye, EyeOff } from 'lucide-react';
import api from '../../config/api';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const schema = yup.object({
  password: yup
    .string()
    .required('New password is required')
    .min(8, 'Must be at least 8 characters')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/\d/, 'Must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
}).required();

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setIsSuccess(true);
      toast.success('Password has been reset!');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to reset password. The link may have expired.');
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
                <h2 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-3">Password Reset Successful!</h2>
                <p className="text-dark-500 mb-8">
                  Your password has been changed successfully. You can now log in with your new password.
                </p>
                <Link to="/login">
                  <Button fullWidth className="py-3.5 text-base font-medium rounded-xl">
                    Sign in to Your Account
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-success-600 to-success-800 p-8 lg:p-12 xl:p-16 flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full"></div>
              </div>
              <div className="relative z-10 max-w-lg mx-auto text-center">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl xl:text-3xl font-bold text-white mb-4">
                  All Set!
                </h2>
                <p className="text-success-100 leading-relaxed">
                  Your account is now secured with your new password. Remember to keep it safe and don't share it with anyone.
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
        <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px]">

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
                <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-3">Create New Password</h1>
                <p className="text-dark-500">
                  Your new password must be different from previously used passwords.
                </p>
              </div>

              {!token && (
                <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-xl">
                  <p className="text-warning-700 text-sm">
                    No reset token found. Please use the link from your email or request a new password reset.
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-700">New Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className={`w-full px-4 py-3 pr-12 bg-white border ${errors.password ? 'border-danger-500' : 'border-light-300'} rounded-xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-dark-400 hover:text-dark-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-danger-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-3 pr-12 bg-white border ${errors.confirmPassword ? 'border-danger-500' : 'border-light-300'} rounded-xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-dark-400 hover:text-dark-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-danger-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-light-50 rounded-xl">
                  <p className="text-sm font-medium text-dark-700 mb-2">Password must contain:</p>
                  <ul className="text-sm text-dark-500 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-dark-400"></div>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-dark-400"></div>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-dark-400"></div>
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-dark-400"></div>
                      One number
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!token}
                  className="w-full py-3.5 text-base font-medium rounded-xl"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
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
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Value Proposition */}
              <div className="text-white text-center mb-8">
                <h2 className="text-2xl xl:text-3xl font-bold mb-4">
                  Create a Strong Password
                </h2>
                <p className="text-primary-100 leading-relaxed">
                  A strong password helps protect your account and your customers' feedback data.
                </p>
              </div>

              {/* Tips */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Tips
                  </h4>
                  <ul className="text-primary-100 text-sm space-y-2">
                    <li>• Use a unique password for each account</li>
                    <li>• Avoid using personal information</li>
                    <li>• Consider using a password manager</li>
                    <li>• Never share your password with anyone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
