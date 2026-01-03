// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout, ProtectedRoute } from './components/layout';

// Auth Pages
import { Login, Register } from './pages/auth';

// Dashboard Pages
import { Dashboard } from './pages/dashboard';

// Survey Pages
import { SurveysList, SurveyBuilder, PublicSurvey } from './pages/surveys';

// Response Pages
import { ResponsesList, ResponseDetail } from './pages/responses';

// Insights Pages
import { Insights } from './pages/analytics';

// Settings Pages
import { Settings } from './pages/settings';

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

              {/* Survey Routes */}
              <Route path="/surveys" element={<SurveysList />} />
              <Route path="/surveys/create" element={<SurveyBuilder />} />
              <Route path="/surveys/:id" element={<SurveyBuilder />} />
              <Route path="/surveys/:id/edit" element={<SurveyBuilder />} />

              {/* Response Routes */}
              <Route path="/responses" element={<ResponsesList />} />
              <Route path="/responses/:id" element={<ResponseDetail />} />

              {/* Insights Routes */}
              <Route path="/analytics" element={<Insights />} />

              {/* Settings Route */}
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Public Survey Route (for QR code access) */}
          <Route path="/s/:shortCode" element={<PublicSurvey />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
