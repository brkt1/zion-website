import { useEffect, useState } from 'react';
import { FaCheck, FaEnvelope, FaEye, FaGlobe, FaPhone, FaSpinner, FaTrash, FaUser } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { ExpoApplication } from '../../types';

const ExpoApplications = () => {
  const [applications, setApplications] = useState<ExpoApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ExpoApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
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
      const data = await adminApi.expoApplications.getAll();
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error loading expo applications:', error);
      setError(error?.message || 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      await adminApi.expoApplications.delete(id);
      setApplications(applications.filter(app => app.id !== id));
      if (selectedApplication?.id === id) {
        setShowModal(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application. Please try again.');
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    if (!selectedApplication) return;

    setUpdatingStatus(true);
    try {
      const updated = await adminApi.expoApplications.update(selectedApplication.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });

      setApplications(applications.map(app =>
        app.id === selectedApplication.id ? updated : app
      ));

      setSelectedApplication(updated);
      alert(`Status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleQuickStatusUpdate = async (id: string, newStatus: 'accepted' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'accepted' ? 'accept' : 'reject'} this application?`)) {
      return;
    }

    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      const updated = await adminApi.expoApplications.update(id, {
        status: newStatus,
      });

      setApplications(applications.map(app =>
        app.id === id ? updated : app
      ));

      if (selectedApplication?.id === id) {
        setSelectedApplication(updated);
      }

      alert(`Application ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
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

  const getBoothLabel = (type: string) => {
    switch (type) {
      case 'premium': return 'Premium Platinum';
      case 'standard': return 'Diamond Inline';
      case 'shared': return 'Shared / Creative';
      default: return type;
    }
  };

  const getPaymentLabel = (option: string) => {
    switch (option) {
      case 'full': return 'Pay Full Amount';
      case 'deposit': return 'Pay 50% Deposit';
      default: return option;
    }
  };

  const filteredApplications = applications.filter(app => {
    return statusFilter === 'all' || app.status === statusFilter;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-amber-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading exhibitor applications...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Expo Exhibitor Applications</h1>
            <p className="text-gray-600">Manage exhibitor registrations for Yene Ken Wedding Expo</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-800 text-sm font-bold">{applications.length} Total Applications</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <button onClick={loadApplications} className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-medium">
              Try again
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
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

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FaGlobe className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No exhibitor applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Company / contact</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Space</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-coral-500 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">
                            {app.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{app.companyName}</div>
                            <div className="text-xs text-gray-500">{app.contactPerson}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                          {app.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getBoothLabel(app.boothType)}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-tight">{getPaymentLabel(app.paymentOption || '')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => { setSelectedApplication(app); setShowModal(true); }}
                            className="text-amber-600 hover:text-amber-900 transition-colors"
                            title="View full details"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          {app.status !== 'accepted' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(app.id, 'accepted')}
                              disabled={updatingIds.has(app.id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Accept"
                            >
                              {updatingIds.has(app.id) ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(app.id)}
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
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-xl font-black">
                    {selectedApplication.companyName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedApplication.companyName}</h2>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Exhibitor Application</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelectedApplication(null); setStatusNotes(''); }}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-200 pb-2">Contact Details</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <FaUser className="text-amber-500" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Representative</p>
                            <p className="text-sm font-bold text-gray-900">{selectedApplication.contactPerson}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <FaEnvelope className="text-amber-500" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Email Address</p>
                            <p className="text-sm font-bold text-gray-900">{selectedApplication.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <FaPhone className="text-amber-500" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Direct Line</p>
                            <p className="text-sm font-bold text-gray-900">{selectedApplication.phone}</p>
                          </div>
                        </div>
                        {selectedApplication.socialMedia && (
                          <div className="flex items-center gap-4">
                            <FaGlobe className="text-amber-500" />
                            <div>
                              <p className="text-[10px] uppercase font-bold text-gray-400">Social Presence</p>
                              <p className="text-sm font-bold text-gray-900">{selectedApplication.socialMedia}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600/50 mb-6 border-b border-amber-200/50 pb-2">Space Allocation</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Booth Type</p>
                          <p className="text-lg font-black text-gray-900">{getBoothLabel(selectedApplication.boothType)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Niche / Category</p>
                          <span className="inline-block mt-1 px-3 py-1 bg-white text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200 shadow-sm">
                            {selectedApplication.category}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Preferred Payment</p>
                          <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{getPaymentLabel(selectedApplication.paymentOption || 'Not specified')}</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-200 pb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {(['pending', 'reviewed', 'accepted', 'rejected'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(s)}
                        disabled={updatingStatus || selectedApplication.status === s}
                        className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 border ${
                          selectedApplication.status === s
                            ? getStatusColor(s) + ' cursor-default'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-amber-500 hover:text-amber-600'
                        }`}
                      >
                        {updatingStatus && selectedApplication.status !== s ? <FaSpinner className="animate-spin inline" /> : s}
                      </button>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Curator Notes</label>
                    <input
                      type="text"
                      value={statusNotes || selectedApplication.notes || ''}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Internal notes about this applicant..."
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={async () => {
                        if (selectedApplication) {
                          setUpdatingStatus(true);
                          try {
                            const updated = await adminApi.expoApplications.update(selectedApplication.id, {
                              notes: statusNotes || selectedApplication.notes,
                            });
                            setApplications(applications.map(app => app.id === updated.id ? updated : app));
                            setSelectedApplication(updated);
                            alert('Notes saved successfully!');
                          } catch (err) {
                            alert('Failed to save notes');
                          } finally {
                            setUpdatingStatus(false);
                          }
                        }
                      }}
                      disabled={updatingStatus}
                      className="bg-amber-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                    >
                      {updatingStatus ? 'Saving...' : 'Save Notes'}
                    </button>
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

export default ExpoApplications;
