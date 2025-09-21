import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'customer';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredRole,
  fallbackPath 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />;
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    // Default fallback for role mismatch
    return <Navigate to={user?.role === 'admin' ? '/overview' : '/'} replace />;
  }

  // If user is authenticated but shouldn't access this route (e.g., auth page)
  if (!requireAuth && isAuthenticated && fallbackPath) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}