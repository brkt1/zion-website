import { useEffect, useState } from 'react';
import {
    FaBars,
    FaCalendarAlt,
    FaChartLine,
    FaCog,
    FaEnvelope,
    FaHome,
    FaImages,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaNewspaper,
    FaQrcode,
    FaSignOutAlt,
    FaTicketAlt,
    FaTimes,
    FaUser
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAdmin, isCommissionSeller } from '../../services/auth';
import { supabase } from '../../services/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setUser(session.user);
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    const admin = await isAdmin();
    const seller = await isCommissionSeller();
    if (!admin && !seller) {
      // User is not an admin or commission seller, redirect to login
      await supabase.auth.signOut();
      navigate('/admin/login?error=unauthorized');
      return;
    }
    // If user is only a commission seller (not admin), redirect to commission sellers page
    // unless they're already on that page
    if (seller && !admin && location.pathname !== '/admin/commission-sellers') {
      navigate('/admin/commission-sellers');
      return;
    }
    setCheckingAuth(false);
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      setCheckingAuth(false);
      return;
    }
    
    setUser(session.user);
    await checkAdminStatus(session.user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: FaQrcode, label: 'Verify Tickets', path: '/admin/verify', color: 'text-cyan-600 bg-cyan-50' },
    { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', color: 'text-blue-600 bg-blue-50' },
    { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', color: 'text-green-600 bg-green-50' },
    { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', color: 'text-purple-600 bg-purple-50' },
    { icon: FaImages, label: 'Gallery', path: '/admin/gallery', color: 'text-pink-600 bg-pink-50' },
    { icon: FaHome, label: 'Home Content', path: '/admin/home', color: 'text-yellow-600 bg-yellow-50' },
    { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', color: 'text-indigo-600 bg-indigo-50' },
    { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', color: 'text-red-600 bg-red-50' },
    { icon: FaTicketAlt, label: 'Commission Sellers', path: '/admin/commission-sellers', color: 'text-orange-600 bg-orange-50' },
    { icon: FaCog, label: 'Site Settings', path: '/admin/settings', color: 'text-gray-600 bg-gray-50' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive('/admin/dashboard')
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaChartLine className="flex-shrink-0" size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </Link>
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="flex-shrink-0" size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaUser className="text-indigo-600" size={18} />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt size={16} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  <FaBars size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title || 'Admin'}</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.email?.split('@')[0] || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <FaUser className="text-gray-400" />
                  <span>{user?.email || ''}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col h-full">
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-xs text-gray-500">Dashboard</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaChartLine size={20} />
                    <span>Dashboard</span>
                  </Link>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-gray-200 p-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

