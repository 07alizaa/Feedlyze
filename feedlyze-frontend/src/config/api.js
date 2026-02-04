// src/config/api.js
import axios from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';

/**
 * Get API base URL from environment variables
 * Falls back to localhost for development if not set
 */
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!envUrl) {
    console.warn(
      '⚠️ VITE_API_BASE_URL is not set. Falling back to http://localhost:5000/api\n' +
      'Set VITE_API_BASE_URL in your .env file for proper configuration.'
    );
    return 'http://localhost:5000/api';
  }
  
  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Log API configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);
}

/**
 * Create axios instance with centralized configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: false,
});

/**
 * Request interceptor - add auth token and log requests
 */
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors globally
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      // Don't redirect if already on auth pages or public pages
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/survey/'];
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (!isPublicPath) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(currentPath);
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }
    }

    // Log error in development
    if (import.meta.env.DEV) {
      const status = error.response?.status || 'Network Error';
      const method = error.config?.method?.toUpperCase() || 'REQUEST';
      const url = error.config?.url || 'Unknown URL';
      console.error(`❌ ${status} ${method} ${url}`, error.response?.data || error.message);
    }

    // Don't handle error here - let individual requests handle it
    // This allows for custom error handling per request
    return Promise.reject(error);
  }
);

/**
 * Enhanced API methods with built-in error handling
 */
export const apiWithErrorHandling = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      if (config.handleError !== false) {
        handleApiError(error, config.errorOptions);
      }
      throw error;
    }
  },

  post: async (url, data, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      if (config.handleError !== false) {
        handleApiError(error, config.errorOptions);
      }
      throw error;
    }
  },

  put: async (url, data, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      if (config.handleError !== false) {
        handleApiError(error, config.errorOptions);
      }
      throw error;
    }
  },

  patch: async (url, data, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      if (config.handleError !== false) {
        handleApiError(error, config.errorOptions);
      }
      throw error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      if (config.handleError !== false) {
        handleApiError(error, config.errorOptions);
      }
      throw error;
    }
  },
};

/**
 * Check if API is reachable
 */
export const checkApiHealth = async () => {
  try {
    // Try to reach a public endpoint (survey endpoint is public)
    await api.get('/health', { timeout: 5000 });
    return { healthy: true, url: API_BASE_URL };
  } catch (error) {
    return {
      healthy: false,
      url: API_BASE_URL,
      error: error.message,
    };
  }
};

// Export the base API instance as default
export default api;

// Export API base URL for use in other parts of the app
export { API_BASE_URL };
