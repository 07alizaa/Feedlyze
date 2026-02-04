import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(error || 'Authentication failed. Please try again.');
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('No authentication token received.');
        return;
      }

      try {
        // Use the token to log the user in
        await loginWithToken(token);
        setStatus('success');
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (_err) {
        setStatus('error');
        setErrorMessage('Failed to complete authentication.');
      }
    };

    handleCallback();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Spinner size="lg" className="mx-auto mb-6" />
            <h2 className="text-xl font-bold text-dark-900 mb-2">Completing Sign In...</h2>
            <p className="text-dark-500">Please wait while we verify your Google account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2">Welcome!</h2>
            <p className="text-dark-500">Sign in successful. Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-danger-600" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2">Authentication Failed</h2>
            <p className="text-dark-500 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl"
              >
                Back to Login
              </Button>
              <button
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}
                className="w-full py-3 border border-light-300 rounded-xl hover:bg-light-50 transition-colors text-dark-700 font-medium"
              >
                Try Again with Google
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
