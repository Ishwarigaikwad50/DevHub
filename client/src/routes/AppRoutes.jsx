import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ServiceCatalog from '../pages/ServiceCatalog';
import ServiceDetail from '../pages/ServiceDetail';
import DependencyGraph from '../pages/DependencyGraph';
import ApiCatalog from '../pages/ApiCatalog';
import Teams from '../pages/Teams';
import TeamDetail from '../pages/TeamDetail';
import Environments from '../pages/Environments';
import Deployments from '../pages/Deployments';
import HealthMonitoring from '../pages/HealthMonitoring';
import AuditLogs from '../pages/AuditLogs';
import Users from '../pages/Users';
import NotFound from '../pages/NotFound';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner text="Restoring developer session..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Only Guard
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* Public Login */}
      <Route
        path="/login"
        element={!loading && user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Authenticated Workspace */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="services" element={<ServiceCatalog />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="dependencies" element={<DependencyGraph />} />
        <Route path="apis" element={<ApiCatalog />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:id" element={<TeamDetail />} />
        <Route path="environments" element={<Environments />} />
        <Route path="deployments" element={<Deployments />} />
        <Route path="health" element={<HealthMonitoring />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
