// src/utils/apiErrorHandler.js
import toast from 'react-hot-toast';

/**
 * API Error Types
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Determine error type from error object
 */
export const getErrorType = (error) => {
  // Network error (backend unreachable)
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;

  // 4xx client errors
  if (status === 401) return ERROR_TYPES.AUTHENTICATION;
  if (status === 403) return ERROR_TYPES.AUTHORIZATION;
  if (status === 404) return ERROR_TYPES.NOT_FOUND;
  if (status >= 400 && status < 500) return ERROR_TYPES.VALIDATION;

  // 5xx server errors
  if (status >= 500) return ERROR_TYPES.SERVER;

  return ERROR_TYPES.UNKNOWN;
};

/**
 * Get user-friendly error message based on error type and context
 */
export const getErrorMessage = (error, context = {}) => {
  const errorType = getErrorType(error);
  const responseMessage = error.response?.data?.error || error.response?.data?.message;

  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return context.customNetworkMessage || 
        'Unable to connect to the server. Please check your internet connection and try again.';

    case ERROR_TYPES.AUTHENTICATION:
      return responseMessage || 'Your session has expired. Please log in again.';

    case ERROR_TYPES.AUTHORIZATION:
      return responseMessage || 'You do not have permission to perform this action.';

    case ERROR_TYPES.NOT_FOUND:
      return responseMessage || context.notFoundMessage || 'The requested resource was not found.';

    case ERROR_TYPES.VALIDATION:
      // Return specific validation error from backend if available
      return responseMessage || 'Please check your input and try again.';

    case ERROR_TYPES.SERVER:
      return context.customServerMessage || 
        'A server error occurred. Our team has been notified. Please try again later.';

    case ERROR_TYPES.UNKNOWN:
    default:
      return responseMessage || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Handle API error with toast notification
 * @param {Error} error - The error object from axios
 * @param {Object} options - Configuration options
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {string} options.context - Context for custom messages
 * @param {Function} options.onError - Custom error handler callback
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    context = {},
    onError,
  } = options;

  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error, context);

  // Log error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      type: errorType,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      error,
    });
  }

  // Show toast notification
  if (showToast) {
    // Use different toast types based on error type
    if (errorType === ERROR_TYPES.NETWORK) {
      toast.error(errorMessage, { duration: 5000, icon: '🌐' });
    } else if (errorType === ERROR_TYPES.VALIDATION) {
      toast.error(errorMessage, { duration: 4000 });
    } else if (errorType === ERROR_TYPES.SERVER) {
      toast.error(errorMessage, { duration: 6000, icon: '⚠️' });
    } else {
      toast.error(errorMessage);
    }
  }

  // Execute custom error handler if provided
  if (onError && typeof onError === 'function') {
    onError(error, errorType, errorMessage);
  }

  // Return error details for programmatic handling
  return {
    type: errorType,
    message: errorMessage,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error,
  };
};

/**
 * Check if backend is reachable
 */
export const checkBackendHealth = async (apiInstance) => {
  try {
    // Try to hit a health endpoint or any public endpoint
    await apiInstance.get('/health', { timeout: 5000 });
    return { reachable: true };
  } catch (error) {
    return {
      reachable: false,
      error: getErrorMessage(error, {
        customNetworkMessage: 'Backend server is currently unreachable.',
      }),
    };
  }
};

/**
 * Retry failed request with exponential backoff
 */
export const retryRequest = async (requestFn, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onRetry,
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const errorType = getErrorType(error);

      // Don't retry on validation errors or authentication errors
      if (errorType === ERROR_TYPES.VALIDATION || 
          errorType === ERROR_TYPES.AUTHENTICATION ||
          errorType === ERROR_TYPES.AUTHORIZATION) {
        throw error;
      }

      // Don't retry if it's the last attempt
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export default {
  ERROR_TYPES,
  getErrorType,
  getErrorMessage,
  handleApiError,
  checkBackendHealth,
  retryRequest,
};
