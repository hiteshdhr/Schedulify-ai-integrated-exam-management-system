import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading spinner or a blank page while auth state is being checked
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 1. Check if user is logged in
  if (!user) {
    // Redirect them to the /auth/login page, but save the location they were
    // trying to go to so we can send them back after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Check if the user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have permission
    // Redirect them to the dashboard
    return <Navigate to="/app/dashboard" replace />;
  }

  // 3. User is logged in and has the correct role (or no specific role is required)
  return <Outlet />;
};

export default ProtectedRoute;
