import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Mail, Lock, BarChart2, PieChart, Users, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">

      {/* Main Split Card */}
      <div className="bg-white w-full max-w-[1400px] min-h-[800px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* Left Side - Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative bg-white">

          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/25">
                <span className="font-bold text-xl">F</span>
              </div>
            </Link>
            <div className="text-sm font-medium text-dark-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-dark-900 font-bold hover:underline ml-1">
                Register
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-dark-900 mb-3">Login to your account</h2>
              <p className="text-dark-500">Enter your details to login.</p>
            </div>

            {/* Social Login Buttons (Visual Only) */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button className="flex items-center justify-center py-2.5 border border-light-200 rounded-xl hover:bg-light-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
              </button>
              <button className="flex items-center justify-center py-2.5 border border-light-200 rounded-xl hover:bg-light-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.107-3.293 2.147-2.147 2.933-5.133 2.933-7.547 0-.747-.067-1.48-.187-2.24h-10.853z" /></svg>
              </button>
              <button className="flex items-center justify-center py-2.5 border border-light-200 rounded-xl hover:bg-light-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-8">
              <div className="border-t border-light-200 w-full"></div>
              <span className="bg-white px-4 text-sm text-dark-400 absolute">OR</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center text-dark-600 hover:text-dark-800 cursor-pointer transition-colors select-none">
                  <input type="checkbox" className="mr-2.5 w-4 h-4 rounded border-light-300 text-primary-500 focus:ring-primary-500" />
                  Keep me logged in
                </label>
                <a href="#" className="text-dark-900 underline font-semibold hover:text-primary-500 transition-colors">Forgot password?</a>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                className="bg-primary-500 hover:bg-primary-600 shadow-xl shadow-primary-500/25 py-4 text-base rounded-2xl mt-4"
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-12 flex justify-between items-center text-xs text-dark-400 font-medium">
            <div>© 2024 Feedlyze Inc.</div>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-dark-700">Privacy</span>
              <span className="cursor-pointer hover:text-dark-700">Terms</span>
            </div>
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

            {/* Floating Mockup Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl p-6 mb-12 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
            >
              {/* Mockup Header */}
              <div className="flex items-center justify-between mb-6 border-b border-light-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-900 rounded-full flex items-center justify-center text-white font-bold">FE</div>
                  <div>
                    <h3 className="font-bold text-dark-900 text-sm">Feedlyze Dashboard</h3>
                    <p className="text-xs text-dark-500">Team Insights</p>
                  </div>
                </div>
                <div className="bg-light-100 px-3 py-1 rounded-full text-xs font-medium text-dark-600">Pro Plan</div>
              </div>

              {/* Mockup Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-light-50 p-4 rounded-xl border border-light-100">
                  <div className="flex items-center gap-2 mb-2 text-dark-500">
                    <BarChart2 className="w-4 h-4" /> <span className="text-xs font-semibold">Sentiment</span>
                  </div>
                  <div className="text-2xl font-bold text-dark-900 mb-1">94%</div>
                  <div className="text-xs text-success-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> +12% vs last week
                  </div>
                </div>
                {/* Card 2 */}
                <div className="bg-light-50 p-4 rounded-xl border border-light-100">
                  <div className="flex items-center gap-2 mb-2 text-dark-500">
                    <Users className="w-4 h-4" /> <span className="text-xs font-semibold">Responses</span>
                  </div>
                  <div className="text-2xl font-bold text-dark-900 mb-1">1,248</div>
                  <div className="text-xs text-dark-400">Total this month</div>
                </div>
                {/* Card 3 (Long) */}
                <div className="col-span-2 bg-light-50 p-4 rounded-xl border border-light-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-dark-700">Recent Feedback</div>
                    <PieChart className="w-4 h-4 text-dark-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-light-200 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500 w-[75%]"></div>
                    </div>
                    <div className="h-2 w-full bg-light-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 w-[45%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text Content */}
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Turn Feedback into Growth</h3>
              <p className="text-primary-100 text-sm leading-relaxed max-w-sm mx-auto">
                Track your customer sentiment in real-time and manage requests with our AI-powered dashboard, ensuring a stress-free experience.
              </p>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-8">
                <div className="w-2 h-2 bg-white rounded-full opacity-100"></div>
                <div className="w-2 h-2 bg-white rounded-full opacity-40"></div>
                <div className="w-2 h-2 bg-white rounded-full opacity-40"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
