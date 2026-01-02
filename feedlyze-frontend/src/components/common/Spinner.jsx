// src/components/common/Spinner.jsx
import { cn } from '../../utils/helpers';

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <svg
      className={cn('animate-spin text-primary-500', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Full page loading spinner
export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-light-50">
    <div className="text-center">
      <Spinner size="xl" />
      <p className="mt-4 text-dark-500">Loading...</p>
    </div>
  </div>
);

// Overlay spinner for forms/cards
export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-2 text-sm text-dark-500">{message}</p>
    </div>
  </div>
);

export default Spinner;
