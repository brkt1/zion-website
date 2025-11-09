import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isAdmin, isCommissionSeller } from '../../services/auth';
import { supabase } from '../../services/supabase';

/**
 * AdminRoute - A wrapper component that protects admin routes
 * Only allows access to users with admin role (not commission sellers)
 */
const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthorized(false);
          setIsSeller(false);
          setLoading(false);
          return;
        }

        // Check if user is admin (not just has admin access)
        const admin = await isAdmin();
        const seller = await isCommissionSeller();
        
        setIsSeller(seller && !admin);
        
        // Block commission sellers from accessing admin routes
        // Show them access denied page instead
        if (!admin) {
          if (seller) {
            // Commission seller trying to access admin route - show access denied
            setIsAuthorized(false);
            setLoading(false);
            return;
          }
          // Not admin and not seller - unauthorized
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setIsAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error('Admin auth check error:', error);
        setIsAuthorized(false);
        setIsSeller(false);
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
    // If user is a commission seller, show access denied page
    // Otherwise redirect to login
    if (isSeller) {
      return <AccessDeniedForSellers />;
    }
    return <Navigate to="/admin/login?error=unauthorized" replace />;
  }

  return <Outlet />;
};

/**
 * Access Denied component for commission sellers trying to access admin pages
 */
const AccessDeniedForSellers = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/admin/seller-dashboard', { replace: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <FaExclamationTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-1">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            This area is restricted to administrators only.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium"
          >
            <FaHome />
            Go to My Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRoute;

