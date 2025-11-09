import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAdmin } from '../../services/auth';
import { supabase } from '../../services/supabase';

/**
 * AdminRoute - A wrapper component that protects admin routes
 * Only allows access to users with admin role (not commission sellers)
 */
const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // Check if user is admin (not just has admin access)
        const admin = await isAdmin();
        
        if (!admin) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setIsAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error('Admin auth check error:', error);
        setIsAuthorized(false);
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login?error=unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

