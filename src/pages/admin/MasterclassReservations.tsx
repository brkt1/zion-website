import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaCheck, FaEnvelope, FaEye, FaHistory, FaLink, FaMapPin, FaPaperPlane, FaPhoneAlt, FaSearch, FaSpinner, FaTrash, FaUser, FaVenusMars, FaCopy, FaExternalLinkAlt, FaChevronDown, FaToggleOn, FaToggleOff, FaCalendarCheck, FaRegCalendarAlt, FaLayerGroup, FaPlus, FaFilter, FaTimes, FaGraduationCap } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { handleSupabaseError, supabase } from '../../services/supabase';
import { MasterclassReservation } from '../../types';
import { isMasterclassSales } from '../../services/auth';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';
import { 
  getMasterclassSchedules, 
  addMasterclassSchedule, 
  toggleMasterclassScheduleActive, 
  deleteMasterclassSchedule, 
  updateMasterclassSchedule,
  MasterclassScheduleOption,
  LearningModeConfig,
  DEFAULT_LEARNING_MODES
} from '../../services/masterclassSchedules';
import { EthiopianDatePicker } from '../../Components/ui/EthiopianDatePicker';
import { toEthiopianDate } from '../../utils/ethiopianCalendar';

const REFERRAL_PRICE = 10000;
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
  const [updatedByFilter, setUpdatedByFilter] = useState<string>('all');
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
  // Referral link generator
  const [showReferralPanel, setShowReferralPanel] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const generatedRefLink = referralInput.trim()
    ? `${window.location.origin}/masterclass-registration?ref=${encodeURIComponent(referralInput.trim().replace(/\s+/g, '_').toLowerCase())}`
    : '';
  const generatedDashLink = referralInput.trim()
    ? `${window.location.origin}/masterclass/ref/${encodeURIComponent(referralInput.trim().replace(/\s+/g, '_').toLowerCase())}`
    : '';
  const handleCopyRef = () => {
    if (!generatedRefLink) return;
    navigator.clipboard.writeText(generatedRefLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };
  // Email system state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailRecipientType, setEmailRecipientType] = useState<'individual' | 'all'>('individual');
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [shouldUpdateStatus, setShouldUpdateStatus] = useState(false);
  const [isSales, setIsSales] = useState(false);

  // Schedule Management & Breakdown State
  const [schedules, setSchedules] = useState<MasterclassScheduleOption[]>([]);
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [modesConfig, setModesConfig] = useState<LearningModeConfig[]>(DEFAULT_LEARNING_MODES);

  useEffect(() => {
    const checkRole = async () => {
      const sales = await isMasterclassSales();
      setIsSales(sales);
    };
    checkRole();
    loadSchedules();
    loadReservations();
  }, []);

  const loadSchedules = async () => {
    const options = await getMasterclassSchedules();
    setSchedules(options);
  };

  const handleToggleSchedule = async (id: string) => {
    try {
      const updated = await toggleMasterclassScheduleActive(id);
      setSchedules(updated);
    } catch (e) {
      console.error('Failed to toggle schedule:', e);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this schedule option?')) {
      try {
        const updated = await deleteMasterclassSchedule(id);
        setSchedules(updated);
      } catch (e) {
        console.error('Failed to delete schedule:', e);
      }
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newTime.trim()) {
      alert('Please enter a schedule option name and session time.');
      return;
    }
    try {
      const updated = await addMasterclassSchedule({
        label: newLabel.trim(),
        time: newTime.trim(),
        date: newDate || undefined,
        is_active: true,
        available_modes: modesConfig,
      });
      setSchedules(updated);
      setNewLabel('');
      setNewTime('');
      setNewDate('');
      setModesConfig(DEFAULT_LEARNING_MODES);
      setShowScheduleModal(false);
    } catch (e) {
      console.error('Failed to add schedule:', e);
      alert('Failed to save schedule. Please check your connection and try again.');
    }
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.masterclassReservations.getAll();
      // Only show DIRECT registrations (no referral code) on this page
      setReservations((data || []).filter(r => !r.referral_code));
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
      // If the reservation came via referral and is being accepted,
      // auto-set payment to full at the fixed 10k price
      const reservation = reservations.find(r => r.id === id);
      const isReferral = !!reservation?.referral_code;
      const autoReferralPayment = (isReferral && newStatus === 'accepted') ? {
        payment_status: 'full' as const,
        total_amount: REFERRAL_PRICE,
        paid_amount: REFERRAL_PRICE,
        remaining_amount: 0,
      } : {};

      const updated = await adminApi.masterclassReservations.updateStatus(id, newStatus as any, {
        notes: notes || undefined,
        selected_package: selectedPackage || undefined,
        communication_method: communicationMethod || undefined,
        follow_up_date: followUpDate || undefined,
        payment_completion_date: paymentCompletionDate || undefined,
        // referral auto-collect takes priority; otherwise use form values
        ...(!isReferral || newStatus !== 'accepted' ? {
          payment_status: paymentStatus,
          total_amount: totalAmount ? parseFloat(totalAmount) : undefined,
          paid_amount: paidAmount ? parseFloat(paidAmount) : undefined,
          remaining_amount: (totalAmount && paidAmount) ? (parseFloat(totalAmount) - parseFloat(paidAmount)) : undefined,
        } : autoReferralPayment),
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
        alert('No students in the current view have valid email addresses. Please ensure emails are recorded before sending.');
        return;
      }

      const { error } = await supabase.functions.invoke('send-masterclass-custom-email', {
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
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'reviewed':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  // ── YEAR BREAKDOWN ──
  const yearMap: Record<string, { total: number; accepted: number }> = {};
  reservations.forEach(r => {
    let yr = '2026';
    if (r.createdAt) {
      const dt = new Date(r.createdAt);
      if (!isNaN(dt.getFullYear())) yr = String(dt.getFullYear());
    } else if (r.preferred_schedule) {
      const match = r.preferred_schedule.match(/20\d\d/);
      if (match) yr = match[0];
    }
    if (!yearMap[yr]) yearMap[yr] = { total: 0, accepted: 0 };
    yearMap[yr].total++;
    if (r.status === 'accepted') yearMap[yr].accepted++;
  });
  const yearBreakdown = Object.entries(yearMap)
    .map(([label, s]) => ({ label, total: s.total, accepted: s.accepted }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // ── MONTH BREAKDOWN ──
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const monthMap: Record<string, { total: number; accepted: number; sortOrder: number }> = {};
  reservations.forEach(r => {
    let label = 'Sept 2026';
    let sortOrder = 202609;
    if (r.createdAt) {
      const dt = new Date(r.createdAt);
      if (!isNaN(dt.getTime())) {
        const m = monthNames[dt.getMonth()];
        const y = dt.getFullYear();
        label = `${m} ${y}`;
        sortOrder = y * 100 + (dt.getMonth() + 1);
      }
    }
    if (!monthMap[label]) monthMap[label] = { total: 0, accepted: 0, sortOrder };
    monthMap[label].total++;
    if (r.status === 'accepted') monthMap[label].accepted++;
  });
  const monthBreakdown = Object.entries(monthMap)
    .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
    .map(([label, s]) => ({ label, total: s.total, accepted: s.accepted }));

  // ── SCHEDULE OPTION BREAKDOWN ──
  const schedMap: Record<string, { total: number; accepted: number }> = {};
  reservations.forEach(r => {
    const sched = (r.preferred_schedule || 'Unassigned / Not Specified').trim();
    if (!schedMap[sched]) schedMap[sched] = { total: 0, accepted: 0 };
    schedMap[sched].total++;
    if (r.status === 'accepted') schedMap[sched].accepted++;
  });
  const totalResCount = reservations.length || 1;
  const scheduleBreakdown = Object.entries(schedMap)
    .map(([optionText, s]) => ({
      optionText,
      total: s.total,
      accepted: s.accepted,
      percentage: Math.round((s.total / totalResCount) * 100)
    }))
    .sort((a, b) => b.total - a.total);

  const filteredReservations = reservations.filter(res => {
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || res.place === regionFilter;
    const matchesPackage = packageFilter === 'all' || res.selected_package?.includes(packageFilter);
    const matchesUpdatedBy = updatedByFilter === 'all' || res.status_updated_by === updatedByFilter;
    const matchesSchedule = scheduleFilter === 'all' || 
      (scheduleFilter === 'unassigned' ? (!res.preferred_schedule || res.preferred_schedule.trim() === '') : res.preferred_schedule === scheduleFilter);
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

    return matchesStatus && matchesRegion && matchesPackage && matchesUpdatedBy && matchesSchedule && matchesSearch && matchesFollowUp;
  });

  const uniqueUpdatedBy = Array.from(new Set(reservations.map(r => r.status_updated_by).filter(Boolean))) as string[];

  const studentsWithEmail = filteredReservations.filter(r => r.email).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[70vh] bg-[#0B0F19] text-white">
          <div className="text-center p-8 rounded-3xl bg-[#1C2951]/80 border border-amber-500/20 backdrop-blur-xl shadow-2xl">
            <FaSpinner className="animate-spin text-4xl text-[#FFD447] mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Loading Masterclass Reservations...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* ── Brand Header Banner ── */}
        <div className="bg-gradient-to-r from-[#0B0F19] via-[#1C2951] to-[#0B0F19] border border-amber-500/20 rounded-3xl p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD447]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#FFD447] text-[10px] font-black uppercase tracking-wider mb-2">
                <FaGraduationCap /> Yenege Experience Architecture
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Masterclass <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD447] to-amber-300">Reservations</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Tablet-Optimized Executive Student Lead &amp; Registration Intelligence Portal</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {!isSales && (
                <button 
                  onClick={() => {
                    setEmailRecipientType('all');
                    setEmailSubject(`Update for ${statusFilter === 'all' ? 'All' : statusFilter} Students - Yenege Masterclass`);
                    setShowEmailModal(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#4a0e17] to-[#791a29] hover:from-[#6b1422] hover:to-[#912033] text-white px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-[#4a0e17]/30 border border-red-500/30 w-full sm:w-auto active:scale-95 min-h-[44px]"
                >
                  <FaEnvelope /> Email {statusFilter === 'all' ? 'All Students' : `All ${statusFilter}s`}
                </button>
              )}
              <div className="flex items-center justify-center gap-2 bg-amber-500/10 px-5 py-3.5 rounded-2xl border border-amber-500/30 w-full sm:w-auto min-h-[44px]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFD447] animate-pulse" />
                <span className="text-[#FFD447] text-xs sm:text-sm font-black">{reservations.length} Registered Students</span>
              </div>
            </div>
          </div>
        </div>

        {filteredReservations.length > 0 && (
          <div className="px-4 py-2.5 bg-[#1C2951]/70 border border-amber-500/20 rounded-2xl inline-flex items-center gap-2 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-[#FFD447]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
              {studentsWithEmail} / {filteredReservations.length} candidates in view have email addresses
            </span>
          </div>
        )}

        {/* ── MASTERCLASS MANAGER CONTROL: ACTIVE START DATE & TIME OPTIONS ── */}
        {!isSales && (
          <section className="bg-gradient-to-br from-slate-950 via-[#1C2951] to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-amber-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD447]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[#FFD447] text-[10px] font-black uppercase tracking-wider">
                  <FaCalendarAlt /> Masterclass Schedule Controller
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">Active Session Options</h3>
                <p className="text-xs text-slate-300 font-medium">Manage program dates and session times for Question 6 on the registration form.</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD447] to-amber-500 hover:from-amber-400 hover:to-[#FFD447] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 self-start md:self-auto min-h-[44px]"
              >
                <FaPlus /> Create New Session Option
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map((sched) => {
                const countForSched = scheduleBreakdown.find(s => s.optionText === sched.val)?.total || 0;
                const isFilterActive = scheduleFilter === sched.val;
                return (
                  <div 
                    key={sched.id} 
                    className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 ${
                      isFilterActive
                        ? 'bg-amber-500/20 border-[#FFD447] ring-2 ring-amber-500/40 shadow-xl'
                        : sched.is_active 
                        ? 'bg-slate-900/60 border-white/10 hover:border-amber-500/50' 
                        : 'bg-white/5 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${sched.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                          <h4 className="text-sm font-extrabold text-white">{sched.label}</h4>
                        </div>
                        <p className="text-xs text-[#FFD447] font-semibold">{sched.time}</p>
                        {sched.date && (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">GC: {sched.date}</span>
                            {toEthiopianDate(sched.date) && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                                🇪🇹 {toEthiopianDate(sched.date)?.formattedAmharic}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSchedule(sched.id)}
                          title={sched.is_active ? 'Disable Schedule' : 'Enable Schedule'}
                          className={`p-2.5 rounded-xl text-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                            sched.is_active 
                              ? 'text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30' 
                              : 'text-slate-400 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {sched.is_active ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(sched.id)}
                          title="Remove Option"
                          className="p-2.5 rounded-xl text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-xs min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-300">
                      <button
                        onClick={() => setScheduleFilter(isFilterActive ? 'all' : sched.val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isFilterActive ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-amber-300 hover:bg-white/20'
                        }`}
                      >
                        {isFilterActive ? 'Filtered view' : 'Filter by this session'}
                      </button>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-[#FFD447] font-black border border-amber-500/30 text-xs">
                        {countForSched} Student{countForSched !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── REFERRAL PANEL & FILTERS SECTION ── */}
        <div className="bg-[#1C2951]/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-amber-500/20 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#FFD447]">Control &amp; Filters</h2>
              <p className="text-lg font-black text-white">Student Lead Navigation &amp; Referral Generator</p>
            </div>
            {!isSales && (
              <button
                onClick={() => setShowReferralPanel(!showReferralPanel)}
                className="px-5 py-3 rounded-2xl bg-[#4a0e17] hover:bg-[#6b1422] text-white font-black text-xs uppercase tracking-wider transition-all border border-red-500/30 flex items-center justify-center gap-2 self-start sm:self-auto min-h-[44px]"
              >
                <FaLink /> {showReferralPanel ? 'Hide Referral Generator' : 'Generate Marketer Link'}
              </button>
            )}
          </div>

          {/* Referral Panel */}
          {showReferralPanel && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-4">
              <h3 className="text-sm font-black text-[#FFD447] uppercase tracking-wider">Create Tracked Referral Code</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter marketer name or code (e.g. abeba_m)..."
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-bold placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#FFD447]"
                />
                {generatedRefLink && (
                  <button
                    onClick={handleCopyRef}
                    className="px-6 py-3.5 bg-gradient-to-r from-[#FFD447] to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-95 transition-all shadow-lg min-h-[44px]"
                  >
                    {copiedRef ? '✓ Link Copied!' : 'Copy Link'}
                  </button>
                )}
              </div>
              {generatedRefLink && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Registration Link:</p>
                  <p className="text-xs font-mono text-amber-300 break-all">{generatedRefLink}</p>
                </div>
              )}
            </div>
          )}

          {/* Filters Grid: Tablet-Optimized (2-col sm, 3-col md, 4-col lg, 5-col xl) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-1.5">Search Student</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-sm font-bold placeholder-slate-400 focus:ring-2 focus:ring-[#FFD447] outline-none transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-1.5">Follow-up Status</label>
              <select
                value={followUpFilter}
                onChange={(e) => setFollowUpFilter(e.target.value as any)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[44px]"
              >
                <option value="all">All Leads</option>
                <option value="today">Call Today 📞</option>
                <option value="overdue">Overdue ⚠️</option>
                <option value="none">No Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-1.5">Registration Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[44px]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-1.5">Region</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[44px]"
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-1.5">Package Choice</label>
              <select
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[44px]"
              >
                <option value="all">All Packages</option>
                <option value="Basic">Basic Package</option>
                <option value="Intermediate">Intermediate Package</option>
                <option value="Premium">Premium Package</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-1.5">Updated By</label>
              <select
                value={updatedByFilter}
                onChange={(e) => setUpdatedByFilter(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[44px]"
              >
                <option value="all">Everyone</option>
                {uniqueUpdatedBy.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-1.5">Schedule Choice (Q6)</label>
              <select
                value={scheduleFilter}
                onChange={(e) => setScheduleFilter(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-amber-300 text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[44px]"
              >
                <option value="all">All Schedule Choices</option>
                <option value="unassigned">Unassigned / Not Specified</option>
                {scheduleBreakdown.map(s => (
                  <option key={s.optionText} value={s.optionText}>
                    {s.optionText} ({s.total} Students)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Schedule Filter Banner */}
        {scheduleFilter !== 'all' && (
          <div className="p-4 bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl flex items-center justify-between flex-wrap gap-3 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                <FaFilter />
              </div>
              <div>
                <p className="text-xs font-black text-[#FFD447]">Filtered by Session Choice (Question 6)</p>
                <p className="text-xs text-slate-200 font-bold">{scheduleFilter}</p>
              </div>
            </div>
            <button
              onClick={() => setScheduleFilter('all')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5 min-h-[44px]"
            >
              <FaTimes size={12} /> Clear Filter ({filteredReservations.length} Candidates)
            </button>
          </div>
        )}

        {error && (
          <NetworkErrorBanner 
            message={error} 
            onRetry={loadReservations} 
          />
        )}

        {/* ── Student Reservations View: Responsive Table on Tablets (md:) + Card View for Mobile ── */}
        <div className="bg-[#1C2951]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-white">
          {filteredReservations.length === 0 ? (
            <div className="p-16 text-center">
              <FaCalendarAlt className="text-6xl text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-lg font-bold">No candidate reservations match these filters</p>
            </div>
          ) : (
            <>
              {/* TABLET & DESKTOP TABLE VIEW (Visible on tablet screens md: and up) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-950/80 border-b border-white/10 text-[#FFD447]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Student Candidate</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Age / Sex</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Follow-up</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Region</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Payment</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-900/40">
                    {filteredReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-amber-500/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-11 w-11 rounded-2xl bg-gradient-to-br from-[#4a0e17] to-[#791a29] border border-red-500/30 flex items-center justify-center text-white font-black text-base shadow-lg shadow-[#4a0e17]/40">
                              {res.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-white tracking-tight">{res.name}</div>
                              <a href={`tel:${res.phone}`} className="text-xs text-amber-300 font-semibold hover:underline block">
                                {res.phone}
                              </a>
                              {res.email && <div className="text-[10px] text-slate-300">{res.email}</div>}
                              {res.referral_code && (
                                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[9px] font-black uppercase tracking-wider text-violet-300">
                                  <FaLink size={8} /> {res.referral_code}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-white">{res.age} yrs</div>
                          <div className="text-xs text-slate-400 uppercase font-black">{res.sex}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {res.follow_up_date ? (
                            <div>
                              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                new Date(res.follow_up_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'text-rose-400' : 
                                new Date(res.follow_up_date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) ? 'text-amber-400' : 'text-indigo-400'
                              }`}>
                                {new Date(res.follow_up_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? '⚠️ Overdue' : 
                                 new Date(res.follow_up_date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) ? '📞 Call Today' : '📅 Planned'}
                              </div>
                              <div className="text-xs font-bold text-slate-200">{new Date(res.follow_up_date).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 uppercase">None set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-200">{res.place}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-black rounded-full border ${getStatusColor(res.status)}`}>
                            {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {res.payment_status ? (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              res.payment_status === 'full' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                              res.payment_status === 'partial' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                              'bg-slate-700/50 text-slate-300 border-slate-600'
                            }`}>
                              {res.payment_status}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Unpaid</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium">
                          {formatDate(res.createdAt).split(',')[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(res)}
                              className="p-2.5 rounded-xl bg-amber-500/10 text-[#FFD447] hover:bg-amber-500/20 border border-amber-500/30 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                              title="View & Edit Lead Details"
                            >
                              <FaEye className="text-base" />
                            </button>
                            {res.status !== 'accepted' && (
                              <button
                                onClick={() => handleStatusUpdate(res.id, 'accepted')}
                                disabled={updatingIds.has(res.id)}
                                className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors disabled:opacity-50 min-w-[40px] min-h-[40px] flex items-center justify-center"
                                title="Accept Registration"
                              >
                                {updatingIds.has(res.id) ? <FaSpinner className="animate-spin" /> : <FaCheck className="text-base" />}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedReservation(res);
                                setEmailRecipientType('individual');
                                setEmailSubject(`Update for ${res.name} - Yenege Masterclass`);
                                setShowEmailModal(true);
                              }}
                              className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                              title="Send direct email"
                            >
                              <FaEnvelope className="text-base" />
                            </button>
                            {!isSales && (
                              <button
                                onClick={() => handleDelete(res.id)}
                                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                                title="Delete Lead"
                              >
                                <FaTrash className="text-base" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Visible on screens < md) */}
              <div className="block md:hidden divide-y divide-slate-800 bg-[#0B0F19]">
                {filteredReservations.map((res) => (
                  <div key={res.id} className="p-4 hover:bg-amber-50/20 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-[#4a0e17] to-[#791a29] flex items-center justify-center text-white font-black shadow-lg shadow-[#4a0e17]/20">
                          {res.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{res.name}</h3>
                          <a href={`tel:${res.phone}`} className="text-xs text-[#4a0e17] font-semibold hover:underline block truncate">
                            {res.phone}
                          </a>
                          {res.email && <p className="text-[10px] text-gray-500 truncate">{res.email}</p>}
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] leading-5 font-bold rounded-full border flex-shrink-0 ${getStatusColor(res.status)}`}>
                        {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-gray-50 py-2">
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Age / Sex</span>
                        <span className="font-bold text-gray-700">{res.age} yrs • {res.sex.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Location</span>
                        <span className="font-bold text-gray-700">{res.place}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Payment Status</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          res.payment_status === 'full' ? 'bg-green-100 text-green-800 border-green-200' :
                          res.payment_status === 'partial' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {res.payment_status || 'unpaid'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Registration Date</span>
                        <span className="text-gray-500 font-medium">{formatDate(res.createdAt).split(',')[0]}</span>
                      </div>
                    </div>

                    {res.follow_up_date && (
                      <div className="bg-slate-900/90 p-3 rounded-xl flex items-center justify-between border border-slate-700/80">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-[#FFD447] text-xs" />
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase tracking-wider leading-none mb-0.5">Follow-up</span>
                            <span className="text-xs font-bold text-slate-200">{new Date(res.follow_up_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          new Date(res.follow_up_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 
                          new Date(res.follow_up_date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {new Date(res.follow_up_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? '⚠️ Overdue' : 
                           new Date(res.follow_up_date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0) ? '📞 Call Today' : '📅 Planned'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 gap-2">
                      <a
                        href={`tel:${res.phone}`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-black hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors shadow-sm min-h-[44px]"
                      >
                        <FaPhoneAlt className="text-xs" /> Call Student
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(res)}
                          className="p-2.5 rounded-xl bg-amber-500/20 text-[#FFD447] hover:bg-amber-500/30 border border-amber-500/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title="View/Edit full details"
                        >
                          <FaEye size={16} />
                        </button>
                        {res.status !== 'accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(res.id, 'accepted')}
                            disabled={updatingIds.has(res.id)}
                            className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Accept"
                          >
                            {updatingIds.has(res.id) ? <FaSpinner className="animate-spin" /> : <FaCheck size={16} />}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReservation(res);
                            setEmailRecipientType('individual');
                            setEmailSubject(`Update for ${res.name} - Yenege Masterclass`);
                            setShowEmailModal(true);
                          }}
                          className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title="Send individual email"
                        >
                          <FaEnvelope size={16} />
                        </button>
                        {!isSales && (
                          <button
                            onClick={() => handleDelete(res.id)}
                            className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Candidate Details Modal: Luxury Dark Tablet Layout ── */}
        {showModal && selectedReservation && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-[#0B0F19] text-white rounded-[2rem] max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-black/80 relative border border-amber-500/30">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#FFD447] to-amber-500" />
              <div className="sticky top-0 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/10 p-5 sm:p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4a0e17] to-[#791a29] border border-red-500/30 flex items-center justify-center text-white text-xl font-black shadow-lg">
                    {selectedReservation.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{selectedReservation.name}</h2>
                    <p className="text-xs font-bold text-[#FFD447] uppercase tracking-widest">Masterclass Candidate Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelectedReservation(null); }}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="bg-[#1C2951]/80 p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD447] border-b border-white/10 pb-2">Profile Overview</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">FullName &amp; Phone</p>
                        <p className="text-sm font-bold text-white uppercase">{selectedReservation.name}</p>
                        <a href={`tel:${selectedReservation.phone}`} className="text-xs font-bold text-amber-300 hover:underline">{selectedReservation.phone}</a>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Age &amp; Gender</p>
                        <p className="text-sm font-bold text-white">{selectedReservation.age} years, {selectedReservation.sex}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Current Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border inline-block mt-1 ${getStatusColor(selectedReservation.status)}`}>
                          {selectedReservation.status}
                        </span>
                      </div>
                      {selectedReservation.selected_package && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Package</p>
                          <p className="text-sm font-bold text-white">{selectedReservation.selected_package}</p>
                        </div>
                      )}
                      {selectedReservation.follow_up_date && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Follow-up Date</p>
                          <p className="text-sm font-bold text-amber-300">{new Date(selectedReservation.follow_up_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      {selectedReservation.payment_status && (
                        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700/80 mt-2">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Financial Status</p>
                          <p className="text-sm font-bold text-[#FFD447] capitalize">{selectedReservation.payment_status}</p>
                          {selectedReservation.total_amount && (
                            <p className="text-xs text-slate-300 mt-0.5">
                              Paid: {selectedReservation.paid_amount?.toLocaleString()} / Total: {selectedReservation.total_amount?.toLocaleString()} ETB
                            </p>
                          )}
                        </div>
                      )}
                      {selectedReservation.referral_code && (
                        <div className="p-3 bg-violet-950/40 rounded-2xl border border-violet-500/30 flex items-center justify-between gap-2 mt-2">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-violet-300">Referred Via</p>
                            <p className="text-xs font-black text-violet-200">{selectedReservation.referral_code}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="bg-[#1C2951]/80 p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD447] border-b border-white/10 pb-2">Location &amp; Notes</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Region/Place</p>
                        <p className="text-sm font-bold text-white">{selectedReservation.place}</p>
                      </div>
                      {selectedReservation.notes && (
                        <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Admin Notes</p>
                          <p className="text-xs text-slate-300 italic">"{selectedReservation.notes}"</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Program Preferences */}
                  <section className="bg-[#1C2951]/80 p-6 rounded-3xl border border-white/10 md:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD447] border-b border-white/10 pb-2">Registration Intelligence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {selectedReservation.describe_you && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Identity / Role</p>
                          <p className="font-bold text-white mt-0.5">{selectedReservation.describe_you}</p>
                        </div>
                      )}
                      {selectedReservation.learning_mode && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Learning Delivery Preference</p>
                          <p className="font-bold text-[#FFD447] mt-0.5">{selectedReservation.learning_mode}</p>
                        </div>
                      )}
                      {selectedReservation.preferred_schedule && (
                        <div className="md:col-span-2">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Session Schedule Choice (Q6)</p>
                          <p className="font-bold text-amber-300 mt-0.5">{selectedReservation.preferred_schedule}</p>
                        </div>
                      )}
                      {selectedReservation.event_types && (
                        <div className="md:col-span-2">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Event Interests</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {selectedReservation.event_types.split(', ').map((type) => (
                              <span key={type} className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedReservation.learning_goals && (
                        <div className="md:col-span-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 mt-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Learning &amp; Career Goals</p>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">{selectedReservation.learning_goals}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Form Actions for Manager */}
                <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-700 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD447] border-b border-slate-800 pb-2">Update Candidate Record</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Package Choice</label>
                      <select 
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
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
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400">Payment Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</label>
                        <select 
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value as any)}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
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
                          className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Paid Amount (ETB)</label>
                        <input 
                          type="number"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Interaction Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add details about the conversation..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[100px]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {(['reviewed', 'accepted', 'rejected'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(selectedReservation.id, s)}
                        disabled={updatingIds.has(selectedReservation.id) || (selectedReservation.status === s && !notes && !selectedPackage)}
                        className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border shadow-md min-h-[44px] ${
                          selectedReservation.status === s
                            ? getStatusColor(s) + ' opacity-50 cursor-default'
                            : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-[#FFD447] hover:text-[#FFD447]'
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

        {/* ── EMAIL MODAL (Luxury Dark) ── */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-[#0B0F19] text-white rounded-[2rem] max-w-lg w-full shadow-2xl relative overflow-hidden border border-amber-500/30">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#4a0e17] to-[#791a29] flex items-center justify-center text-white">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Send Direct Email</h2>
                    <p className="text-[10px] font-bold text-[#FFD447] uppercase tracking-widest">
                      {emailRecipientType === 'all' ? 'To All Candidates' : `To ${selectedReservation?.name}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#FFD447] mb-2">Message Body</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write message content..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-[#FFD447] outline-none min-h-[180px]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-900 transition-all min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FFD447] to-amber-500 text-slate-950 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {sendingEmail ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane /> Send Email</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE NEW SESSION OPTION MODAL (Dark Luxury) ── */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#0B0F19] text-white rounded-[2rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-black text-[#FFD447] uppercase tracking-widest">Question 6 Manager</span>
                  <h3 className="text-xl font-black text-white">Create New Session Option</h3>
                </div>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-900 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddSchedule} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    Session Option Name / Option #
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Option 5: Oct 12, 2026"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    Session Time / Days
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Session (9:00 AM - 12:00 PM)"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:ring-2 focus:ring-[#FFD447] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    Start Date (Ethiopian / Gregorian Calendar)
                  </label>
                  <EthiopianDatePicker
                    value={newDate}
                    onChange={(gcDate) => setNewDate(gcDate)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-900 transition-all min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD447] to-amber-500 text-slate-950 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg min-h-[44px]"
                  >
                    Save Option
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MasterclassReservations;
