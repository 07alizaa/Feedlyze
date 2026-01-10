import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
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
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Check your email</h2>
          <p className="text-dark-500 mb-8">
            We've sent a password reset link to your email address.
          </p>
          <Link to="/login">
            <Button fullWidth size="lg">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <Link to="/login" className="inline-flex items-center text-dark-500 hover:text-dark-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Forgot Password?</h2>
          <p className="text-dark-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-dark-700 ml-1">Email Address</label>
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

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isLoading}
            className="bg-primary-500 hover:bg-primary-600 shadow-xl shadow-primary-500/25 py-4 text-base rounded-2xl"
          >
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
