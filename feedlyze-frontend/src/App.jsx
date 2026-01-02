// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout, ProtectedRoute } from './components/layout';

// Auth Pages
import { Login, Register } from './pages/auth';

// Dashboard Pages
import { Dashboard } from './pages/dashboard';

// Landing Page
import LandingPage from './pages/LandingPage';

// Other Pages
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Placeholder routes - will be implemented in later phases */}
              <Route path="/surveys" element={<ComingSoon title="Surveys" />} />
              <Route path="/surveys/create" element={<ComingSoon title="Create Survey" />} />
              <Route path="/surveys/:id" element={<ComingSoon title="Survey Details" />} />
              <Route path="/responses" element={<ComingSoon title="Responses" />} />
              <Route path="/analytics" element={<ComingSoon title="Analytics" />} />
              <Route path="/ai-assistant" element={<ComingSoon title="AI Assistant" />} />
              <Route path="/settings" element={<ComingSoon title="Settings" />} />
            </Route>
          </Route>

          {/* Public Survey Route (for QR code access) */}
          <Route path="/s/:shortCode" element={<ComingSoon title="Public Survey" />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Temporary placeholder component
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64">
    <h1 className="text-2xl font-bold text-dark-900 mb-2">{title}</h1>
    <p className="text-dark-500">Coming soon in the next phase...</p>
  </div>
);

export default App;
