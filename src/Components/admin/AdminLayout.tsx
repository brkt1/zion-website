import { useEffect, useState } from 'react';
import {
    FaBars, FaBell, FaBriefcase, FaCalendarAlt, FaChartLine,
    FaChevronLeft, FaChevronRight, FaCog, FaEnvelope, FaFileAlt,
    FaGlobe, FaGraduationCap, FaHandshake, FaHome, FaImages,
    FaInfoCircle, FaMapMarkerAlt, FaNewspaper, FaQrcode,
    FaSearch, FaSignOutAlt, FaTicketAlt, FaTimes, FaUser, FaUsers
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAdmin, isCommissionSeller, isMasterclassManager, isSponsorshipManager } from '../../services/auth';
import { supabase } from '../../services/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  color: string;
  adminOnly?: boolean;
}

interface MenuSection {
  label: string;
  emoji: string;
  items: MenuItem[];
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isMasterclass, setIsMasterclass] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate('/admin/login'); }
      else { setUser(session.user); checkAdminStatus(session.user.id); }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    const admin = await isAdmin();
    const manager = await isSponsorshipManager();
    const seller = await isCommissionSeller();
    const masterclass = await isMasterclassManager();
    setIsAdminUser(admin);
    setIsManager(manager);
    setIsMasterclass(masterclass);
    if (!admin && !seller && !manager && !masterclass) {
      await supabase.auth.signOut();
      navigate('/admin/login?error=unauthorized');
      return;
    }
    setCheckingAuth(false);
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/admin/login'); setCheckingAuth(false); return; }
    setUser(session.user);
    await checkAdminStatus(session.user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const menuSections: MenuSection[] = [
    {
      label: 'Ticketing',
      emoji: '🎟️',
      items: [
        { icon: FaQrcode, label: 'Verify Tickets', path: '/admin/verify', color: 'from-cyan-500 to-blue-500', adminOnly: true },
        { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', color: 'from-blue-500 to-indigo-500', adminOnly: true },
      ],
    },
    {
      label: 'Applications',
      emoji: '📋',
      items: [
        { icon: FaGlobe, label: 'Expo Applications', path: '/admin/expo-applications', color: 'from-orange-400 to-amber-500', adminOnly: true },
        { icon: FaFileAlt, label: 'Event Briefs', path: '/admin/feasibility-briefs', color: 'from-blue-600 to-indigo-700', adminOnly: true },
        { icon: FaBriefcase, label: 'Job Applications', path: '/admin/applications', color: 'from-teal-500 to-green-500', adminOnly: true },
      ],
    },
    {
      label: 'Team & Sales',
      emoji: '👥',
      items: [
        { icon: FaHandshake, label: 'Sponsorship Dept', path: '/admin/sponsorship-department', color: 'from-emerald-500 to-teal-600' },
        { icon: FaTicketAlt, label: 'Commission Sellers', path: '/admin/commission-sellers', color: 'from-orange-500 to-red-500', adminOnly: true },
        { icon: FaUsers, label: 'Ticket Scanners', path: '/admin/ticket-scanners', color: 'from-blue-400 to-cyan-500', adminOnly: true },
      ],
    },
    {
      label: 'Masterclass',
      emoji: '🎓',
      items: [
        { icon: FaChartLine, label: 'MC Dashboard', path: '/admin/masterclass-dashboard', color: 'from-indigo-600 to-blue-500' },
        { icon: FaGraduationCap, label: 'MC Reservations', path: '/admin/masterclass-reservations', color: 'from-indigo-400 to-purple-500' },
      ],
    },
    {
      label: 'Content',
      emoji: '📝',
      items: [
        { icon: FaHome, label: 'Home Content', path: '/admin/home', color: 'from-yellow-400 to-orange-500', adminOnly: true },
        { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', color: 'from-indigo-500 to-purple-500', adminOnly: true },
        { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', color: 'from-red-500 to-orange-500', adminOnly: true },
        { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', color: 'from-green-500 to-emerald-500', adminOnly: true },
        { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', color: 'from-purple-500 to-pink-500', adminOnly: true },
        { icon: FaImages, label: 'Gallery', path: '/admin/gallery', color: 'from-pink-500 to-rose-500', adminOnly: true },
      ],
    },
    {
      label: 'System',
      emoji: '⚙️',
      items: [
        { icon: FaCog, label: 'Site Settings', path: '/admin/settings', color: 'from-gray-500 to-slate-600', adminOnly: true },
      ],
    },
  ];

  const filteredSections = menuSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (isMasterclass && !isAdminUser) return item.path.includes('masterclass');
        if (item.adminOnly) return isAdminUser;
        return true;
      }),
    }))
    .filter(section => section.items.length > 0);

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ item, collapsed, onClick }: { item: MenuItem; collapsed: boolean; onClick?: () => void }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
          active
            ? 'bg-gradient-to-r from-[#1C2951] to-[#2d3d6b] text-white shadow-lg'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          active
            ? `bg-gradient-to-br ${item.color} shadow-md`
            : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
        }`}>
          <Icon size={14} className={active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'} />
        </div>
        {!collapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden">
            <span className="font-semibold text-sm truncate">{item.label}</span>
            {active
              ? <div className="w-1.5 h-1.5 rounded-full bg-[#FFD447] shadow-[0_0_6px_#FFD447] flex-shrink-0" />
              : <FaChevronRight size={9} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-gray-300 flex-shrink-0" />
            }
          </div>
        )}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
          </div>
        )}
      </Link>
    );
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#FFD447] border-t-[#FF6F5E] rounded-full animate-spin mx-auto mb-4 shadow-lg shadow-[#FFD447]/20"></div>
          <p className="text-[#1C2951] font-bold text-sm tracking-tight">Authenticating...</p>
        </div>
      </div>
    );
  }

  const roleLabel = isAdminUser ? 'Super Admin' : isManager ? 'Partnership Dept' : isMasterclass ? 'MC Manager' : 'Staff';

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans selection:bg-[#FFD447] selection:text-[#1C2951]">

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-[68px]'} bg-white border-r border-gray-100 fixed left-0 top-0 h-screen z-40 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hidden lg:flex flex-col overflow-hidden shadow-xl shadow-gray-200/40`}>

        {/* Logo */}
        <div className={`h-16 flex items-center flex-shrink-0 border-b border-gray-50 px-4 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-md shadow-[#FF6F5E]/25 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                <FaHome className="text-white" size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#1C2951] tracking-tight leading-none">YENEGE</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Admin Hub</p>
              </div>
            </Link>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-md shadow-[#FF6F5E]/25 hover:scale-105 transition-transform duration-200">
              <FaHome className="text-white" size={14} />
            </button>
          )}
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0">
              <FaChevronLeft size={12} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 scrollbar-hide space-y-0.5">
          {/* Dashboard */}
          <div className="mb-3">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive('/admin/dashboard')
                  ? 'bg-gradient-to-r from-[#1C2951] to-[#2d3d6b] text-white shadow-lg'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive('/admin/dashboard') ? 'bg-white/15' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'}`}>
                <FaChartLine size={14} className={isActive('/admin/dashboard') ? 'text-white' : 'text-gray-500'} />
              </div>
              {sidebarOpen && <span className="font-bold text-sm">Dashboard</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Dashboard
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </Link>
          </div>

          {/* Grouped Sections */}
          {filteredSections.map((section, idx) => (
            <div key={section.label} className={idx > 0 ? 'pt-2' : ''}>
              {sidebarOpen ? (
                <div className="px-2 py-1.5">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.18em] flex items-center gap-1.5">
                    <span className="text-[11px]">{section.emoji}</span>
                    <span>{section.label}</span>
                  </span>
                </div>
              ) : (
                <div className="h-px bg-gray-100 mx-1 mb-2" />
              )}
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavLink key={item.path} item={item} collapsed={!sidebarOpen} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-2.5 border-t border-gray-50 flex-shrink-0">
          {sidebarOpen ? (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
                    <FaUser className="text-white" size={14} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-gray-900 truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{roleLabel}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black bg-white text-red-500 hover:bg-red-50 border border-gray-100 shadow-sm transition-all duration-200">
                <FaSignOutAlt size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
                  <FaUser className="text-white" size={14} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200">
                <FaSignOutAlt size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[68px]'} transition-all duration-400`}>

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30 h-16 flex items-center">
          <div className="w-full px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100 shadow-sm flex-shrink-0">
                  <FaBars size={15} />
                </button>
                <div className="hidden sm:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2 max-w-xs w-full focus-within:ring-2 focus-within:ring-[#FFD447]/30 focus-within:bg-white focus-within:border-[#FFD447]/50 transition-all duration-200">
                  <FaSearch className="text-gray-400 flex-shrink-0" size={12} />
                  <input type="text" placeholder="Search anything..." className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm ml-2.5 w-full font-medium text-gray-700 placeholder-gray-400" />
                  <span className="bg-gray-200 text-[9px] font-black text-gray-500 px-1.5 py-0.5 rounded-md ml-2 border border-gray-300 cursor-default flex-shrink-0">⌘K</span>
                </div>
                <h1 className="lg:hidden text-base font-black text-[#1C2951] truncate">{title || 'Admin'}</h1>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <button className="relative p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors duration-200 border border-transparent hover:border-gray-100">
                  <FaBell size={16} />
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6F5E] border-2 border-white" />
                </button>
                <div className="h-7 w-px bg-gray-100 hidden sm:block" />
                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-black text-gray-900 truncate max-w-[100px]">{user?.email?.split('@')[0] || 'Admin'}</p>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200 text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                    <FaUser size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mb-6 hidden lg:block">
            <h1 className="text-3xl font-black text-[#1C2951] tracking-tight">{title || 'Dashboard'}</h1>
            <div className="h-1 w-10 bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] rounded-full mt-3" />
          </div>
          {children}
        </main>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────── */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-all duration-400 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-400 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)} />
        <nav className={`absolute inset-y-0 left-0 w-[82%] max-w-sm bg-white transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-md">
                <FaHome className="text-white" size={14} />
              </div>
              <div>
                <p className="text-sm font-black text-[#1C2951]">YENEGE</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Admin Hub</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
              <FaTimes size={15} />
            </button>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            {/* Dashboard */}
            <div className="mb-3">
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive('/admin/dashboard') ? 'bg-gradient-to-r from-[#1C2951] to-[#2d3d6b] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive('/admin/dashboard') ? 'bg-white/15' : 'bg-gray-100'}`}>
                  <FaChartLine size={14} className={isActive('/admin/dashboard') ? 'text-white' : 'text-gray-500'} />
                </div>
                <span className="font-bold text-sm">Dashboard</span>
              </Link>
            </div>

            {filteredSections.map((section, idx) => (
              <div key={section.label} className={idx > 0 ? 'pt-3' : ''}>
                <div className="px-2 py-1.5">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.18em] flex items-center gap-1.5">
                    <span className="text-[11px]">{section.emoji}</span>
                    <span>{section.label}</span>
                  </span>
                </div>
                <div className="space-y-0.5">
                  {section.items.map(item => (
                    <NavLink key={item.path} item={item} collapsed={false} onClick={() => setMobileMenuOpen(false)} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User */}
          <div className="p-4 border-t border-gray-50 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <FaUser className="text-white" size={16} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{roleLabel}</p>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-red-50 text-red-600 font-black text-sm border border-red-100 shadow-sm active:scale-95 transition-all duration-200">
              <FaSignOutAlt size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;
