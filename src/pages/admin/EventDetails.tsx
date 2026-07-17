import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaEnvelope, FaPhone, FaSearch, FaTicketAlt, FaTrash, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaTag, FaCheckCircle, FaTimesCircle, FaQrcode, FaShieldAlt, FaSyncAlt, FaExclamationTriangle, FaBan, FaSortAmountDown } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { api, Event } from '../../services/api';
import { supabase, handleSupabaseError } from '../../services/supabase';
import { fetchChapaTransactions } from '../../services/payment';
import { Ticket } from '../../types';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';


const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'chapa' | 'database' | 'merged'>('database');

  // ── Capacity enforcement state ──────────────────────────────────────────
  const [isEnforcing, setIsEnforcing] = useState(false);
  const [enforcementResult, setEnforcementResult] = useState<{ cancelled: number; kept: number } | null>(null);
  // ────────────────────────────────────────────────────────────────────────


  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (eventId: string, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const eventData = await api.getEvent(eventId);
      setEvent(eventData);

      // Try fetching from Chapa first (live, authoritative data)
      let chapaTickets: any[] = [];
      let chapaError = false;
      try {
        // Fetch all Chapa transactions and filter by event title
        const allChapa = await fetchChapaTransactions(eventData?.title);
        chapaTickets = allChapa;
      } catch (err) {
        console.warn('Could not load from Chapa, falling back to database:', err);
        chapaError = true;
      }

      // Always fetch from database too (has verified_at, QR data, etc.)
      const dbTickets = await adminApi.tickets.getByEvent(eventId, eventData?.title);

      // Merge: Chapa is source of truth for status/amount; DB adds verified_at, QR
      const mergedMap = new Map<string, any>();

      // Start with DB tickets
      (dbTickets || []).forEach((t: Ticket) => {
        mergedMap.set(t.tx_ref, { ...t, _source: 'database' });
      });

      // Overlay Chapa data (Chapa status is always authoritative)
      chapaTickets.forEach((t: any) => {
        const existing = mergedMap.get(t.tx_ref);
        if (existing) {
          // Merge: keep DB fields like verified_at, qr_code_data; use Chapa for status/amount
          mergedMap.set(t.tx_ref, {
            ...existing,
            status: t.status,       // Chapa status is authoritative
            amount: t.amount,
            currency: t.currency,
            quantity: t.quantity || existing.quantity,
            customer_name: t.customer_name || existing.customer_name,
            customer_email: t.customer_email || existing.customer_email,
            customer_phone: t.customer_phone || existing.customer_phone,
            chapa_reference: t.chapa_reference || existing.chapa_reference,
            _source: 'merged',
          });
        } else {
          // New transaction from Chapa not in DB — add it
          mergedMap.set(t.tx_ref, { ...t, id: t.id || t.tx_ref, created_at: t.created_at || new Date().toISOString() });
        }
      });

      const allTickets = Array.from(mergedMap.values());

      // Determine data source label
      if (chapaError) setDataSource('database');
      else if (chapaTickets.length > 0 && (dbTickets || []).length > 0) setDataSource('merged');
      else if (chapaTickets.length > 0) setDataSource('chapa');
      else setDataSource('database');

      // Deduplicate by email + amount + timestamp (rounded to minute)
      const uniqueMap = new Map<string, any>();
      allTickets.forEach((ticket: any) => {
        const timestamp = new Date(ticket.created_at).getTime();
        const roundedTimestamp = Math.floor(timestamp / 60000);
        const key = `${ticket.customer_email}-${ticket.amount}-${ticket.quantity}-${roundedTimestamp}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, ticket);
        } else {
          const existing = uniqueMap.get(key);
          // Prefer merged or non-free_reg tickets
          if ((existing.tx_ref?.startsWith('free_reg_') && !ticket.tx_ref?.startsWith('free_reg_')) ||
              (existing._source === 'database' && ticket._source === 'merged')) {
            uniqueMap.set(key, ticket);
          }
        }
      });

      setTickets(Array.from(uniqueMap.values()));
    } catch (error: any) {
      const handled = handleSupabaseError(error, 'loadData');
      setError(handled.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  // ── Capacity enforcement: cancel tickets beyond max, keep first-comers ──
  const handleEnforceCapacity = async () => {
    if (!event || !id || !event.maxAttendees) return;
    const max = event.maxAttendees;

    // Only operate on active (success/pending) tickets, sorted oldest→newest
    const activeTickets = tickets
      .filter(t => t.status === 'success' || t.status === 'pending')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Tally seats: first-comers keep spots until max is reached
    let seatsUsed = 0;
    const toCancel: string[] = [];
    for (const t of activeTickets) {
      const qty = Number(t.quantity) || 1;
      if (seatsUsed + qty <= max) {
        seatsUsed += qty;
      } else {
        toCancel.push(t.tx_ref);
      }
    }

    if (toCancel.length === 0) {
      alert('✅ No enforcement needed — all registrations fit within the capacity limit.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Capacity Enforcement\n\n` +
      `This will CANCEL ${toCancel.length} ticket(s) that registered after the limit was reached.\n` +
      `The first ${max} seat(s) (by registration time) will be kept.\n\n` +
      `This action cannot be undone. Continue?`
    );
    if (!confirmed) return;

    setIsEnforcing(true);
    setEnforcementResult(null);
    try {
      // 1. Cancel excess tickets
      const { error: cancelError } = await supabase
        .from('tickets')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .in('tx_ref', toCancel);

      if (cancelError) throw cancelError;

      // 2. Reset the event attendees count to the actual kept seats
      const { error: updateError } = await supabase
        .from('events')
        .update({ attendees: seatsUsed, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      setEnforcementResult({ cancelled: toCancel.length, kept: seatsUsed });
      // Reload data to reflect changes
      loadData(id, true);
    } catch (err: any) {
      alert('Error enforcing capacity: ' + err.message);
    } finally {
      setIsEnforcing(false);
    }
  };

  // Helper: rank active tickets by registration order for the enforcement preview
  const getRankedActiveTickets = useCallback(() => {
    if (!event?.maxAttendees) return [];
    const max = event.maxAttendees;
    const active = tickets
      .filter(t => t.status === 'success' || t.status === 'pending')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let seatsUsed = 0;
    return active.map(t => {
      const qty = Number(t.quantity) || 1;
      const fits = seatsUsed + qty <= max;
      if (fits) seatsUsed += qty;
      return { ...t, _fits: fits, _seatEnd: fits ? seatsUsed : seatsUsed + qty };
    });
  }, [tickets, event?.maxAttendees]);
  // ────────────────────────────────────────────────────────────────────────

  // ── Delete a ticket ──────────────────────────────────────────
  const handleDeleteTicket = async (ticket: Ticket) => {
    const confirmed = window.confirm(
      `Delete ticket for ${ticket.customer_name || ticket.customer_email}?\n\n` +
      `This will permanently remove the ticket and reduce the event attendee count by ${Number(ticket.quantity) || 1}.`
    );
    if (!confirmed) return;

    try {
      // 1. Delete the ticket row
      const { error: delError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticket.id);
      if (delError) throw delError;

      // 2. Decrement event attendees count (only if ticket was active)
      if ((ticket.status === 'success' || ticket.status === 'pending') && id) {
        const qty = Number(ticket.quantity) || 1;
        const { data: evData } = await supabase
          .from('events')
          .select('attendees')
          .eq('id', id)
          .single();
        if (evData) {
          await supabase
            .from('events')
            .update({ attendees: Math.max(0, (evData.attendees || 0) - qty), updated_at: new Date().toISOString() })
            .eq('id', id);
        }
      }

      // 3. Remove from local state
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
    } catch (err: any) {
      alert('Failed to delete ticket: ' + err.message);
    }
  };
  // ────────────────────────────────────────────────────────────────────────

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
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Data source badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              dataSource === 'chapa' ? 'bg-green-50 text-green-700 border border-green-200' :
              dataSource === 'merged' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dataSource === 'chapa' ? 'bg-green-500' :
                dataSource === 'merged' ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
              {dataSource === 'chapa' ? 'Live from Chapa' : dataSource === 'merged' ? 'Chapa + Database' : 'Database only'}
            </span>
            
            {/* Refresh button */}
            <button
              onClick={() => id && loadData(id, true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-sm"
            >
              <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>

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

        {/* Premium Event Info Card */}
        <div className="relative rounded-3xl shadow-xl border border-gray-100 overflow-hidden bg-white mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Image Section */}
            <div className="h-64 lg:h-auto relative">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/80" />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 rounded-full text-xs font-black text-white shadow-lg uppercase tracking-widest backdrop-blur-md bg-white/20 border border-white/30">
                  {event.category}
                </span>
              </div>
            </div>
            
            {/* Info Section */}
            <div className="p-8 lg:col-span-2 space-y-6 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">{event.title}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                    <FaCalendarAlt size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Date & Time</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50/80 flex items-center justify-center text-green-600 shadow-sm border border-green-100/50">
                    <FaMapMarkerAlt size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]" title={event.location}>{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50/80 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
                    <FaTag size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Price</p>
                    <p className="text-sm font-black text-gray-900">{event.price} <span className="text-xs text-gray-500 font-bold">{event.currency}</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50/80 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100/50">
                    <FaTicketAlt size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Capacity</p>
                    <p className="text-sm font-bold text-gray-900">{event.attendees || 0} / <span className="text-gray-500">{event.maxAttendees || '∞'}</span> registered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                  <FaTicketAlt size={16} />
                </div>
              </div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.totalTickets}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
                  <FaUser size={16} />
                </div>
              </div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Attendees</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.successfulQuantity}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                  <span className="font-black text-lg">E</span>
                </div>
              </div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenue</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">
                {stats.totalRevenue.toLocaleString()} <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">{event.currency}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                  <FaTicketAlt size={16} />
                </div>
              </div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Orders</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{stats.pendingTickets}</p>
            </div>
          </div>
        </div>

        {/* ── Capacity Enforcement Panel ── */}
        {event.maxAttendees && stats.successfulQuantity + stats.pendingTickets > 0 && (() => {
          const rankedTickets = getRankedActiveTickets();
          const overLimit = rankedTickets.filter(t => !t._fits);
          const isOverCapacity = overLimit.length > 0;
          const currentCount = tickets.filter(t => t.status === 'success' || t.status === 'pending')
            .reduce((acc, t) => acc + (Number(t.quantity) || 1), 0);

          return (
            <div className={`rounded-3xl shadow-xl border overflow-hidden mb-8 ${isOverCapacity ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              {/* Header */}
              <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isOverCapacity ? 'border-red-200 bg-red-100/60' : 'border-emerald-200 bg-emerald-100/60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${isOverCapacity ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {isOverCapacity ? <FaExclamationTriangle size={18} /> : <FaCheckCircle size={18} />}
                  </div>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${isOverCapacity ? 'text-red-900' : 'text-emerald-900'}`}>
                      {isOverCapacity ? '⚠️ Capacity Exceeded' : '✅ Within Capacity'}
                    </h3>
                    <p className={`text-xs font-semibold mt-0.5 ${isOverCapacity ? 'text-red-600' : 'text-emerald-600'}`}>
                      {currentCount} active seat{currentCount !== 1 ? 's' : ''} registered &nbsp;·&nbsp; limit is {event.maxAttendees}
                      {isOverCapacity && ` · ${overLimit.length} ticket${overLimit.length !== 1 ? 's' : ''} over the limit`}
                    </p>
                  </div>
                </div>

                {isOverCapacity && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {enforcementResult && (
                      <span className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl shadow">
                        ✅ Done — kept {enforcementResult.kept}, cancelled {enforcementResult.cancelled}
                      </span>
                    )}
                    <button
                      onClick={handleEnforceCapacity}
                      disabled={isEnforcing}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-black rounded-xl hover:bg-red-700 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isEnforcing ? (
                        <><FaSyncAlt className="animate-spin" size={14} /> Enforcing…</>
                      ) : (
                        <><FaBan size={14} /> Enforce Capacity (Keep First {event.maxAttendees})</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Ranked list */}
              {isOverCapacity && (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaSortAmountDown className="text-gray-400" size={13} />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Registration Order — First-Comers Get a Spot
                    </p>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {rankedTickets.map((t, idx) => (
                      <div
                        key={t.tx_ref}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-sm transition-all ${
                          t._fits
                            ? 'bg-white border-emerald-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        {/* Rank badge */}
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                          t._fits ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {idx + 1}
                        </span>

                        {/* Status icon */}
                        {t._fits
                          ? <FaCheckCircle className="text-emerald-500 flex-shrink-0" size={14} />
                          : <FaBan className="text-red-500 flex-shrink-0" size={14} />
                        }

                        {/* Name + email */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold truncate ${t._fits ? 'text-gray-900' : 'text-red-700 line-through'}`}>
                            {t.customer_name || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{t.customer_email}</p>
                        </div>

                        {/* Quantity + time */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-bold ${t._fits ? 'text-emerald-600' : 'text-red-500'}`}>
                            {Number(t.quantity) || 1} seat{(Number(t.quantity) || 1) !== 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(t.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Keep / Cancel label */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                          t._fits ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {t._fits ? 'Keep' : 'Cancel'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Attendees List Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-50 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Payment & Attendee List</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Manage all registrations and tickets for this event.</p>
              </div>
              <div className="relative max-w-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all outline-none"
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

                      {/* Date footer + delete button */}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-white/40 text-[10px]">
                          {new Date(ticket.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                          {ticket.qr_code_data && (
                            <span className="text-white/40 text-[10px] flex items-center gap-1">
                              <FaQrcode size={9} /> QR ready
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteTicket(ticket)}
                            title="Delete this ticket"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider transition-all backdrop-blur-sm"
                          >
                            <FaTrash size={8} /> Delete
                          </button>
                        </div>
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
