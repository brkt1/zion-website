import { useEffect, useState } from 'react';
import { FaBan, FaCalendarAlt, FaCheckCircle, FaClock, FaCog, FaEnvelope, FaHome, FaImages, FaInfoCircle, FaMapMarkerAlt, FaNewspaper, FaPhone, FaQrcode, FaSignOutAlt, FaTicketAlt, FaTimesCircle, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ReminderModal from '../../Components/admin/ReminderModal';
import { adminApi } from '../../services/adminApi';
import { isAdmin } from '../../services/auth';
import { supabase } from '../../services/supabase';
import { Ticket } from '../../types';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    email: string;
    name?: string;
    phone?: string;
    ticketId?: string;
  } | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const navigate = useNavigate();

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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const menuItems = [
    { icon: FaQrcode, label: 'Verify Tickets', path: '/admin/verify', color: 'bg-cyan-500' },
    { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', color: 'bg-blue-500' },
    { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', color: 'bg-green-500' },
    { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', color: 'bg-purple-500' },
    { icon: FaImages, label: 'Gallery', path: '/admin/gallery', color: 'bg-pink-500' },
    { icon: FaHome, label: 'Home Content', path: '/admin/home', color: 'bg-yellow-500' },
    { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', color: 'bg-indigo-500' },
    { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', color: 'bg-red-500' },
    { icon: FaCog, label: 'Site Settings', path: '/admin/settings', color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your website content</p>
            </div>
            <div className="flex items-center gap-4">
              {checkingAuth ? (
                <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <span className="text-sm text-gray-600">{user?.email || ''}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`${item.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-500">Manage {item.label.toLowerCase()}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaCalendarAlt className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaNewspaper className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gallery Items</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaImages className="text-pink-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Destinations</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaMapMarkerAlt className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Ticket Purchases Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaTicketAlt className="text-indigo-500" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Ticket Purchases</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTicketFilter('all')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    ticketFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTicketFilter('success')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    ticketFilter === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Success
                </button>
                <button
                  onClick={() => setTicketFilter('pending')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    ticketFilter === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setTicketFilter('failed')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    ticketFilter === 'failed'
                      ? 'bg-red-600 text-white'
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
              <div className="p-8 text-center">
                <div className="animate-pulse text-gray-500">Loading tickets...</div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <FaTicketAlt className="mx-auto mb-4 text-gray-300" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tickets found
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {ticketFilter === 'all'
                      ? "There are no ticket purchases yet. When customers purchase tickets, they'll appear here."
                      : `No ${ticketFilter} tickets found. Try selecting a different filter.`}
                  </p>
                  {ticketFilter !== 'all' && (
                    <button
                      onClick={() => setTicketFilter('all')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View All Tickets
                    </button>
                  )}
                </div>
              </div>
            ) : (
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
                    <tr key={ticket.id} className="hover:bg-gray-50">
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
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
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
            )}
          </div>
        </div>
      </main>

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
            // Optionally reload tickets or show success message
            console.log('Reminder scheduled successfully');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

