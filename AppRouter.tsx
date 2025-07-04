import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { LoginForm } from '../auth/LoginForm';
import { Header } from '../layout/Header';
import { WaiterDashboard } from '../dashboard/WaiterDashboard';
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { ProfilePage } from '../profile/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400 text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Catch all other routes and redirect to login when not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // User is authenticated, show main app with proper routing
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="page-transition">
        <Routes>
          {/* Root route - redirect to dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* Dashboard route - role-based rendering */}
          <Route 
            path="/dashboard" 
            element={user.role === 'admin' ? <AdminDashboard /> : <WaiterDashboard />} 
          />
          
          {/* Profile route - accessible to all authenticated users */}
          <Route 
            path="/profile" 
            element={<ProfilePage />} 
          />
          
          {/* Legacy routes for compatibility */}
          <Route 
            path="/admin" 
            element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/waiter" 
            element={user.role === 'waiter' ? <WaiterDashboard /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Login route - redirect authenticated users to dashboard */}
          <Route 
            path="/login" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* 404 page - only for truly unmatched routes */}
          <Route path="/404" element={<NotFoundPage />} />
          
          {/* Catch-all route - redirect to 404 only for invalid paths */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};