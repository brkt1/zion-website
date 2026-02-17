import { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaDollarSign,
  FaEnvelope,
  FaEye,
  FaGlobe,
  FaHome,
  FaImages,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaNewspaper,
  FaQrcode,
  FaRedo,
  FaStar,
  FaTicketAlt,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Components/admin/AdminLayout';
import ReminderModal from '../../Components/admin/ReminderModal';
import { useCommissionSellers } from '../../hooks/useApi';
import { adminApi } from '../../services/adminApi';
import { getDailyVisitStats, getTodayVisits, getTotalVisits, getUniqueVisitorsToday } from '../../services/analytics';
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
  reach: number;
  rsvps: number;
  attendees: number;
  repeatInterest: number;
  venueFeedback: number;
  todayVisits: number;
  uniqueVisitorsToday: number;
  totalVisits: number;
  dailyVisitStats: Array<{ date: string; count: number; unique_visitors: number }>;
}

const Dashboard = () => {
  // Use cached hook for commission sellers
  const { sellers: commissionSellers } = useCommissionSellers();
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
    reach: 0,
    rsvps: 0,
    attendees: 0,
    repeatInterest: 0,
    venueFeedback: 0,
    todayVisits: 0,
    uniqueVisitorsToday: 0,
    totalVisits: 0,
    dailyVisitStats: [],
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
      // Get today's date in YYYY-MM-DD format for filtering upcoming events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const [events, categories, gallery, destinations, allTickets, eventsData] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }).gte('date', todayStr), // Only upcoming events
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('gallery').select('id', { count: 'exact', head: true }),
        supabase.from('destinations').select('id', { count: 'exact', head: true }),
        adminApi.tickets.getAll(),
        supabase.from('events').select('attendees').gte('date', todayStr), // Only upcoming events for attendees
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
      
      // Use cached commission sellers data
      const sellers = commissionSellers;
      
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

      // Calculate metrics
      // Reach: Total unique customers (people who have purchased tickets)
      const uniqueCustomers = new Set(allTickets?.map(t => t.customer_email).filter(Boolean) || []).size;
      
      // RSVPs: Total successful tickets (already calculated)
      const rsvps = successfulTickets;
      
      // Attendees: Sum of all attendees from events
      const totalAttendees = eventsData?.data?.reduce((sum, event) => sum + (event.attendees || 0), 0) || 0;
      
      // Repeat interest: Customers who purchased tickets for 2+ different events
      const customerEventMap = new Map<string, Set<string>>();
      allTickets?.forEach(ticket => {
        if (ticket.customer_email && ticket.event_id) {
          if (!customerEventMap.has(ticket.customer_email)) {
            customerEventMap.set(ticket.customer_email, new Set());
          }
          customerEventMap.get(ticket.customer_email)?.add(ticket.event_id);
        }
      });
      const repeatCustomers = Array.from(customerEventMap.values()).filter(eventSet => eventSet.size >= 2).length;
      
      // Venue feedback: Placeholder (0 for now, can be enhanced later with feedback table)
      const venueFeedback = 0;

      // Get visit statistics
      const [todayVisits, uniqueVisitorsToday, totalVisits, dailyVisitStats] = await Promise.all([
        getTodayVisits(),
        getUniqueVisitorsToday(),
        getTotalVisits(),
        getDailyVisitStats(7), // Last 7 days
      ]);

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
        reach: uniqueCustomers,
        rsvps,
        attendees: totalAttendees,
        repeatInterest: repeatCustomers,
        venueFeedback,
        todayVisits,
        uniqueVisitorsToday,
        totalVisits,
        dailyVisitStats,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Total Revenue */}
            <div className="group relative overflow-hidden rounded-[32px] p-6 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#FF6F5E]/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFD447]/10 to-[#FF6F5E]/10 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD447] to-[#FF6F5E] flex items-center justify-center mb-6 shadow-lg shadow-[#FF6F5E]/20 text-white">
                  <FaDollarSign size={24} />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  {loadingStats ? (
                    <div className="animate-pulse h-9 bg-gray-100 rounded-lg w-32"></div>
                  ) : (
                    <h3 className="text-3xl font-black text-[#1C2951] tracking-tight truncate">
                      {formatCurrency(stats.totalRevenue, 'ETB')}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Revenue</span>
                  <div className="h-4 w-px bg-gray-100 mx-1" />
                  <span className="text-[10px] font-bold text-[#FF6F5E] uppercase tracking-widest leading-none">{stats.successfulTickets} Sold</span>
                </div>
              </div>
            </div>

            {/* Total Tickets */}
            <div className="group relative overflow-hidden rounded-[32px] p-6 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 text-white">
                  <FaTicketAlt size={24} />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  {loadingStats ? (
                    <div className="animate-pulse h-9 bg-gray-100 rounded-lg w-20"></div>
                  ) : (
                    <h3 className="text-3xl font-black text-[#1C2951] tracking-tight">{stats.totalTickets}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Tickets</span>
                  <div className="h-4 w-px bg-gray-100 mx-1" />
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">{stats.pendingTickets} Pending</span>
                </div>
              </div>
            </div>

            {/* Total Events */}
            <div className="group relative overflow-hidden rounded-[32px] p-6 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 text-white">
                  <FaCalendarAlt size={24} />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  {loadingStats ? (
                    <div className="animate-pulse h-9 bg-gray-100 rounded-lg w-20"></div>
                  ) : (
                    <h3 className="text-3xl font-black text-[#1C2951] tracking-tight">{stats.totalEvents}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Active Events</span>
                  <div className="h-4 w-px bg-gray-100 mx-1" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Upcoming</span>
                </div>
              </div>
            </div>

            {/* Total Customers */}
            <div className="group relative overflow-hidden rounded-[32px] p-6 bg-white border border-gray-100 shadow-xl shadow-gray-200/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20 text-white">
                  <FaUsers size={24} />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  {loadingStats ? (
                    <div className="animate-pulse h-9 bg-gray-100 rounded-lg w-20"></div>
                  ) : (
                    <h3 className="text-3xl font-black text-[#1C2951] tracking-tight">
                       {new Set(tickets.map(t => t.customer_email)).size}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Happy Customers</span>
                  <div className="h-4 w-px bg-gray-100 mx-1" />
                  <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest leading-none">Total Reach</span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          {stats.totalCommissionPaid > 0 && (
            <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/40 border border-gray-100 p-8 mb-10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-orange-50 to-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] -z-10" />
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white transform -rotate-6">
                  <FaUsers size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1C2951] tracking-tight">Commission Earnings</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Payment & VAT Summary</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-gray-50/50 backdrop-blur-sm rounded-3xl border border-gray-100/50 hover:bg-white transition-all duration-300 group/item">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Gross Commission</p>
                  <p className="text-3xl font-black text-[#1C2951] mb-2">{formatCurrency(stats.totalCommissionPaid, 'ETB')}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-tight">
                     Total before taxes
                  </div>
                </div>
                <div className="p-8 bg-gray-50/50 backdrop-blur-sm rounded-3xl border border-gray-100/50 hover:bg-white transition-all duration-300">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">VAT Collected</p>
                  <p className="text-3xl font-black text-[#1C2951] mb-2">{formatCurrency(stats.totalVATCollected, 'ETB')}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-tight">
                     15% Federal Tax
                  </div>
                </div>
                <div className="p-8 bg-gray-50/50 backdrop-blur-sm rounded-3xl border border-gray-100/50 hover:bg-white transition-all duration-300">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Net Payout</p>
                  <p className="text-3xl font-black text-[#1C2951] mb-2">{formatCurrency(stats.netCommissionPaid, 'ETB')}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                     Final amount paid
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Tracking Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <FaChartLine className="text-indigo-600" size={20} />
              <span className="text-base sm:text-xl">Track your first metrics</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Reach */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <FaEye className="text-blue-600 w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Reach</p>
                {loadingStats ? (
                  <div className="animate-pulse h-6 sm:h-8 bg-white/50 rounded w-12"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.reach}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Unique customers</p>
              </div>

              {/* RSVPs */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <FaTicketAlt className="text-green-600 w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">RSVPs</p>
                {loadingStats ? (
                  <div className="animate-pulse h-6 sm:h-8 bg-white/50 rounded w-12"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.rsvps}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Successful tickets</p>
              </div>

              {/* Attendees */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <FaUsers className="text-purple-600 w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Attendees</p>
                {loadingStats ? (
                  <div className="animate-pulse h-6 sm:h-8 bg-white/50 rounded w-12"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.attendees}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Total across events</p>
              </div>

              {/* Repeat Interest */}
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <FaRedo className="text-orange-600 w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Repeat Interest</p>
                {loadingStats ? (
                  <div className="animate-pulse h-6 sm:h-8 bg-white/50 rounded w-12"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.repeatInterest}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">2+ events purchased</p>
              </div>

              {/* Venue Feedback */}
              <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                <div className="flex items-center justify-between mb-2">
                  <FaStar className="text-teal-600 w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Venue Feedback</p>
                {loadingStats ? (
                  <div className="animate-pulse h-6 sm:h-8 bg-white/50 rounded w-12"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stats.venueFeedback > 0 ? stats.venueFeedback : '—'}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {stats.venueFeedback > 0 ? 'Feedback received' : 'Coming soon'}
                </p>
              </div>
            </div>
          </div>

          {/* Visitors Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mb-10">
            <div className="xl:col-span-2 bg-white rounded-[40px] shadow-xl shadow-gray-200/40 border border-gray-100 p-10 relative overflow-hidden flex flex-col group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD447] to-[#FF6F5E]" />
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black text-[#1C2951] tracking-tight">Website Traffic</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">7 Days Activity</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-100 shadow-sm">
                   <div className="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black text-[#1C2951] shadow-sm uppercase">Weekly</div>
                   <div className="px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-400 uppercase">Monthly</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between space-y-4">
                {stats.dailyVisitStats.map((day, idx) => {
                  const date = new Date(day.date);
                  const maxVisits = Math.max(...stats.dailyVisitStats.map(d => d.count), 1);
                  const percentage = (day.count / maxVisits) * 100;
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div key={day.date} className="group/row flex items-center gap-6">
                      <div className="w-24 flex-shrink-0">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                            {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                         </p>
                         <p className="text-xs font-black text-[#1C2951]">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="flex-1 h-10 bg-gray-50 rounded-2xl relative overflow-hidden flex items-center px-4 group/bar hover:bg-gray-100 transition-colors duration-300">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-2xl transition-all duration-1000 ease-out shadow-lg ${
                            isToday
                              ? 'bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] shadow-[#FF6F5E]/20'
                              : 'bg-gradient-to-r from-gray-200 to-gray-300'
                          }`}
                          style={{ width: `${percentage}%`, transitionDelay: `${idx * 100}ms` }}
                        />
                        <div className="relative z-10 w-full flex justify-end">
                           <span className={`text-[10px] font-black transition-colors duration-300 ${percentage > 5 ? (isToday ? 'text-white' : 'text-gray-500') : 'text-gray-400'}`}>
                              {day.count} Hits
                           </span>
                        </div>
                      </div>
                      <div className="w-16 text-right">
                         <p className="text-[10px] font-black text-emerald-500">{day.unique_visitors}</p>
                         <p className="text-[8px] font-bold text-gray-400 uppercase">Unique</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-gradient-to-br from-[#1C2951] to-gray-900 rounded-[40px] p-8 text-white shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  <FaGlobe className="text-[#FFD447] mb-6 animate-pulse" size={32} />
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Total Footprint</p>
                  <h3 className="text-5xl font-black text-white tracking-tight mb-4">{stats.totalVisits.toLocaleString()}</h3>
                  <div className="flex items-center gap-2">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1C2951] bg-gray-700 flex items-center justify-center text-[8px] font-bold"><FaUser size={8}/></div>)}
                     </div>
                     <span className="text-[10px] font-bold text-white/60">Community members reached</span>
                  </div>
               </div>

               <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 group hover:border-[#FFD447] transition-colors duration-500">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-[#FFD447]/10 flex items-center justify-center text-[#FFD447]">
                        <FaEye size={24} />
                     </div>
                     <div className="px-3 py-1 bg-green-50 text-green-500 text-[10px] font-black rounded-full">+12%</div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Today's Attention</p>
                  <h3 className="text-4xl font-black text-[#1C2951] tracking-tight">{stats.uniqueVisitorsToday} Unique</h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-4 leading-relaxed">Unique digital souls explored your universe today.</p>
               </div>
            </div>
          </div>
            {stats.dailyVisitStats.length === 0 && !loadingStats && (
              <div className="text-center py-8 sm:py-12">
                <FaGlobe className="mx-auto mb-4 text-gray-300 w-12 h-12 sm:w-16 sm:h-16" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No visit data yet</h3>
                <p className="text-xs sm:text-sm text-gray-500 px-4">
                  Visitor tracking will start once users begin visiting your website.
                </p>
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
          <div className="mb-12">
            <h2 className="text-sm font-black text-[#1C2951] uppercase tracking-[0.2em] mb-6 px-4">Instant Operations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {menuItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group flex flex-col items-center justify-center p-8 bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:border-[#FFD447] transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:scale-110 group-hover:bg-gradient-to-br ${item.color} group-hover:text-white group-hover:shadow-lg transition-all duration-500 mb-4`}>
                      <Icon size={24} />
                    </div>
                    <span className="relative z-10 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors duration-500">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Ticket Purchases Section */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-20">
            <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <FaTicketAlt size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1C2951] tracking-tight">Recent Activity</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Transaction Stream</p>
                </div>
              </div>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner overflow-x-auto scrollbar-hide">
                {(['all', 'success', 'pending', 'failed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTicketFilter(filter)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                      ticketFilter === filter
                        ? 'bg-white text-[#1C2951] shadow-lg shadow-black/5 scale-105'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
              {loadingTickets ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 border-4 border-[#FFD447] border-t-[#FF6F5E] rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-[#FFD447]/20"></div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Streaming Transactions...</div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
                       <FaTicketAlt className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-[#1C2951] tracking-tight mb-2">No data in this stream</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                      {ticketFilter === 'all'
                        ? "The transaction history is empty at the moment."
                        : `No ${ticketFilter} activities found in this channel.`}
                    </p>
                    {ticketFilter !== 'all' && (
                      <button
                        onClick={() => setTicketFilter('all')}
                        className="px-8 py-3 bg-[#1C2951] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        Reset Channel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 backdrop-blur-sm border-b border-gray-50">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Entity</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden sm:table-cell">Event Node</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financials</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Units</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden lg:table-cell">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-200/50">
                                <FaUser size={16} />
                              </div>
                              <div className="min-w-0">
                                <button
                                  onClick={() => setExpandedCustomerId(expandedCustomerId === ticket.id ? null : ticket.id)}
                                  className="text-left group/btn"
                                >
                                  <p className="text-sm font-black text-[#1C2951] truncate group-hover/btn:text-indigo-600 transition-colors uppercase tracking-tight">
                                    {ticket.customer_name || 'Anonymous'}
                                  </p>
                                  <p className="text-[10px] font-bold text-gray-400 truncate tracking-tight">{ticket.customer_email}</p>
                                </button>
                                {expandedCustomerId === ticket.id && (
                                  <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {ticket.customer_phone && (
                                      <a
                                        href={`tel:${ticket.customer_phone}`}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                                      >
                                        Call
                                      </a>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedCustomer({
                                          email: ticket.customer_email,
                                          name: ticket.customer_name,
                                          phone: ticket.customer_phone,
                                          ticketId: ticket.id,
                                        });
                                        setReminderModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                                    >
                                      Remind
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 hidden sm:table-cell">
                             <p className="text-xs font-bold text-[#1C2951] uppercase tracking-tight">{ticket.event_title || 'General Access'}</p>
                             <div className="flex items-center gap-1.5 mt-1">
                               <div className="w-1 h-1 rounded-full bg-indigo-300" />
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ticket.event_id?.slice(0, 8) || 'N/A'}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm font-black text-[#1C2951]">
                              {(() => {
                                let amount = typeof ticket.amount === 'number' ? ticket.amount : parseFloat(ticket.amount) || 0;
                                if (amount > 0 && amount < 10 && amount * 100 > 50) amount *= 100;
                                return `${ticket.currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                              })()}
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Value Captured</p>
                          </td>
                          <td className="px-8 py-6 hidden md:table-cell">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-[#1C2951] border border-gray-100">
                               {ticket.quantity}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${getStatusColor(ticket.status)} shadow-sm transition-transform group-hover:scale-105`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-current shadow-lg" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{ticket.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 hidden lg:table-cell">
                             <p className="text-xs font-bold text-[#1C2951] uppercase tracking-tighter">{formatDate(ticket.payment_date || ticket.created_at).split(',')[0]}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{formatDate(ticket.payment_date || ticket.created_at).split(',')[1]}</p>
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
          onSuccess={() => {}}
        />
      )}
    </AdminLayout>
  );
};

export default Dashboard;
