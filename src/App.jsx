import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Audit from './pages/Audit';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route
              path="medicines"
              element={
                <ProtectedRoute roles={['ADMIN', 'PHARMACIST']}>
                  <Medicines />
                </ProtectedRoute>
              }
            />
            
            <Route path="inventory" element={<Inventory />} />
            
            <Route
              path="reports"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="audit"
              element={
                <ProtectedRoute roles={['ADMIN', 'PHARMACIST']}>
                  <Audit />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;