import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../../services/auth';
import { supabase } from '../../services/supabase';

const AdminRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setRedirectTo('/admin/login');
          setLoading(false);
          return;
        }

        // Check if user is admin
        const admin = await isAdmin();
        if (!admin) {
          setRedirectTo('/admin/login?error=unauthorized');
          setLoading(false);
          return;
        }

        // User is authenticated and is admin, redirect to dashboard
        setRedirectTo('/admin/dashboard');
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setRedirectTo('/admin/login');
        setLoading(false);
      }
    };

    checkAuth();
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

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return null;
};

export default AdminRedirect;

