import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CategoryManagement from './pages/CategoryManagement';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {user && <Layout />}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : <Register />
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute>
              <TicketDetail />
            </ProtectedRoute>
          } />
          <Route path="/create-ticket" element={
            <ProtectedRoute>
              <CreateTicket />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CategoryManagement />
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={
            <Navigate to={user ? "/dashboard" : "/login"} replace />
          } />
          <Route path="*" element={
            <Navigate to={user ? "/dashboard" : "/login"} replace />
          } />
        </Routes>
      </Box>
    </Box>
  );
};

// App Component with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 