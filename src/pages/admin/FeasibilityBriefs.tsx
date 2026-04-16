import { useEffect, useState } from 'react';
import { FaBriefcase, FaClock, FaEye, FaMoneyBillWave, FaSpinner, FaTrash, FaUserCircle } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { FeasibilityBrief } from '../../types';

const AdminFeasibilityBriefs = () => {
  const [briefs, setBriefs] = useState<FeasibilityBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<FeasibilityBrief | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    loadBriefs();
  }, []);

  const loadBriefs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.feasibilityBriefs.getAll();
      setBriefs(data || []);
    } catch (error: any) {
      console.error('Error loading briefs:', error);
      setError(error?.message || 'Failed to load briefs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brief submission?')) {
      return;
    }

    try {
      await adminApi.feasibilityBriefs.delete(id);
      setBriefs(briefs.filter(b => b.id !== id));
      if (selectedBrief?.id === id) {
        setShowModal(false);
        setSelectedBrief(null);
      }
    } catch (error) {
      console.error('Error deleting brief:', error);
      alert('Failed to delete brief. Please try again.');
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    if (!selectedBrief) return;

    setUpdatingStatus(true);
    try {
      const updated = await adminApi.feasibilityBriefs.update(selectedBrief.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      
      setBriefs(briefs.map(b => b.id === selectedBrief.id ? updated : b));
      setSelectedBrief(updated);
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const filteredBriefs = briefs.filter(b => {
    return statusFilter === 'all' || b.status === statusFilter;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mr-4" />
          <p>Loading briefs...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Feasibility Briefs</h1>
          <p className="text-gray-600">Review technical feasibility and ROI assessments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBriefs.map((brief) => (
                  <tr key={brief.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{brief.contact_name}</div>
                      <div className="text-xs text-gray-500">{brief.contact_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{brief.event_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{brief.total_budget}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(brief.status)}`}>
                        {brief.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(brief.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button onClick={() => { setSelectedBrief(brief); setShowModal(true); }} className="text-blue-600 hover:text-blue-900"><FaEye /></button>
                      <button onClick={() => handleDelete(brief.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedBrief && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold">Brief Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center"><FaUserCircle className="mr-2 text-blue-600"/> Contact Info</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {selectedBrief.contact_name}</p>
                    <p><strong>Email:</strong> {selectedBrief.contact_email}</p>
                    <p><strong>Phone:</strong> {selectedBrief.contact_phone || 'N/A'}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center"><FaBriefcase className="mr-2 text-indigo-600"/> Event Scope</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Type:</strong> {selectedBrief.event_type}</p>
                    <p><strong>Proposed Date:</strong> {selectedBrief.proposed_date}</p>
                    <p><strong>Attendees:</strong> {selectedBrief.attendee_min} - {selectedBrief.attendee_max}</p>
                  </div>
                </section>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Primary Objective</h3>
                <div className="bg-gray-50 p-4 rounded-lg italic">"{selectedBrief.primary_objective}"</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center"><FaMoneyBillWave className="mr-2 text-green-600"/> Financials</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Total Budget:</strong> {selectedBrief.total_budget}</p>
                    <p><strong>Model:</strong> {selectedBrief.financial_model}</p>
                    <p><strong>Flexibility:</strong> {selectedBrief.budget_flexibility}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center"><FaClock className="mr-2 text-purple-600"/> Logistics</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Venue Status:</strong> {selectedBrief.venue_status}</p>
                    <p><strong>Duration:</strong> {selectedBrief.event_duration}</p>
                    <p><strong>Setup Window:</strong> {selectedBrief.setup_window}</p>
                  </div>
                </section>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Technical Priorities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBrief.technical_priorities.map((p, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{p}</span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['pending', 'reviewed', 'accepted', 'rejected'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(s as any)}
                      disabled={updatingStatus || selectedBrief.status === s}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border ${selectedBrief.status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeasibilityBriefs;
