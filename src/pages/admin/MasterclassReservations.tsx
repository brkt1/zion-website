import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaCheck, FaEnvelope, FaEye, FaHistory, FaMapPin, FaPaperPlane, FaPhoneAlt, FaSearch, FaSpinner, FaTrash, FaUser, FaVenusMars } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { handleSupabaseError, supabase } from '../../services/supabase';
import { MasterclassReservation } from '../../types';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';


const MasterclassReservations = () => {
  const [reservations, setReservations] = useState<MasterclassReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<MasterclassReservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'today' | 'overdue' | 'none'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [communicationMethod, setCommunicationMethod] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  // Financial fields state
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'partial' | 'full'>('unpaid');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentCompletionDate, setPaymentCompletionDate] = useState('');
  // Email system state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailRecipientType, setEmailRecipientType] = useState<'individual' | 'all'>('individual');
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [shouldUpdateStatus, setShouldUpdateStatus] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.masterclassReservations.getAll();
      setReservations(data || []);
    } catch (error: any) {
      const handled = handleSupabaseError(error, 'loadReservations');
      setError(handled.message);
    } finally {

      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    try {
      await adminApi.masterclassReservations.delete(id);
      setReservations(reservations.filter(res => res.id !== id));
      if (selectedReservation?.id === id) {
        setShowModal(false);
        setSelectedReservation(null);
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Failed to delete reservation. Please try again.');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'reviewed' | 'accepted' | 'rejected' | 'pending') => {
    if (newStatus === 'pending') return;
    
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      const updated = await adminApi.masterclassReservations.updateStatus(id, newStatus as any, {
        notes: notes || undefined,
        selected_package: selectedPackage || undefined,
        communication_method: communicationMethod || undefined,
        follow_up_date: followUpDate || undefined,
        payment_status: paymentStatus,
        total_amount: totalAmount ? parseFloat(totalAmount) : undefined,
        paid_amount: paidAmount ? parseFloat(paidAmount) : undefined,
        remaining_amount: (totalAmount && paidAmount) ? (parseFloat(totalAmount) - parseFloat(paidAmount)) : undefined,
        payment_completion_date: paymentCompletionDate || undefined,
      });

      setReservations(reservations.map(res =>
        res.id === id ? updated : res
      ));

      if (selectedReservation?.id === id) {
        setSelectedReservation(updated);
      }
      
      // Reset form
      setNotes('');
      setSelectedPackage('');
      setCommunicationMethod('');
      setFollowUpDate('');
      setPaymentStatus('unpaid');
      setTotalAmount('');
      setPaidAmount('');
      setPaymentCompletionDate('');
      alert(`Status updated to ${newStatus}`);
    } catch (error: any) {
      const handled = handleSupabaseError(error, 'updateStatus');
      alert(handled.message);
    } finally {

      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      alert('Please enter a subject and body');
      return;
    }

    setSendingEmail(true);
    try {
      const selectedRecipients = emailRecipientType === 'all' 
        ? filteredReservations 
        : [selectedReservation].filter(Boolean) as MasterclassReservation[];

      const recipientEmails = selectedRecipients.map(r => r.email).filter(Boolean) as string[];
      const recipientIds = selectedRecipients.map(r => r.id);

      if (recipientEmails.length === 0) {
        alert('No recipients with valid email addresses found');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-masterclass-custom-email', {
        body: {
          to: recipientEmails,
          subject: emailSubject,
          body: emailBody,
          studentName: emailRecipientType === 'individual' ? selectedReservation?.name : undefined
        },
      });

      if (error) throw error;

      // Update statuses if requested
      if (shouldUpdateStatus && targetStatus) {
        const { error: updateError } = await supabase
          .from('masterclass_reservations')
          .update({ 
            status: targetStatus,
            updated_at: new Date().toISOString()
          })
          .in('id', recipientIds);

        if (updateError) {
          console.error('Error updating statuses:', updateError);
          alert('Emails sent, but failed to update statuses in database.');
        } else {
          // Refresh local state
          setReservations(reservations.map(res => 
            recipientIds.includes(res.id) ? { ...res, status: targetStatus as any } : res
          ));
        }
      }
      
      alert('Email(s) sent successfully!');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
      setTargetStatus('');
      setShouldUpdateStatus(false);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Make sure the Edge Function is deployed.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleViewDetails = (res: MasterclassReservation) => {
    setSelectedReservation(res);
    setNotes(res.notes || '');
    setSelectedPackage(res.selected_package || '');
    setCommunicationMethod(res.communication_method || '');
    setFollowUpDate(res.follow_up_date || '');
    // Populate financial fields
    setPaymentStatus(res.payment_status || 'unpaid');
    setTotalAmount(res.total_amount?.toString() || '');
    setPaidAmount(res.paid_amount?.toString() || '');
    setPaymentCompletionDate(res.payment_completion_date || '');
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || res.place === regionFilter;
    const matchesPackage = packageFilter === 'all' || res.selected_package?.includes(packageFilter);
    const matchesSearch = searchQuery === '' || 
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.phone.includes(searchQuery);

    let matchesFollowUp = true;
    if (followUpFilter !== 'all') {
      if (followUpFilter === 'none') {
        matchesFollowUp = !res.follow_up_date;
      } else if (res.follow_up_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fuDate = new Date(res.follow_up_date);
        fuDate.setHours(0, 0, 0, 0);
        
        if (followUpFilter === 'today') {
          matchesFollowUp = fuDate.getTime() === today.getTime();
        } else if (followUpFilter === 'overdue') {
          matchesFollowUp = fuDate.getTime() < today.getTime();
        }
      } else {
        matchesFollowUp = false;
      }
    }

    return matchesStatus && matchesRegion && matchesPackage && matchesSearch && matchesFollowUp;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-amber-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading masterclass reservations...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Masterclass Reservations</h1>
            <p className="text-gray-600">Manage e-learning program registrations</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setEmailRecipientType('all');
                setEmailSubject('Important Update: Yenege Masterclass');
                setShowEmailModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <FaEnvelope /> Email All Students
            </button>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-800 text-sm font-bold">{reservations.length} Total Registered</span>
            </div>
          </div>
        </div>

        {error && (
          <NetworkErrorBanner 
            message={error} 
            onRetry={loadReservations} 
          />
        )}


        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 mb-8 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Search Student</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Follow-up Status</label>
              <select
                value={followUpFilter}
                onChange={(e) => setFollowUpFilter(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Leads</option>
                <option value="today">Call Today 📞</option>
                <option value="overdue">Overdue ⚠️</option>
                <option value="none">No Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registration Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Region</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Regions</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Afar">Afar</option>
                <option value="Amhara">Amhara</option>
                <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                <option value="Central Ethiopia">Central Ethiopia</option>
                <option value="Dire Dawa">Dire Dawa</option>
                <option value="Gambela">Gambela</option>
                <option value="Harari">Harari</option>
                <option value="Oromia">Oromia</option>
                <option value="Sidama">Sidama</option>
                <option value="Somali">Somali</option>
                <option value="South Ethiopia">South Ethiopia</option>
                <option value="South West Ethiopia">South West Ethiopia</option>
                <option value="Tigray">Tigray</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Package Choice</label>
              <select
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Packages</option>
                <option value="Basic">Basic Package</option>
                <option value="Intermediate">Intermediate Package</option>
                <option value="Premium">Premium Package</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredReservations.length === 0 ? (
            <div className="p-12 text-center">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No reservations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Age / Sex</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Follow-up</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Location (Region)</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                            {res.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{res.name}</div>
                            <div className="text-xs text-gray-500">{res.phone}</div>
                            {res.email && <div className="text-[10px] text-indigo-500 font-medium">{res.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{res.age} yrs</div>
                        <div className="text-xs text-gray-500 uppercase font-black tracking-tighter">{res.sex}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {res.follow_up_date ? (
                          <div>
                            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                              new Date(res.follow_up_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'text-red-500' : 
                              new Date(res.follow_up_date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) ? 'text-amber-500' : 'text-indigo-500'
                            }`}>
                              {new Date(res.follow_up_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? '⚠️ Overdue' : 
                               new Date(res.follow_up_date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) ? '📞 Call Today' : '📅 Planned'}
                            </div>
                            <div className="text-xs font-bold text-gray-900">{new Date(res.follow_up_date).toLocaleDateString()}</div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">None set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{res.place}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(res.status)}`}>
                          {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {res.payment_status ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            res.payment_status === 'full' ? 'bg-green-100 text-green-800 border-green-200' :
                            res.payment_status === 'partial' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {res.payment_status}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Not Set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(res.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewDetails(res)}
                            className="text-amber-600 hover:text-amber-900 transition-colors"
                            title="View full details"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          {res.status !== 'accepted' && (
                            <button
                              onClick={() => handleStatusUpdate(res.id, 'accepted')}
                              disabled={updatingIds.has(res.id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Accept"
                            >
                              {updatingIds.has(res.id) ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedReservation(res);
                              setEmailRecipientType('individual');
                              setEmailSubject(`Update for ${res.name} - Yenege Masterclass`);
                              setShowEmailModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Send individual email"
                          >
                            <FaEnvelope />
                          </button>
                          <button
                            onClick={() => handleDelete(res.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showModal && selectedReservation && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black">
                    {selectedReservation.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedReservation.name}</h2>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Masterclass Candidate</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelectedReservation(null); }}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-200 pb-2">Profile</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <FaUser className="text-indigo-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">FullName & Phone</p>
                          <p className="text-sm font-bold text-gray-900 uppercase">{selectedReservation.name}</p>
                          <p className="text-xs font-medium text-indigo-600">{selectedReservation.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <FaUser className="text-indigo-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Age & Sex</p>
                          <p className="text-sm font-bold text-gray-900">{selectedReservation.age} years, {selectedReservation.sex}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <FaVenusMars className="text-indigo-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(selectedReservation.status)}`}>
                            {selectedReservation.status}
                          </span>
                        </div>
                      </div>
                      {selectedReservation.selected_package && (
                        <div className="flex items-center gap-4">
                          <FaCheck className="text-green-500" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Package</p>
                            <p className="text-sm font-bold text-gray-900">{selectedReservation.selected_package}</p>
                          </div>
                        </div>
                      )}
                      {selectedReservation.communication_method && (
                        <div className="flex items-center gap-4">
                          <FaHistory className="text-indigo-500" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Method</p>
                            <p className="text-sm font-bold text-gray-900">{selectedReservation.communication_method}</p>
                          </div>
                        </div>
                      )}
                      {selectedReservation.follow_up_date && (
                        <div className="flex items-center gap-4">
                          <FaPhoneAlt className="text-amber-500" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Follow-up Date</p>
                            <p className="text-sm font-bold text-gray-900">{new Date(selectedReservation.follow_up_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                      {selectedReservation.payment_status && (
                        <div className="flex items-center gap-4 mt-2 p-3 bg-white rounded-2xl border border-indigo-100">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedReservation.payment_status === 'full' ? 'bg-green-500' :
                            selectedReservation.payment_status === 'partial' ? 'bg-blue-500' : 'bg-gray-400'
                          }`} />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Financial Status</p>
                            <p className="text-sm font-bold text-gray-900 capitalize">{selectedReservation.payment_status}</p>
                            {selectedReservation.total_amount && (
                              <p className="text-[10px] text-gray-500">
                                Paid: {selectedReservation.paid_amount?.toLocaleString()} / Total: {selectedReservation.total_amount?.toLocaleString()} ETB
                              </p>
                            )}
                            {selectedReservation.payment_completion_date && (
                              <p className="text-[10px] text-amber-600 font-bold">
                                Completion: {new Date(selectedReservation.payment_completion_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600/50 mb-6 border-b border-indigo-200/50 pb-2">Location & Notes</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <FaMapPin className="text-indigo-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Region/Place</p>
                          <p className="text-sm font-bold text-gray-900">{selectedReservation.place}</p>
                        </div>
                      </div>
                      {selectedReservation.notes && (
                        <div className="mt-4 p-3 bg-white rounded-xl border border-indigo-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Admin Notes</p>
                          <p className="text-xs text-gray-600 italic">"{selectedReservation.notes}"</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-200 pb-2">Actions — Update Lead Intelligence</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Package Choice</label>
                      <select 
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Package...</option>
                        <option value="Basic Package (5,000 ETB)">Basic Package (5,000 ETB)</option>
                        <option value="Intermediate Package (10,000 ETB)">Intermediate Package (10,000 ETB)</option>
                        <option value="Premium Package (25,000 ETB)">Premium Package (25,000 ETB)</option>
                        <option value="Other / Custom">Other / Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Next Follow-up Date</label>
                      <input 
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Way of Communication</label>
                      <select 
                        value={communicationMethod}
                        onChange={(e) => setCommunicationMethod(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Method...</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="Telegram">Telegram</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Direct Meeting">Direct Meeting</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-4">Financial & Payment Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Status</label>
                        <select 
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value as any)}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="partial">Partial Payment</option>
                          <option value="full">Full Payment</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Amount (ETB)</label>
                        <input 
                          type="number"
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          placeholder="e.g. 10000"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Paid Amount (ETB)</label>
                        <input 
                          type="number"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      {paymentStatus === 'partial' && (
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Completion Date</label>
                          <input 
                            type="date"
                            value={paymentCompletionDate}
                            onChange={(e) => setPaymentCompletionDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Call/Interaction Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add details about the conversation..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {(['reviewed', 'accepted', 'rejected'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(selectedReservation.id, s)}
                        disabled={updatingIds.has(selectedReservation.id) || (selectedReservation.status === s && !notes && !selectedPackage)}
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${
                          selectedReservation.status === s
                            ? getStatusColor(s) + ' opacity-50 cursor-default'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md'
                        }`}
                      >
                       {updatingIds.has(selectedReservation.id) ? <FaSpinner className="animate-spin" /> : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl relative overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Send Email</h2>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                      {emailRecipientType === 'all' ? 'To All Students' : `To ${selectedReservation?.name}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message Body</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your message here... You can use HTML tags for formatting."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-h-[200px]"
                  />
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input 
                      type="checkbox" 
                      checked={shouldUpdateStatus}
                      onChange={(e) => setShouldUpdateStatus(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Update Student Status?</span>
                  </label>
                  
                  {shouldUpdateStatus && (
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select New Status...</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="flex-3 px-10 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane /> Send Now</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MasterclassReservations;
