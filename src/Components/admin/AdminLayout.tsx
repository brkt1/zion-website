import { useEffect, useState } from 'react';
import {
    FaBars,
    FaBell,
    FaBriefcase,
    FaCalendarAlt,
    FaChartLine,
    FaChevronLeft,
    FaChevronRight,
    FaCog,
    FaEnvelope,
    FaGlobe,
    FaHome,
    FaImages,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaNewspaper,
    FaQrcode,
    FaSearch,
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
      await supabase.auth.signOut();
      navigate('/admin/login?error=unauthorized');
      return;
    }
    if (seller && !admin && location.pathname !== '/admin/seller-dashboard') {
      navigate('/admin/seller-dashboard');
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
    { icon: FaQrcode, label: 'Verify Tickets', path: '/admin/verify', color: 'from-cyan-500 to-blue-500' },
    { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', color: 'from-blue-500 to-indigo-500' },
    { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', color: 'from-green-500 to-emerald-500' },
    { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', color: 'from-purple-500 to-pink-500' },
    { icon: FaImages, label: 'Gallery', path: '/admin/gallery', color: 'from-pink-500 to-rose-500' },
    { icon: FaHome, label: 'Home Content', path: '/admin/home', color: 'from-yellow-400 to-orange-500' },
    { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', color: 'from-indigo-500 to-purple-500' },
    { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', color: 'from-red-500 to-orange-500' },
    { icon: FaTicketAlt, label: 'Commission Sellers', path: '/admin/commission-sellers', color: 'from-orange-500 to-red-500' },
    { icon: FaQrcode, label: 'Ticket Scanners', path: '/admin/ticket-scanners', color: 'from-blue-400 to-cyan-500' },
    { icon: FaBriefcase, label: 'Applications', path: '/admin/applications', color: 'from-teal-500 to-green-500' },
    { icon: FaGlobe, label: 'Expo Applications', path: '/admin/expo-applications', color: 'from-orange-400 to-amber-500' },
    { icon: FaCog, label: 'Site Settings', path: '/admin/settings', color: 'from-gray-500 to-slate-600' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFD447] border-t-[#FF6F5E] rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-[#FFD447]/20"></div>
          <p className="text-[#1C2951] font-bold tracking-tight">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans selection:bg-[#FFD447] selection:text-[#1C2951]">
      {/* Sidebar - Desktop */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } bg-white border-r border-gray-100 fixed left-0 top-0 h-screen z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hidden lg:block overflow-hidden shadow-2xl shadow-gray-200/50`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className={`h-24 flex items-center ${sidebarOpen ? 'px-8 justify-between' : 'px-0 justify-center'} transition-all duration-500`}>
            {sidebarOpen ? (
              <Link to="/admin/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-lg shadow-[#FF6F5E]/30 transform group-hover:rotate-12 transition-transform duration-300">
                  <FaHome className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-[#1C2951] tracking-tight text-shadow-sm">YENEGE</h1>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Admin Hub</p>
                </div>
              </Link>
            ) : (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-lg shadow-[#FF6F5E]/30 hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <FaHome className="text-white" size={20} />
              </button>
            )}
            
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[#FF6F5E] transition-all duration-300 shadow-sm border border-transparent hover:border-gray-100"
              >
                <FaChevronLeft size={14} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-hide">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive('/admin/dashboard')
                  ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl shadow-gray-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors duration-300 ${
                isActive('/admin/dashboard') ? 'bg-white/10' : 'bg-gray-100 group-hover:bg-white'
              }`}>
                <FaChartLine size={18} />
              </div>
              {sidebarOpen && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-semibold text-sm">Dashboard</span>
                  {isActive('/admin/dashboard') && <div className="w-1.5 h-1.5 rounded-full bg-[#FFD447] shadow-[0_0_8px_#FFD447]" />}
                </div>
              )}
            </Link>

            <div className={`mt-8 mb-4 ${sidebarOpen ? 'px-4' : 'px-0 text-center'}`}>
              <span className={`text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>Management</span>
              {!sidebarOpen && <div className="h-px bg-gray-100 mx-4" />}
            </div>
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    active
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl shadow-gray-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-500 ${
                    active 
                      ? `bg-gradient-to-br ${item.color} shadow-lg shadow-black/20` 
                      : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'
                  }`}>
                    <Icon size={18} className={active ? 'text-white' : ''} />
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="font-semibold text-sm truncate">{item.label}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-[#FFD447] shadow-[0_0_8px_#FFD447]" />}
                      {!active && (
                        <FaChevronRight size={10} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gray-300" />
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Summary */}
          <div className="p-4 mt-auto">
            <div className={`bg-gray-50 rounded-3xl p-4 transition-all duration-500 border border-gray-100 ${!sidebarOpen && 'flex flex-col items-center gap-4 px-0'}`}>
              <div className={`flex items-center gap-3 mb-4 ${!sidebarOpen && 'flex-col'}`}>
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <FaUser className="text-white" size={18} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate tracking-tight">
                      {user?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 truncate uppercase mt-0.5 tracking-wider">Super Admin</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition-all duration-300 ${
                  sidebarOpen 
                    ? 'w-full bg-white text-red-600 hover:bg-red-50 border border-gray-100 shadow-sm' 
                    : 'w-12 h-12 text-red-600 hover:bg-red-50'
                }`}
              >
                <FaSignOutAlt size={16} />
                {sidebarOpen && <span>Sign Out</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-24'} transition-all duration-500`}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 transition-all duration-500 h-20 md:h-24 flex items-center">
          <div className="w-full px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 shadow-sm flex-shrink-0 transition-all duration-300"
                >
                  <FaBars size={18} />
                </button>
                
                {/* Search Bar Placeholder */}
                <div className="hidden sm:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 max-w-md w-full focus-within:ring-2 focus-within:ring-[#FFD447]/20 focus-within:bg-white focus-within:border-[#FFD447] transition-all duration-300">
                  <FaSearch className="text-gray-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search for something..." 
                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-3 w-full font-bold text-gray-700"
                  />
                  <div className="bg-gray-200 text-[10px] font-black text-gray-500 px-1.5 py-0.5 rounded-md ml-2 border border-gray-300 shadow-sm cursor-default">⌘K</div>
                </div>

                <div className="lg:hidden truncate ml-2">
                   <h1 className="text-xl font-black text-[#1C2951] tracking-tight truncate">{title || 'Admin'}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                {/* Notification Bell */}
                <button className="relative p-3 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all duration-300 border border-transparent hover:border-gray-100">
                  <FaBell size={20} />
                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#FF6F5E] border-2 border-white shadow-sm" />
                </button>

                <div className="h-10 w-px bg-gray-100 hidden sm:block" />

                {/* Topbar User Info */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-black text-gray-900 leading-tight truncate max-w-[120px]">{user?.email?.split('@')[0] || 'Admin'}</p>
                    <p className="text-[10px] font-black text-[#FF6F5E] uppercase tracking-wider mt-0.5 flex items-center justify-end gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       Active
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100 text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-transparent hover:border-indigo-100">
                    <FaUser size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 relative">
          {/* Header Title for Desktop */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-4xl font-black text-[#1C2951] tracking-tight">{title || 'Dashboard'}</h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] rounded-full mt-4 shadow-sm" />
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Decorative background element */}
          <div className="fixed top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#FFD447]/5 to-[#FF6F5E]/5 rounded-full blur-[100px] pointer-events-none -z-10 translate-x-1/2" />
        </main>
      </div>

      {/* Mobile Sidebar - Drawer Style */}
      <div 
        className={`lg:hidden fixed inset-0 z-[60] transition-all duration-500 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setMobileMenuOpen(false)} 
        />
        
        {/* Sidebar Container */}
        <nav 
          className={`absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white transition-transform duration-500 transform ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Sidebar Header */}
          <div className="h-24 flex items-center justify-between px-8 border-b border-gray-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-lg shadow-[#FF6F5E]/30">
                <FaHome className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#1C2951] tracking-tight">YENEGE</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Admin Hub</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all duration-300"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 pt-6 scrollbar-hide">
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                isActive('/admin/dashboard')
                  ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl shadow-gray-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${isActive('/admin/dashboard') ? 'bg-white/10' : 'bg-gray-100'}`}>
                <FaChartLine size={20} />
              </div>
              <span className="font-black text-sm tracking-tight">Dashboard</span>
            </Link>

            <div className="pt-8 pb-3 px-5">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</span>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl shadow-gray-200'
                      : 'text-gray-500 hover:bg-gray-50 shadow-sm border border-transparent hover:border-gray-100'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-all duration-500 ${
                    active 
                      ? `bg-gradient-to-br ${item.color} shadow-lg shadow-black/20` 
                      : 'bg-gray-100'
                  }`}>
                    <Icon size={20} className={active ? 'text-white' : ''} />
                  </div>
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section Bottom */}
          <div className="p-6 border-t border-gray-50 flex-shrink-0">
            <div className="bg-gray-50 rounded-[32px] p-5 mb-4 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                  <FaUser className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate tracking-tight">{user?.email?.split('@')[0] || 'Admin'}</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1.5 uppercase">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                     Super Admin
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-[20px] bg-red-50 text-red-600 font-black text-sm transition-all duration-300 border border-red-100 shadow-sm active:scale-95"
            >
              <FaSignOutAlt size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;
