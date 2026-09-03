import { useEffect, useState } from 'react';
import {
  FaBriefcase, FaCalendarAlt, FaCheck, FaClock, FaEnvelope,
  FaEye, FaHandsHelping, FaInfoCircle, FaPhone, FaSearch,
  FaSpinner, FaTimes, FaTrash, FaUser, FaUserCircle
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';
import { adminApi } from '../../services/adminApi';
import { handleSupabaseError } from '../../services/supabase';
import { Application } from '../../types';

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'internship' | 'volunteer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.applications.getAll();
      setApplications(data || []);
    } catch (err: any) {
      const handled = handleSupabaseError(err, 'loadApplications');
      setError(handled.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await adminApi.applications.delete(id);
      setApplications(applications.filter(app => app.id !== id));
      if (selectedApplication?.id === id) {
        setShowModal(false);
        setSelectedApplication(null);
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('Failed to delete application. Please try again.');
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    if (!selectedApplication) return;
    setUpdatingStatus(true);
    try {
      const updated = await adminApi.applications.update(selectedApplication.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      setApplications(applications.map(app => app.id === selectedApplication.id ? updated : app));
      setSelectedApplication(updated);
      alert(`Status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleQuickStatusUpdate = async (id: string, newStatus: 'accepted' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'accepted' ? 'accept' : 'reject'} this candidate?`)) return;
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      const updated = await adminApi.applications.update(id, { status: newStatus });
      setApplications(applications.map(app => app.id === id ? updated : app));
      if (selectedApplication?.id === id) setSelectedApplication(updated);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300';
      case 'rejected':
        return 'bg-rose-500/15 text-rose-700 border-rose-300';
      case 'reviewed':
        return 'bg-blue-500/15 text-blue-700 border-blue-300';
      default:
        return 'bg-amber-500/15 text-amber-800 border-amber-300';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesType = typeFilter === 'all' || app.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.position && app.position.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout title="Job & Volunteer Applications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
            <FaSpinner className="animate-spin text-4xl text-[#1C2951] mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Applications...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Applications Management">
      <div className="space-y-6">

        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-[#1C2951] via-[#2b3a67] to-[#1C2951] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#FFD447]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[#FFD447] text-[10px] font-black uppercase tracking-wider mb-2">
                <FaBriefcase /> Candidate Talent Management
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Internship &amp; <span className="text-[#FFD447]">Volunteer</span> Submissions
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-1">Review candidate qualifications, schedule interviews, and update team statuses.</p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 self-start md:self-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-white">{applications.length} Total Applicants</span>
            </div>
          </div>
        </div>

        {error && <NetworkErrorBanner message={error} onRetry={loadApplications} />}

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Search */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Search Candidate</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search by name, email, position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD447]/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]/50 transition-all"
              >
                <option value="all">All Types</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]/50 transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

          </div>
        </div>

        {/* Applications List Grid / Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-16 text-center">
              <FaBriefcase className="text-5xl text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-sm">No applications matching current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Track</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1C2951] to-slate-800 text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0">
                            {app.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{app.name}</p>
                            {app.position && <p className="text-xs text-slate-500 font-medium">{app.position}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold capitalize ${
                          app.type === 'internship' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {app.type === 'internship' ? <FaBriefcase size={11} /> : <FaHandsHelping size={11} />}
                          {app.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FaEnvelope className="text-slate-400" size={11} /> {app.email}
                        </p>
                        {app.phone && (
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <FaPhone className="text-slate-400" size={11} /> {app.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedApplication(app); setShowModal(true); setStatusNotes(app.notes || ''); }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#1C2951] text-slate-600 hover:text-white transition-all shadow-sm"
                            title="View Full Details"
                          >
                            <FaEye size={13} />
                          </button>
                          {app.status !== 'accepted' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(app.id, 'accepted')}
                              disabled={updatingIds.has(app.id)}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                              title="Accept Candidate"
                            >
                              {updatingIds.has(app.id) ? <FaSpinner className="animate-spin" size={13} /> : <FaCheck size={13} />}
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(app.id, 'rejected')}
                              disabled={updatingIds.has(app.id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                              title="Reject Candidate"
                            >
                              {updatingIds.has(app.id) ? <FaSpinner className="animate-spin" size={13} /> : <FaTimes size={13} />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-400 hover:text-white transition-all shadow-sm"
                            title="Delete"
                          >
                            <FaTrash size={13} />
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

        {/* Modern Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C2951] to-slate-800 text-white font-black text-lg flex items-center justify-center shadow-lg">
                    {selectedApplication.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedApplication.name}</h3>
                    <p className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">
                      {selectedApplication.type} Application
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelectedApplication(null); setStatusNotes(''); }}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* Candidate Info Card */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                    <p className="text-sm font-black text-slate-800 break-all">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Contact</p>
                    <p className="text-sm font-black text-slate-800">{selectedApplication.phone || 'N/A'}</p>
                  </div>
                  {selectedApplication.position && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Role / Interest</p>
                      <p className="text-sm font-black text-slate-800">{selectedApplication.position}</p>
                    </div>
                  )}
                  {selectedApplication.availability && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</p>
                      <p className="text-sm font-black text-slate-800">{selectedApplication.availability}</p>
                    </div>
                  )}
                </div>

                {/* Experience & Motivation */}
                {selectedApplication.experience && (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Experience & Background</p>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedApplication.experience}</p>
                  </div>
                )}

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Motivation Statement</p>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedApplication.motivation}</p>
                </div>

                {/* Update Status & Notes */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#FFD447]">Update Application Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'reviewed', 'accepted', 'rejected'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusUpdate(st)}
                        disabled={updatingStatus || selectedApplication.status === st}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 border ${
                          selectedApplication.status === st
                            ? 'bg-[#FFD447] text-slate-950 border-[#FFD447]'
                            : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Curator Notes</label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Add notes regarding candidate review..."
                      className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                      rows={3}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Applications;


