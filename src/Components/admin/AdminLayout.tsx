import { useEffect, useState } from 'react';
import {
  FaBars, FaBell, FaBriefcase, FaCalendarAlt, FaChartLine,
  FaChevronLeft, FaChevronRight, FaCog, FaEnvelope, FaFileAlt,
  FaGlobe, FaGraduationCap, FaHandshake, FaHome, FaImages,
  FaInfoCircle, FaLink, FaMapMarkerAlt, FaNewspaper, FaQrcode,
  FaSearch, FaSignOutAlt, FaTicketAlt, FaTimes, FaUser, FaUserShield, FaUsers
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAdmin, isCommissionSeller, isMasterclassManager, isMasterclassSales, isSponsorshipManager, isAccountant } from '../../services/auth';
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
  const [isSales, setIsSales] = useState(false);
  const [isAccountantUser, setIsAccountantUser] = useState(false);
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
    const sales = await isMasterclassSales();
    const accountant = await isAccountant();
    setIsAdminUser(admin);
    setIsManager(manager);
    setIsMasterclass(masterclass);
    setIsSales(sales);
    setIsAccountantUser(accountant);
    if (!admin && !seller && !manager && !masterclass && !sales && !accountant) {
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
      label: 'Masterclass',
      emoji: '🎓',
      items: [
        { icon: FaChartLine, label: 'Analytics Dashboard', path: '/admin/masterclass-dashboard', color: 'from-indigo-600 to-purple-600' },
        { icon: FaGraduationCap, label: 'Direct Reservations', path: '/admin/masterclass-reservations', color: 'from-indigo-500 to-blue-500' },
        { icon: FaLink, label: 'Referral Students', path: '/admin/masterclass-referrals', color: 'from-violet-500 to-purple-600' },
        { icon: FaUsers, label: 'Sales Team', path: '/admin/masterclass-sales-team', color: 'from-indigo-400 to-cyan-500' },
      ],
    },
    {
      label: 'Events & Tickets',
      emoji: '🎟️',
      items: [
        { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', color: 'from-blue-500 to-indigo-500', adminOnly: true },
        { icon: FaQrcode, label: 'Verify Tickets', path: '/admin/verify', color: 'from-cyan-500 to-blue-500', adminOnly: true },
        { icon: FaTicketAlt, label: 'Commission Sellers', path: '/admin/commission-sellers', color: 'from-orange-500 to-rose-500', adminOnly: true },
        { icon: FaGlobe, label: 'Expo Applications', path: '/admin/expo-applications', color: 'from-amber-400 to-orange-500', adminOnly: true },
      ],
    },
    {
      label: 'Content',
      emoji: '📝',
      items: [
        { icon: FaHome, label: 'Home Content', path: '/admin/home', color: 'from-amber-400 to-orange-500', adminOnly: true },
        { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', color: 'from-indigo-500 to-purple-500', adminOnly: true },
        { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', color: 'from-rose-500 to-orange-500', adminOnly: true },
        { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', color: 'from-emerald-500 to-teal-500', adminOnly: true },
      ],
    },
    {
      label: 'Media & Settings',
      emoji: '⚙️',
      items: [
        { icon: FaImages, label: 'Gallery', path: '/admin/gallery', color: 'from-pink-500 to-rose-500', adminOnly: true },
        { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', color: 'from-purple-500 to-pink-500', adminOnly: true },
        { icon: FaUserShield, label: 'Admins', path: '/admin/admins', color: 'from-indigo-500 to-purple-600', adminOnly: true },
        { icon: FaCog, label: 'Site Settings', path: '/admin/settings', color: 'from-slate-500 to-gray-600', adminOnly: true },
      ],
    },
    {
      label: 'Operations & Finance',
      emoji: '💼',
      items: [
        { icon: FaHandshake, label: 'Unity CRM', path: '/admin/yenege-unity', color: 'from-amber-500 to-[#FFD447]', adminOnly: true },
        { icon: FaBriefcase, label: 'Job Applications', path: '/admin/applications', color: 'from-teal-500 to-emerald-500', adminOnly: true },
        { icon: FaFileAlt, label: 'Event Briefs', path: '/admin/feasibility-briefs', color: 'from-indigo-600 to-blue-700', adminOnly: true },
        { icon: FaChartLine, label: 'Accounting', path: '/admin/accounting', color: 'from-emerald-500 to-teal-600' },
      ],
    },
  ];

  const filteredSections = menuSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (isAccountantUser && !isAdminUser) return item.path === '/admin/accounting';
        if (isSales && !isAdminUser) return item.path === '/admin/masterclass-reservations';
        if (isMasterclass && !isAdminUser) return item.path.includes('masterclass') && item.path !== '/admin/masterclass-dashboard';
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
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative font-sans ${
          active
            ? 'bg-gradient-to-r from-[#1C2951] to-[#2b3a67] text-white shadow-lg shadow-[#1C2951]/20 ring-1 ring-white/10'
            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          active
            ? `bg-gradient-to-br ${item.color} shadow-md`
            : 'bg-slate-100 group-hover:bg-white group-hover:shadow-sm'
        }`}>
          <Icon size={14} className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'} />
        </div>
        {!collapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden">
            <span className="font-bold text-xs tracking-tight truncate">{item.label}</span>
            {active
              ? <div className="w-1.5 h-1.5 rounded-full bg-[#FFD447] shadow-[0_0_8px_#FFD447] flex-shrink-0" />
              : <FaChevronRight size={9} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-slate-300 flex-shrink-0" />
            }
          </div>
        )}
        {collapsed && (
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
          </div>
        )}
      </Link>
    );
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="w-12 h-12 border-4 border-[#FFD447] border-t-[#FF6F5E] rounded-full animate-spin mx-auto mb-4 shadow-lg shadow-[#FFD447]/20"></div>
          <p className="text-[#1C2951] font-black text-sm tracking-tight">Verifying Portal Access...</p>
        </div>
      </div>
    );
  }

  const roleLabel = isAdminUser ? 'Super Admin' : isManager ? 'Partnership Dept' : isMasterclass ? 'MC Manager' : isSales ? 'MC Sales' : isAccountantUser ? 'Accountant' : 'Staff';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-[#FFD447] selection:text-[#1C2951]">

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-[70px]'} bg-white border-r border-slate-200/70 fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out hidden lg:flex flex-col overflow-hidden shadow-xl shadow-slate-200/50`}>

        {/* Logo */}
        <div className={`h-16 flex items-center flex-shrink-0 border-b border-slate-100 px-4 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD447] via-[#FF9F43] to-[#FF6F5E] flex items-center justify-center shadow-md shadow-[#FF6F5E]/20 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                <FaHome className="text-white" size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#1C2951] tracking-tight leading-none">YENEGE</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Admin Portal</p>
              </div>
            </Link>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD447] via-[#FF9F43] to-[#FF6F5E] flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-200">
              <FaHome className="text-white" size={15} />
            </button>
          )}
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-200 flex-shrink-0">
              <FaChevronLeft size={12} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          {/* Dashboard */}
          {((!isMasterclass && !isSales && !isAccountantUser) || isAdminUser) && (
            <div className="mb-2">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive('/admin/dashboard')
                    ? 'bg-gradient-to-r from-[#1C2951] to-[#2b3a67] text-white shadow-lg shadow-[#1C2951]/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive('/admin/dashboard') ? 'bg-white/15' : 'bg-slate-100 group-hover:bg-white group-hover:shadow-sm'}`}>
                  <FaChartLine size={14} className={isActive('/admin/dashboard') ? 'text-white' : 'text-slate-500'} />
                </div>
                {sidebarOpen && <span className="font-bold text-xs">Overview Dashboard</span>}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    Overview Dashboard
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                  </div>
                )}
              </Link>
            </div>
          )}

          {/* Grouped Sections */}
          {filteredSections.map((section, idx) => (
            <div key={section.label} className={idx > 0 ? 'pt-2' : ''}>
              {sidebarOpen ? (
                <div className="px-2 py-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <span className="text-[11px]">{section.emoji}</span>
                    <span>{section.label}</span>
                  </span>
                </div>
              ) : (
                <div className="h-px bg-slate-100 mx-1 mb-2" />
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
        <div className="p-2.5 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          {sidebarOpen ? (
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C2951] to-slate-800 flex items-center justify-center text-white font-black text-xs shadow-md">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{roleLabel}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black bg-rose-50 text-rose-600 hover:bg-rose-100/80 border border-rose-100 transition-all duration-200">
                <FaSignOutAlt size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C2951] to-slate-800 flex items-center justify-center text-white font-black text-xs shadow-md">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <button onClick={handleLogout} title="Sign Out" className="w-9 h-9 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-colors duration-200">
                <FaSignOutAlt size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[70px]'} transition-all duration-300`}>

        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 h-16 flex items-center shadow-sm">
          <div className="w-full px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex-shrink-0">
                  <FaBars size={16} />
                </button>
                <div className="hidden sm:flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2 max-w-sm w-full focus-within:ring-2 focus-within:ring-[#FFD447]/50 focus-within:bg-white transition-all duration-200">
                  <FaSearch className="text-slate-400 flex-shrink-0" size={13} />
                  <input type="text" placeholder="Search Portal (events, leads, settings)..." className="bg-transparent border-none focus:outline-none text-xs ml-2.5 w-full font-semibold text-slate-800 placeholder-slate-400" />
                  <span className="bg-white text-[9px] font-black text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm ml-2 flex-shrink-0">⌘K</span>
                </div>
                <h1 className="lg:hidden text-base font-black text-[#1C2951] truncate">{title || 'Admin Portal'}</h1>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors duration-200 border border-transparent hover:border-slate-200">
                  <FaBell size={16} />
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6F5E] ring-2 ring-white" />
                </button>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-black text-slate-800 truncate max-w-[120px]">{user?.email?.split('@')[0] || 'Admin'}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C2951] to-slate-800 flex items-center justify-center text-white font-black text-xs shadow-md border border-slate-700 cursor-pointer">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C2951] tracking-tight">{title || 'Portal Overview'}</h1>
            <div className="h-1 w-12 bg-gradient-to-r from-[#FFD447] via-[#FF9F43] to-[#FF6F5E] rounded-full mt-2" />
          </div>
          {children}
        </main>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────────── */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)} />
        <nav className={`absolute inset-y-0 left-0 w-[84%] max-w-sm bg-white transition-transform duration-300 ease-out flex flex-col shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center shadow-md">
                <FaHome className="text-white" size={15} />
              </div>
              <div>
                <p className="text-sm font-black text-[#1C2951]">YENEGE</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Portal</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <FaTimes size={16} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {((!isMasterclass && !isSales && !isAccountantUser) || isAdminUser) && (
              <div className="mb-2">
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive('/admin/dashboard') ? 'bg-gradient-to-r from-[#1C2951] to-[#2b3a67] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive('/admin/dashboard') ? 'bg-white/15' : 'bg-slate-100'}`}>
                    <FaChartLine size={14} className={isActive('/admin/dashboard') ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <span className="font-bold text-xs">Overview Dashboard</span>
                </Link>
              </div>
            )}

            {filteredSections.map((section, idx) => (
              <div key={section.label} className={idx > 0 ? 'pt-2' : ''}>
                <div className="px-2 py-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
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

          {/* User Footer */}
          <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50">
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C2951] to-slate-800 flex items-center justify-center text-white font-black text-sm shadow-md">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{roleLabel}</p>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-rose-50 text-rose-600 font-black text-xs border border-rose-100 shadow-sm active:scale-95 transition-all duration-200">
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

