import { useEffect, useState } from 'react';
import {
  FaBan,
  FaCalendarAlt,
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
  FaTicketAlt,
  FaTimesCircle,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Components/admin/AdminLayout';
import ReminderModal from '../../Components/admin/ReminderModal';
import { adminApi } from '../../services/adminApi';
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
  totalCommissionPaid: number;
  totalVATCollected: number;
  netCommissionPaid: number;
}

const Dashboard = () => {
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
    totalCommissionPaid: 0,
    totalVATCollected: 0,
    netCommissionPaid: 0,
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

  useEffect(() => {
    loadStats();
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketFilter]);

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
      const successfulTickets = allTickets?.filter(t => t.status === 'success' || t.status === 'used').length || 0;
      const pendingTickets = allTickets?.filter(t => t.status === 'pending').length || 0;
      const failedTickets = allTickets?.filter(t => t.status === 'failed').length || 0;
      
      const totalRevenue = allTickets
        ?.filter(t => t.status === 'success' || t.status === 'used')
        .reduce((sum, t) => {
          // Ensure amount is treated as a number (handle both numeric and string)
          let amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount.toString()) || 0;
          
          // Fix: If amount is suspiciously small (less than 10), it might have been incorrectly divided
          // Check if multiplying by 100 makes it more reasonable (e.g., 3.99 -> 399.00)
          // This handles cases where amounts were incorrectly divided when they were already in base currency
          if (amount > 0 && amount < 10 && amount * 100 > 50) {
            // Likely incorrectly stored - multiply by 100 to correct
            amount = amount * 100;
          }
          
          return sum + (amount * t.quantity);
        }, 0) || 0;

      // Calculate commission seller earnings
      const ticketsWithCommission = allTickets?.filter(t => (t.status === 'success' || t.status === 'used') && t.commission_seller_id) || [];
      let totalCommissionPaid = 0;
      
      // Get all commission sellers to calculate commissions
      const sellers = await adminApi.commissionSellers.getAll();
      
      ticketsWithCommission.forEach(ticket => {
        const seller = sellers.find(s => s.id === ticket.commission_seller_id);
        if (seller) {
          let amount = typeof ticket.amount === 'number' ? ticket.amount : parseFloat(ticket.amount.toString()) || 0;
          
          // Fix: If amount is suspiciously small (less than 10), it might have been incorrectly divided
          if (amount > 0 && amount < 10 && amount * 100 > 50) {
            // Likely incorrectly stored - multiply by 100 to correct
            amount = amount * 100;
          }
          
          const ticketTotal = amount * ticket.quantity;
          let commission = 0;
          if (seller.commission_type === 'percentage') {
            commission = (ticketTotal * seller.commission_rate) / 100;
          } else {
            commission = seller.commission_rate * ticket.quantity;
          }
          totalCommissionPaid += commission;
        }
      });

      // Calculate VAT (15% of commission)
      const totalVATCollected = (totalCommissionPaid * 15) / 100;
      const netCommissionPaid = totalCommissionPaid - totalVATCollected;

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
        totalCommissionPaid,
        totalVATCollected,
        netCommissionPaid,
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

  return (
    <AdminLayout title="Dashboard">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8">
            {/* Total Revenue */}
            <div className="rounded-lg shadow-md p-3 text-white" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                  <FaDollarSign className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {loadingStats ? (
                      <div className="animate-pulse h-5 bg-white/20 rounded w-16"></div>
                    ) : (
                      <span className="text-base font-bold whitespace-nowrap">
                        {formatCurrency(stats.totalRevenue, 'ETB')}
                      </span>
                    )}
                    <span className="text-white/80 text-xs opacity-90 hidden sm:inline">({stats.successfulTickets} tickets)</span>
                  </div>
                  <p className="text-white/80 text-xs opacity-90 truncate">Revenue</p>
                </div>
              </div>
            </div>

            {/* Total Tickets */}
            <div className="rounded-lg shadow-md p-3 text-white" style={{ background: 'linear-gradient(135deg, #FF6F5E 0%, #C73A26 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                  <FaTicketAlt className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {loadingStats ? (
                      <div className="animate-pulse h-5 bg-white/20 rounded w-12"></div>
                    ) : (
                      <span className="text-base font-bold">{stats.totalTickets}</span>
                    )}
                    <span className="text-white/80 text-xs opacity-90 hidden sm:inline">
                      ({stats.pendingTickets} pending, {stats.failedTickets} failed)
                    </span>
                  </div>
                  <p className="text-white/80 text-xs opacity-90 truncate">Total Tickets</p>
                </div>
              </div>
            </div>

            {/* Total Events */}
            <div className="rounded-lg shadow-md p-3 text-white" style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                  <FaCalendarAlt className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {loadingStats ? (
                    <div className="animate-pulse h-5 bg-white/20 rounded w-12"></div>
                  ) : (
                    <span className="text-base font-bold">{stats.totalEvents}</span>
                  )}
                  <p className="text-white/80 text-xs opacity-90 truncate">Events</p>
                </div>
              </div>
            </div>

            {/* Total Users/Customers */}
            <div className="rounded-lg shadow-md p-3 text-white" style={{ background: 'linear-gradient(135deg, #FF6F5E 0%, #C73A26 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                  <FaUsers className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {loadingStats ? (
                    <div className="animate-pulse h-5 bg-white/20 rounded w-12"></div>
                  ) : (
                    <span className="text-base font-bold">
                      {new Set(tickets.map(t => t.customer_email)).size}
                    </span>
                  )}
                  <p className="text-orange-100 text-xs opacity-90 truncate">Customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Seller Earnings Section */}
          {stats.totalCommissionPaid > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <FaUsers className="text-orange-600" size={20} />
                <span className="text-base sm:text-xl">Commission Seller Earnings</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Gross Commission Paid</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalCommissionPaid, 'ETB')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total before VAT</p>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">VAT Collected (15%)</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalVATCollected, 'ETB')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Tax collected</p>
                </div>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Net Commission Paid</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.netCommissionPaid, 'ETB')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">After VAT deduction</p>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Categories</p>
                <FaNewspaper className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Gallery Items</p>
                <FaImages className="text-pink-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalGalleryItems}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Destinations</p>
                <FaMapMarkerAlt className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalDestinations}</p>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Success Rate</p>
                <FaCheckCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
              ) : (
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.totalTickets > 0
                    ? Math.round((stats.successfulTickets / stats.totalTickets) * 100)
                    : 0}
                  %
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {menuItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className={`${item.color} p-2 sm:p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Ticket Purchases Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaTicketAlt className="text-indigo-500 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Ticket Purchases</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setTicketFilter('all')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      ticketFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setTicketFilter('success')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      ticketFilter === 'success'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Success
                  </button>
                  <button
                    onClick={() => setTicketFilter('pending')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                      ticketFilter === 'pending'
                        ? 'bg-yellow-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setTicketFilter('failed')}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
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

            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
              {loadingTickets ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <div className="text-sm sm:text-base text-gray-500">Loading tickets...</div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <FaTicketAlt className="mx-auto mb-4 text-gray-300 w-12 h-12 sm:w-16 sm:h-16" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 px-4">
                      {ticketFilter === 'all'
                        ? "There are no ticket purchases yet. When customers purchase tickets, they'll appear here."
                        : `No ${ticketFilter} tickets found. Try selecting a different filter.`}
                    </p>
                    {ticketFilter !== 'all' && (
                      <button
                        onClick={() => setTicketFilter('all')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Event
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Quantity
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Date
                        </th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                          Transaction Ref
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaUser className="text-indigo-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </div>
                              <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                                <button
                                  onClick={() => {
                                    setExpandedCustomerId(
                                      expandedCustomerId === ticket.id ? null : ticket.id
                                    );
                                  }}
                                  className="text-left w-full"
                                >
                                  <div className="text-xs sm:text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate">
                                    {ticket.customer_name || 'N/A'}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
                                    <FaEnvelope className="text-xs flex-shrink-0" />
                                    <span className="truncate">{ticket.customer_email}</span>
                                  </div>
                                  {ticket.customer_phone && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                      <FaPhone className="text-xs flex-shrink-0" />
                                      <span className="truncate">{ticket.customer_phone}</span>
                                    </div>
                                  )}
                                </button>
                                {expandedCustomerId === ticket.id && (
                                  <div className="mt-2 flex flex-wrap gap-2 animate-in slide-in-from-top-2">
                                    {ticket.customer_phone && (
                                      <a
                                        href={`tel:${ticket.customer_phone}`}
                                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-sm"
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
                                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
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
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <div className="text-xs sm:text-sm text-gray-900">
                              {ticket.event_title || 'General Ticket'}
                            </div>
                            {ticket.event_id && (
                              <div className="text-xs text-gray-500">ID: {ticket.event_id.slice(0, 8)}...</div>
                            )}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {(() => {
                                // Ensure amount is correctly formatted
                                // Handle both numeric and string types
                                let amount: number;
                                if (typeof ticket.amount === 'number') {
                                  amount = ticket.amount;
                                } else if (typeof ticket.amount === 'string') {
                                  amount = parseFloat(ticket.amount) || 0;
                                } else {
                                  amount = 0;
                                }
                                
                                // Fix: If amount is suspiciously small (less than 10), it might have been incorrectly divided
                                // Check if multiplying by 100 makes it more reasonable (e.g., 3.99 -> 399.00)
                                // This handles cases where amounts were incorrectly divided when they were already in base currency
                                if (amount > 0 && amount < 10 && amount * 100 > 50) {
                                  // Likely incorrectly stored - multiply by 100 to correct
                                  amount = amount * 100;
                                }
                                
                                // Format with 2 decimal places
                                return `${ticket.currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                              })()}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-xs sm:text-sm text-gray-900">{ticket.quantity}</div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {getStatusIcon(ticket.status)}
                              <span className="hidden sm:inline">{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                              <span className="sm:hidden">{ticket.status.charAt(0).toUpperCase()}</span>
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                            {formatDate(ticket.payment_date || ticket.created_at)}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden xl:table-cell">
                            <div className="text-xs sm:text-sm text-gray-900 font-mono">
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
            // Reminder scheduled successfully
          }}
        />
      )}
    </AdminLayout>
  );
};

export default Dashboard;
