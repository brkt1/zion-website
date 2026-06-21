import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaDownload, FaEnvelope,
  FaHandshake, FaMapMarkerAlt, FaPhone, FaQrcode, FaSearch,
  FaShieldAlt, FaSignOutAlt, FaTag, FaTicketAlt, FaTimesCircle, FaUser
} from 'react-icons/fa';
import { adminApi } from '../services/adminApi';
import { api, Event } from '../services/api';
import { Ticket } from '../types';

const CollaboratorEventView = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [collaborator, setCollaborator] = useState<any>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  useEffect(() => {
    // Verify collaborator session
    const session = sessionStorage.getItem('collaborator_session');
    if (!session) {
      navigate('/collaborator/login');
      return;
    }
    const parsed = JSON.parse(session);
    // Make sure they're accessing their own event
    if (parsed.event_id !== eventId) {
      navigate('/collaborator/login');
      return;
    }
    setCollaborator(parsed);
    loadData(eventId!);
  }, [eventId, navigate]);

  const loadData = async (eid: string) => {
    try {
      setLoading(true);
      const eventData = await api.getEvent(eid);
      const ticketsData = await adminApi.tickets.getByEvent(eid, eventData?.title);

      // Deduplicate
      const uniqueMap = new Map();
      (ticketsData || []).forEach((ticket: Ticket) => {
        const ts = Math.floor(new Date(ticket.created_at).getTime() / 60000);
        const key = `${ticket.customer_email}-${ticket.amount}-${ticket.quantity}-${ts}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, ticket);
        } else {
          const existing = uniqueMap.get(key);
          if (existing.tx_ref.startsWith('free_reg_') && !ticket.tx_ref.startsWith('free_reg_')) {
            uniqueMap.set(key, ticket);
          }
        }
      });

      setEvent(eventData);
      setTickets(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error('Error loading collaborator event data:', err);
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
    successTickets: tickets.filter(t => t.status === 'success').length,
    pendingTickets: tickets.filter(t => t.status === 'pending').length,
    successQuantity: tickets.filter(t => t.status === 'success').reduce((a, t) => a + (Number(t.quantity) || 1), 0),
    totalRevenue: tickets.filter(t => t.status === 'success').reduce((a, t) => a + Number(t.amount), 0),
    verifiedTickets: tickets.filter(t => t.verified_at).length,
  };

  const exportCSV = () => {
    if (!tickets.length) return;
    const headers = ['Name', 'Email', 'Phone', 'Quantity', 'Amount', 'Currency', 'Status', 'Verified', 'Date'];
    const rows = tickets.map(t => [
      t.customer_name || 'N/A', t.customer_email, t.customer_phone || 'N/A',
      t.quantity, t.amount, t.currency, t.status,
      t.verified_at ? new Date(t.verified_at).toLocaleString() : 'No',
      new Date(t.created_at).toLocaleString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `event_${event?.title.replace(/\s+/g, '_')}_attendees.csv`;
    link.click();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('collaborator_session');
    navigate('/collaborator/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f1f5f9' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}>
              <FaHandshake className="text-white" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Collaborator View</p>
              <h1 className="text-base font-black text-gray-900 truncate">{event.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-gray-900">{collaborator?.name}</p>
              <p className="text-xs text-gray-400">{collaborator?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-semibold"
            >
              <FaSignOutAlt size={12} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Event Banner */}
        <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 shadow-md">
          {event.image && (
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-2 w-fit">
              {event.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{event.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1.5"><FaCalendarAlt size={11} /> {new Date(event.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><FaMapMarkerAlt size={11} /> {event.location?.substring(0, 30)}{event.location?.length > 30 ? '…' : ''}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalTickets, icon: FaTicketAlt, color: 'bg-blue-50 text-blue-600' },
            { label: 'Confirmed Attendees', value: stats.successQuantity, icon: FaUser, color: 'bg-green-50 text-green-600' },
            { label: 'Total Revenue', value: `${stats.totalRevenue.toLocaleString()} ${event.currency}`, icon: FaTag, color: 'bg-amber-50 text-amber-600' },
            { label: 'Verified at Gate', value: stats.verifiedTickets, icon: FaShieldAlt, color: 'bg-emerald-50 text-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-xl font-black text-gray-900">{stat.value}</p>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-50 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-black text-gray-900">Payment List</h3>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                  <input
                    type="text"
                    placeholder="Search by name, email, ref…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-all"
                >
                  <FaDownload size={12} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
            {/* Status filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'success', 'pending', 'failed'] as const).map(s => {
                const count = s === 'all' ? tickets.length : tickets.filter(t => t.status === s).length;
                const colors: Record<string, string> = {
                  all: statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  success: statusFilter === 'success' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
                  pending: statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                  failed: statusFilter === 'failed' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
                };
                return (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${colors[s]}`}>
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
                {searchTerm ? 'No payments found matching your search.' : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}payments recorded yet.`}
              </p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTickets.map(ticket => {
                const isVerified = !!ticket.verified_at;
                const isSuccess = ticket.status === 'success';
                const isPending = ticket.status === 'pending';
                const initials = ticket.customer_name
                  ? ticket.customer_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                  : 'U?';

                return (
                  <div key={ticket.id} className="relative rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col" style={{ minHeight: '240px' }}>
                    {/* Wallpaper */}
                    <div className="absolute inset-0">
                      {event.image
                        ? <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/85" />
                    </div>

                    {/* Top badges */}
                    <div className="relative flex items-center justify-between p-4 pb-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                        isSuccess ? 'bg-green-500/80 text-white' : isPending ? 'bg-amber-400/80 text-black' : 'bg-red-500/80 text-white'
                      }`}>
                        {isSuccess ? '✓' : isPending ? '⏳' : '✕'} {ticket.status}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                        isVerified ? 'bg-emerald-500/90 text-white' : 'bg-white/20 text-white border border-white/30'
                      }`}>
                        {isVerified ? <><FaCheckCircle size={9} /> Verified</> : <><FaTimesCircle size={9} /> Unverified</>}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 flex flex-col justify-end p-4 pt-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 ring-2 ring-white/30">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm leading-tight truncate">{ticket.customer_name || 'Unknown User'}</p>
                          <p className="text-white/60 text-[10px] font-mono mt-0.5 truncate">{ticket.tx_ref?.substring(0, 22)}…</p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 mb-3" />

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

                      {isVerified && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-300 text-[10px]">
                          <FaShieldAlt size={9} />
                          <span>Scanned {new Date(ticket.verified_at!).toLocaleDateString()} at {new Date(ticket.verified_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}

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
    </div>
  );
};

export default CollaboratorEventView;
