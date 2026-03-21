import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaCheck, FaEye, FaMapPin, FaSpinner, FaTrash, FaUser, FaVenusMars } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { MasterclassReservation } from '../../types';

const MasterclassReservations = () => {
  const [reservations, setReservations] = useState<MasterclassReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<MasterclassReservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

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
      console.error('Error loading masterclass reservations:', error);
      setError(error?.message || 'Failed to load reservations. Please try again.');
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
    if (newStatus === 'pending') return; // Not supported by current API helper but can be added if needed
    
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      const updated = await adminApi.masterclassReservations.updateStatus(id, newStatus as any);

      setReservations(reservations.map(res =>
        res.id === id ? updated : res
      ));

      if (selectedReservation?.id === id) {
        setSelectedReservation(updated);
      }
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

  const filteredReservations = reservations.filter(res => {
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || res.place === regionFilter;
    return matchesStatus && matchesRegion;
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
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-800 text-sm font-bold">{reservations.length} Total Registered</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <button onClick={loadReservations} className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-medium">
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
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter by Region</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
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
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Location (Region)</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
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
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{res.age} yrs</div>
                        <div className="text-xs text-gray-500 uppercase font-black tracking-tighter">{res.sex}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{res.place}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(res.status)}`}>
                          {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(res.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => { setSelectedReservation(res); setShowModal(true); }}
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
                    </div>
                  </section>

                  <section className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600/50 mb-6 border-b border-indigo-200/50 pb-2">Location</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <FaMapPin className="text-indigo-500" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Region/Place</p>
                          <p className="text-sm font-bold text-gray-900">{selectedReservation.place}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-b border-slate-200 pb-2">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    {(['reviewed', 'accepted', 'rejected'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(selectedReservation.id, s)}
                        disabled={updatingIds.has(selectedReservation.id) || selectedReservation.status === s}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                          selectedReservation.status === s
                            ? getStatusColor(s) + ' cursor-default'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-500 hover:text-indigo-600'
                        }`}
                      >
                       {s}
                      </button>
                    ))}
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

export default MasterclassReservations;
