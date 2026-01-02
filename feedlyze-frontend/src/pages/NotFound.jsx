// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-light-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-2xl font-semibold text-dark-900 mt-4">Page Not Found</h2>
        <p className="text-dark-500 mt-2 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Link to="/dashboard">
            <Button icon={Home}>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
