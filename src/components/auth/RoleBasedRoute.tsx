import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../utility/LoadingSpinner';
import AccessDenied from '../utility/AccessDenied';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/unauthorized',
  showAccessDenied = true
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-primary">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  const hasRequiredRole = allowedRoles.includes(user.role);

  // If user doesn't have the required role
  if (!hasRequiredRole) {
    if (showAccessDenied) {
      return <AccessDenied />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  // User has the required role and can access the route
  return <>{children}</>;
};

export default RoleBasedRoute;
