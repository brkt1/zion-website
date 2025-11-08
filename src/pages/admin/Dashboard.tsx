import { useEffect, useState } from 'react';
import {
  FaBan,
  FaBars,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaCog,
  FaDollarSign,
  FaEnvelope,
  FaHome,
  FaImages,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaNewspaper,
  FaPhone,
  FaQrcode,
  FaSignOutAlt,
  FaTicketAlt,
  FaTimes,
  FaTimesCircle,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReminderModal from '../../Components/admin/ReminderModal';
import { adminApi } from '../../services/adminApi';
import { isAdmin } from '../../services/auth';
import { supabase } from '../../services/supabase';
import { Ticket } from '../../types';

interface Stats {
  totalEvents: number;
  totalCategories: number;
  totalGalleryItems: number;
  totalDestinations: number;
  totalTickets: number;
  successfulTickets: number;
  pendingTickets: number;
  failedTickets: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalCategories: 0,
    totalGalleryItems: 0,
    totalDestinations: 0,
    totalTickets: 0,
    successfulTickets: 0,
    pendingTickets: 0,
    failedTickets: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    email: string;
    name?: string;
    phone?: string;
    ticketId?: string;
  } | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!checkingAuth) {
      loadStats();
      loadTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth, ticketFilter]);

  const checkAdminStatus = async (userId: string) => {
    const admin = await isAdmin();
    if (!admin) {
      // User is not an admin, redirect to login
      await supabase.auth.signOut();
      navigate('/admin/login?error=unauthorized');
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

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const [events, categories, gallery, destinations, allTickets] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('destinations').select('id', { count: 'exact', head: true }),
        adminApi.tickets.getAll(),
      ]);

      const totalTickets = allTickets?.length || 0;
      const successfulTickets = allTickets?.filter(t => t.status === 'success').length || 0;
      const pendingTickets = allTickets?.filter(t => t.status === 'pending').length || 0;
      const failedTickets = allTickets?.filter(t => t.status === 'failed').length || 0;
      
      const totalRevenue = allTickets
        ?.filter(t => t.status === 'success')
        .reduce((sum, t) => sum + (parseFloat(t.amount.toString()) * t.quantity), 0) || 0;

      setStats({
        totalEvents: events.count || 0,
        totalCategories: categories.count || 0,
        totalGalleryItems: gallery.count || 0,
        totalDestinations: destinations.count || 0,
        totalTickets,
        successfulTickets,
        pendingTickets,
        failedTickets,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      let data;
      if (ticketFilter === 'all') {
        data = await adminApi.tickets.getAll();
      } else {
        data = await adminApi.tickets.getByStatus(ticketFilter);
      }
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500" />;
      case 'cancelled':
        return <FaBan className="text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaDollarSign size={24} />
                </div>
                <span className="text-green-100 text-sm font-medium">Revenue</span>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-white/20 rounded w-24"></div>
              ) : (
                <div className="text-3xl font-bold mb-1">
                  {formatCurrency(stats.totalRevenue, 'ETB')}
                </div>
              )}
              <p className="text-green-100 text-sm">From {stats.successfulTickets} successful tickets</p>
            </div>

            {/* Total Tickets */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaTicketAlt size={24} />
                </div>
                <span className="text-blue-100 text-sm font-medium">Total Tickets</span>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-white/20 rounded w-24"></div>
              ) : (
                <div className="text-3xl font-bold mb-1">{stats.totalTickets}</div>
              )}
              <p className="text-blue-100 text-sm">
                {stats.pendingTickets} pending, {stats.failedTickets} failed
              </p>
            </div>

            {/* Total Events */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaCalendarAlt size={24} />
                </div>
                <span className="text-purple-100 text-sm font-medium">Events</span>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-white/20 rounded w-24"></div>
              ) : (
                <div className="text-3xl font-bold mb-1">{stats.totalEvents}</div>
              )}
              <p className="text-purple-100 text-sm">Active events</p>
            </div>

            {/* Total Users/Customers */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaUsers size={24} />
                </div>
                <span className="text-orange-100 text-sm font-medium">Customers</span>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-white/20 rounded w-24"></div>
              ) : (
                <div className="text-3xl font-bold mb-1">
                  {new Set(tickets.map(t => t.customer_email)).size}
                </div>
              )}
              <p className="text-orange-100 text-sm">Unique customers</p>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <FaNewspaper className="text-green-500" size={20} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Gallery Items</p>
                <FaImages className="text-pink-500" size={20} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.totalGalleryItems}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Destinations</p>
                <FaMapMarkerAlt className="text-purple-500" size={20} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.totalDestinations}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <FaCheckCircle className="text-green-500" size={20} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTickets > 0
                    ? Math.round((stats.successfulTickets / stats.totalTickets) * 100)
                    : 0}
                  %
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {menuItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className={`${item.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Ticket Purchases Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <FaTicketAlt className="text-indigo-500" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Recent Ticket Purchases</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setTicketFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      ticketFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTicketFilter('success')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      ticketFilter === 'success'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Success
                  </button>
                  <button
                    onClick={() => setTicketFilter('pending')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      ticketFilter === 'pending'
                        ? 'bg-yellow-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setTicketFilter('failed')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      ticketFilter === 'failed'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingTickets ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <div className="text-gray-500">Loading tickets...</div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <FaTicketAlt className="mx-auto mb-4 text-gray-300" size={64} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {ticketFilter === 'all'
                        ? "There are no ticket purchases yet. When customers purchase tickets, they'll appear here."
                        : `No ${ticketFilter} tickets found. Try selecting a different filter.`}
                    </p>
                    {ticketFilter !== 'all' && (
                      <button
                        onClick={() => setTicketFilter('all')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View All Tickets
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchase Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction Ref
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaUser className="text-indigo-600" />
                              </div>
                              <div className="ml-4 flex-1">
                                <button
                                  onClick={() => {
                                    setExpandedCustomerId(
                                      expandedCustomerId === ticket.id ? null : ticket.id
                                    );
                                  }}
                                  className="text-left w-full"
                                >
                                  <div className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                                    {ticket.customer_name || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <FaEnvelope className="text-xs" />
                                    {ticket.customer_email}
                                  </div>
                                  {ticket.customer_phone && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                      <FaPhone className="text-xs" />
                                      {ticket.customer_phone}
                                    </div>
                                  )}
                                </button>
                                {expandedCustomerId === ticket.id && (
                                  <div className="mt-2 flex gap-2 animate-in slide-in-from-top-2">
                                    {ticket.customer_phone && (
                                      <a
                                        href={`tel:${ticket.customer_phone}`}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-sm"
                                        title="Call customer"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <FaPhone className="text-xs" />
                                        Call
                                      </a>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCustomer({
                                          email: ticket.customer_email,
                                          name: ticket.customer_name,
                                          phone: ticket.customer_phone,
                                          ticketId: ticket.id,
                                        });
                                        setReminderModalOpen(true);
                                        setExpandedCustomerId(null);
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                                      title="Schedule call reminder"
                                    >
                                      <FaClock className="text-xs" />
                                      Remind
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {ticket.event_title || 'General Ticket'}
                            </div>
                            {ticket.event_id && (
                              <div className="text-xs text-gray-500">ID: {ticket.event_id.slice(0, 8)}...</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.currency} {parseFloat(ticket.amount.toString()).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ticket.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {getStatusIcon(ticket.status)}
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(ticket.payment_date || ticket.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-mono">
                              {ticket.tx_ref.slice(0, 12)}...
                            </div>
                            {ticket.chapa_reference && (
                              <div className="text-xs text-gray-500">Ref: {ticket.chapa_reference.slice(0, 12)}...</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Reminder Modal */}
      {selectedCustomer && (
        <ReminderModal
          isOpen={reminderModalOpen}
          onClose={() => {
            setReminderModalOpen(false);
            setSelectedCustomer(null);
          }}
          customerEmail={selectedCustomer.email}
          customerName={selectedCustomer.name}
          customerPhone={selectedCustomer.phone}
          ticketId={selectedCustomer.ticketId}
          onSuccess={() => {
            console.log('Reminder scheduled successfully');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
