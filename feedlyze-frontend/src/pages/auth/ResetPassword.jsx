import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../config/api';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const schema = yup.object({
  token: yup.string().required('Reset token is required'),
  password: yup.string().required('New password is required').min(6, 'Must be at least 6 characters').matches(/\d/, 'Must contain at least one number'),
}).required();

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token: data.token, password: data.password });
      setIsSuccess(true);
      toast.success('Password has been reset!');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Password Reset Successful</h2>
          <p className="text-dark-500 mb-8">You can now log in with your new password.</p>
          <Link to="/login">
            <Button fullWidth size="lg">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <Link to="/login" className="inline-flex items-center text-dark-500 hover:text-dark-800 mb-6 transition-colors">
          Back to Login
        </Link>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Reset Password</h2>
          <p className="text-dark-500">Enter your reset token and new password below.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-dark-700 ml-1">Reset Token</label>
            <input type="text" {...register('token')} className={`w-full px-4 py-3.5 bg-light-50 border ${errors.token ? 'border-danger-500' : 'border-light-200'} rounded-2xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200`} placeholder="Paste your reset token" />
            {errors.token && <p className="text-danger-500 text-xs ml-1">{errors.token.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-dark-700 ml-1">New Password</label>
            <input type="password" {...register('password')} className={`w-full px-4 py-3.5 bg-light-50 border ${errors.password ? 'border-danger-500' : 'border-light-200'} rounded-2xl text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200`} placeholder="Enter new password" />
            {errors.password && <p className="text-danger-500 text-xs ml-1">{errors.password.message}</p>}
          </div>
          <Button fullWidth size="lg" type="submit" disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
