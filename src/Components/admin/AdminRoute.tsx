import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isAdmin, isCommissionSeller, isSponsorshipRepresentative } from '../../services/auth';
import { supabase } from '../../services/supabase';

/**
 * AdminRoute - A wrapper component that protects admin routes
 * Only allows access to users with admin role (not commission sellers)
 */
const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isRep, setIsRep] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthorized(false);
          setIsSeller(false);
          setIsRep(false);
          setLoading(false);
          return;
        }

        // Check if user is admin (not just has admin access)
        const admin = await isAdmin();
        const seller = await isCommissionSeller();
        const rep = await isSponsorshipRepresentative();
        
        setIsSeller(seller && !admin);
        setIsRep(rep && !admin);
        
        // Block commission sellers from accessing admin routes
        // Show them access denied page instead
        if (!admin) {
          if (seller || rep) {
            // Seller or Rep trying to access admin route - show access denied
            setIsAuthorized(false);
            setLoading(false);
            return;
          }
          // Not admin and not authorized roles - unauthorized
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
        setIsRep(false);
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
    if (isSeller) {
      return <AccessDeniedMessage title="Access Denied" message="This area is restricted to administrators." dashboardPath="/admin/seller-dashboard" dashboardLabel="Go to Seller Dashboard" />;
    }
    if (isRep) {
      return <AccessDeniedMessage title="Access Denied" message="This area is restricted to administrators." dashboardPath="/admin/representative-dashboard" dashboardLabel="Go to Representative Dashboard" />;
    }
    return <Navigate to="/admin/login?error=unauthorized" replace />;
  }

  return <Outlet />;
};

/**
 * Generic Access Denied message component
 */
const AccessDeniedMessage = ({ title, message, dashboardPath, dashboardLabel }: { title: string, message: string, dashboardPath: string, dashboardLabel: string }) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate(dashboardPath, { replace: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center border border-gray-100">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-red-50 mb-6 group hover:scale-110 transition-transform duration-500">
            <FaExclamationTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-[#1C2951] mb-2 tracking-tight">{title}</h1>
          <p className="text-gray-500 mb-2 font-medium">{message}</p>
          <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             Protocol Restricted
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoToDashboard}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#1C2951] text-white rounded-2xl hover:bg-[#FF6F5E] transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1C2951]/20 hover:shadow-[#FF6F5E]/30"
          >
            <FaHome />
            {dashboardLabel}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 border border-gray-100 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all font-black text-xs uppercase tracking-widest"
          >
            <FaSignOutAlt />
            Terminate Protocol
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRoute;

