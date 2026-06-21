import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaEnvelope, FaPhone, FaSearch, FaTicketAlt, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaTag, FaCheckCircle, FaTimesCircle, FaQrcode, FaShieldAlt } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { api, Event } from '../../services/api';
import { handleSupabaseError } from '../../services/supabase';
import { Ticket } from '../../types';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';


const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (eventId: string) => {
    try {
      setLoading(true);
      const eventData = await api.getEvent(eventId);
      const ticketsData = await adminApi.tickets.getByEvent(eventId, eventData?.title);

      // Deduplicate tickets that might have been created twice (common in free registrations)
      // We deduplicate based on email, amount, quantity, and timestamp (rounded to nearest minute)
      const uniqueTicketsMap = new Map();
      (ticketsData || []).forEach((ticket: Ticket) => {
        const timestamp = new Date(ticket.created_at).getTime();
        const roundedTimestamp = Math.floor(timestamp / 60000); // Round to nearest minute
        const key = `${ticket.customer_email}-${ticket.amount}-${ticket.quantity}-${roundedTimestamp}`;
        
        if (!uniqueTicketsMap.has(key)) {
          uniqueTicketsMap.set(key, ticket);
        } else {
          // If we have a duplicate, prefer the one that doesn't start with 'free_reg_' 
          const existing = uniqueTicketsMap.get(key);
          if (existing.tx_ref.startsWith('free_reg_') && !ticket.tx_ref.startsWith('free_reg_')) {
            uniqueTicketsMap.set(key, ticket);
          }
        }
      });

      setEvent(eventData);
      setTickets(Array.from(uniqueTicketsMap.values()));
    } catch (error: any) {
      const handled = handleSupabaseError(error, 'loadData');
      setError(handled.message);
    } finally {

      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm ||
      ticket.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer_phone?.includes(searchTerm) ||
      ticket.tx_ref?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTickets: tickets.length,
    totalQuantity: tickets.reduce((acc, t) => acc + (Number(t.quantity) || 1), 0),
    successfulTickets: tickets.filter(t => t.status === 'success').length,
    successfulQuantity: tickets.filter(t => t.status === 'success').reduce((acc, t) => acc + (Number(t.quantity) || 1), 0),
    totalRevenue: tickets.filter(t => t.status === 'success').reduce((acc, t) => acc + Number(t.amount), 0),
    pendingTickets: tickets.filter(t => t.status === 'pending').length,
  };

  const exportToCSV = () => {
    if (!tickets.length) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Quantity', 'Amount', 'Currency', 'Status', 'Reference', 'Date'];
    const rows = tickets.map(t => [
      t.customer_name || 'N/A',
      t.customer_email,
      t.customer_phone || 'N/A',
      t.quantity,
      t.amount,
      t.currency,
      t.status,
      t.tx_ref,
      new Date(t.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `event_${event?.title.replace(/\s+/g, '_')}_attendees.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout title="Event Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout title="Event Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">The event you are looking for does not exist.</p>
          <Link to="/admin/events" className="text-indigo-600 hover:underline">Go back to events</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Event: ${event.title}`}>
      <div className="space-y-6">
        {error && (
          <NetworkErrorBanner 
            message={error} 
            onRetry={() => {
              setError(null);
              if (id) loadData(id);
            }} 
          />
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link 
            to="/admin/events" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Events</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <FaDownload className="text-gray-400" />
              <span>Export CSV</span>
            </button>
            <Link
              to={`/events/${event.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
            >
              <span>View Public Page</span>
            </Link>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="h-48 md:h-auto relative">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                  {event.category}
                </span>
              </div>
            </div>
            <div className="p-6 md:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FaCalendarAlt size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Date & Time</p>
                    <p className="text-sm">{new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <FaMapMarkerAlt size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Location</p>
                    <p className="text-sm truncate max-w-[200px]">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <FaTag size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Price</p>
                    <p className="text-sm font-semibold text-gray-900">{event.price} {event.currency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <FaTicketAlt size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Capacity</p>
                    <p className="text-sm">{event.attendees || 0} / {event.maxAttendees || '∞'} registered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FaTicketAlt />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Attendees (Quantity)</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{stats.successfulQuantity}</p>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <FaUser />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-500">{event.currency}</span>
              </p>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <span className="font-bold">E</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pending Orders</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTickets}</p>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <FaTicketAlt />
              </div>
            </div>
          </div>
        </div>

        {/* Attendees Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-900">Payment List</h3>
              <div className="relative max-w-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            {/* Status filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'success', 'pending', 'failed'] as const).map((s) => {
                const count = s === 'all' ? tickets.length : tickets.filter(t => t.status === s).length;
                const colors: Record<string, string> = {
                  all: statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  success: statusFilter === 'success' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
                  pending: statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                  failed: statusFilter === 'failed' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
                };
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${colors[s]}`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Grid */}
          {filteredTickets.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <FaTicketAlt className="mx-auto text-4xl mb-3 opacity-30" />
              <p className="text-sm italic">
                {searchTerm
                  ? 'No payments found matching your search.'
                  : statusFilter === 'all'
                  ? 'No payments have been recorded for this event yet.'
                  : `No ${statusFilter} payments found for this event.`}
              </p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTickets.map((ticket) => {
                const isVerified = !!ticket.verified_at;
                const isSuccess = ticket.status === 'success';
                const isPending = ticket.status === 'pending';
                const initials = ticket.customer_name
                  ? ticket.customer_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                  : 'U?';

                return (
                  <div
                    key={ticket.id}
                    className="relative rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col"
                    style={{ minHeight: '240px' }}
                  >
                    {/* Wallpaper background */}
                    <div className="absolute inset-0">
                      {event?.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />
                      )}
                      {/* Gradient overlay - darkens bottom more for readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/85" />
                    </div>

                    {/* Top badges row */}
                    <div className="relative flex items-center justify-between p-4 pb-0">
                      {/* Payment status badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                        isSuccess
                          ? 'bg-green-500/80 text-white'
                          : isPending
                          ? 'bg-amber-400/80 text-black'
                          : 'bg-red-500/80 text-white'
                      }`}>
                        {isSuccess ? '✓' : isPending ? '⏳' : '✕'} {ticket.status}
                      </span>

                      {/* Verified / Unverified badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                        isVerified
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-white/20 text-white border border-white/30'
                      }`}>
                        {isVerified
                          ? <><FaCheckCircle size={9} /> Verified</>  
                          : <><FaTimesCircle size={9} /> Unverified</>}
                      </span>
                    </div>

                    {/* Center content */}
                    <div className="relative flex-1 flex flex-col justify-end p-4 pt-2">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 ring-2 ring-white/30">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm leading-tight truncate">
                            {ticket.customer_name || 'Unknown User'}
                          </p>
                          <p className="text-white/60 text-[10px] font-mono mt-0.5 truncate">
                            {ticket.tx_ref?.substring(0, 22)}…
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10 mb-3" />

                      {/* Contact + details grid */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-white/80 min-w-0">
                          <FaEnvelope className="text-white/40 flex-shrink-0" size={9} />
                          <span className="truncate">{ticket.customer_email}</span>
                        </div>
                        {ticket.customer_phone && (
                          <div className="flex items-center gap-1.5 text-white/80 min-w-0">
                            <FaPhone className="text-white/40 flex-shrink-0" size={9} />
                            <span className="truncate">{ticket.customer_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-white/80">
                          <FaTicketAlt className="text-white/40 flex-shrink-0" size={9} />
                          <span>{ticket.quantity} ticket{Number(ticket.quantity) !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80">
                          <FaTag className="text-white/40 flex-shrink-0" size={9} />
                          <span className="font-semibold">{Number(ticket.amount).toLocaleString()} {ticket.currency}</span>
                        </div>
                      </div>

                      {/* Verified at detail (if verified) */}
                      {isVerified && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-300 text-[10px]">
                          <FaShieldAlt size={9} />
                          <span>Scanned {new Date(ticket.verified_at!).toLocaleDateString()} at {new Date(ticket.verified_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}

                      {/* Date footer */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-white/40 text-[10px]">
                          {new Date(ticket.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {ticket.qr_code_data && (
                          <span className="text-white/40 text-[10px] flex items-center gap-1">
                            <FaQrcode size={9} /> QR ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventDetails;
