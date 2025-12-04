import { useEffect, useState } from 'react';
import { FaBook, FaBriefcase, FaCalendarAlt, FaCheck, FaCheckCircle, FaEnvelope, FaEye, FaGraduationCap, FaHandsHelping, FaPhone, FaSpinner, FaTimes, FaTrash, FaUser } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { Application } from '../../types';

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'internship' | 'volunteer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [learningProgress, setLearningProgress] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.applications.getAll();
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error loading applications:', error);
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
      await adminApi.applications.delete(id);
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
      const updated = await adminApi.applications.update(selectedApplication.id, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      
      // Update the application in the list
      setApplications(applications.map(app => 
        app.id === selectedApplication.id ? updated : app
      ));
      
      // Update the selected application
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
      const updated = await adminApi.applications.update(id, {
        status: newStatus,
      });
      
      // Update the application in the list
      setApplications(applications.map(app => 
        app.id === id ? updated : app
      ));
      
      // Update selected application if it's the one being updated
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

  const loadLearningProgress = async (email: string) => {
    setLoadingProgress(true);
    try {
      const progress = await adminApi.applications.getLearningProgress(email);
      setLearningProgress(progress);
    } catch (error: any) {
      console.error('Error loading learning progress:', error);
      setLearningProgress({
        hasAccount: false,
        progress: [],
        stats: {
          totalLessons: 0,
          completedLessons: 0,
          viewedLessons: 0,
          completionPercentage: 0,
          viewPercentage: 0,
        },
      });
    } finally {
      setLoadingProgress(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const typeMatch = filter === 'all' || app.type === filter;
    const statusMatch = statusFilter === 'all' || app.status === statusFilter;
    return typeMatch && statusMatch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
          <p className="text-gray-600">Manage internship and volunteer applications</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error: {error}</p>
            <button
              onClick={loadApplications}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {!error && !loading && applications.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">No applications found. Applications will appear here once submitted.</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'internship' | 'volunteer')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
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
              <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {application.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{application.name}</div>
                            {application.position && (
                              <div className="text-sm text-gray-500">{application.position}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {application.type === 'internship' ? (
                            <FaBriefcase className="text-blue-600 mr-2" />
                          ) : (
                            <FaHandsHelping className="text-green-600 mr-2" />
                          )}
                          <span className="text-sm text-gray-900 capitalize">{application.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {application.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaPhone className="mr-2 text-gray-400" />
                          {application.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {formatDate(application.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={async () => {
                              setSelectedApplication(application);
                              setShowModal(true);
                              // Load learning progress when opening modal
                              await loadLearningProgress(application.email);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View details"
                          >
                            View
                          </button>
                          {application.status !== 'accepted' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(application.id, 'accepted')}
                              disabled={updatingIds.has(application.id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Accept application"
                            >
                              {updatingIds.has(application.id) ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                          )}
                          {application.status !== 'rejected' && (
                            <button
                              onClick={() => handleQuickStatusUpdate(application.id, 'rejected')}
                              disabled={updatingIds.has(application.id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject application"
                            >
                              {updatingIds.has(application.id) ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaTimes />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(application.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete application"
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

        {/* Application Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedApplication(null);
                      setStatusNotes('');
                      setLearningProgress(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="flex items-center text-gray-900">
                      <FaUser className="mr-2 text-gray-400" />
                      {selectedApplication.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <div className="flex items-center text-gray-900">
                      {selectedApplication.type === 'internship' ? (
                        <FaBriefcase className="mr-2 text-blue-600" />
                      ) : (
                        <FaHandsHelping className="mr-2 text-green-600" />
                      )}
                      <span className="capitalize">{selectedApplication.type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center text-gray-900">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {selectedApplication.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center text-gray-900">
                      <FaPhone className="mr-2 text-gray-400" />
                      {selectedApplication.phone}
                    </div>
                  </div>
                  {selectedApplication.position && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position/Interest</label>
                      <p className="text-gray-900">{selectedApplication.position}</p>
                    </div>
                  )}
                  {selectedApplication.availability && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <p className="text-gray-900">{selectedApplication.availability}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Applied</label>
                    <div className="flex items-center text-gray-900">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      {formatDate(selectedApplication.created_at)}
                    </div>
                  </div>
                </div>
                {selectedApplication.experience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.experience}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivation</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.motivation}</p>
                </div>
                {selectedApplication.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.notes}</p>
                  </div>
                )}

                {/* Learning Progress Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaGraduationCap className="mr-2 text-blue-600" />
                    Learning Progress
                  </h3>
                  
                  {loadingProgress ? (
                    <div className="flex items-center justify-center py-8">
                      <FaSpinner className="animate-spin text-2xl text-blue-600 mr-3" />
                      <span className="text-gray-600">Loading learning progress...</span>
                    </div>
                  ) : learningProgress ? (
                    <div className="space-y-4">
                      {learningProgress.hasAccount ? (
                        <>
                          {/* Progress Statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Total Lessons</p>
                                  <p className="text-2xl font-bold text-gray-900">{learningProgress.stats.totalLessons}</p>
                                </div>
                                <FaBook className="text-3xl text-blue-500 opacity-50" />
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Completed</p>
                                  <p className="text-2xl font-bold text-gray-900">{learningProgress.stats.completedLessons}</p>
                                </div>
                                <FaCheckCircle className="text-3xl text-green-500 opacity-50" />
                              </div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Viewed</p>
                                  <p className="text-2xl font-bold text-gray-900">{learningProgress.stats.viewedLessons}</p>
                                </div>
                                <FaEye className="text-3xl text-purple-500 opacity-50" />
                              </div>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Completion</p>
                                  <p className="text-2xl font-bold text-gray-900">{learningProgress.stats.completionPercentage}%</p>
                                </div>
                                <FaGraduationCap className="text-3xl text-indigo-500 opacity-50" />
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full flex items-center justify-center"
                              style={{ width: `${learningProgress.stats.completionPercentage}%` }}
                            >
                              {learningProgress.stats.completionPercentage > 10 && (
                                <span className="text-xs font-semibold text-white">
                                  {learningProgress.stats.completionPercentage}%
                                </span>
                              )}
                            </div>
                          </div>
                          {learningProgress.stats.completionPercentage <= 10 && (
                            <p className="text-sm text-gray-600 text-center">
                              {learningProgress.stats.completionPercentage}% Complete
                            </p>
                          )}

                          {/* Progress Details by Week */}
                          {learningProgress.progress && learningProgress.progress.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Progress by Week</h4>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {Array.from(new Set(learningProgress.progress.map((p: any) => p.week_number)))
                                  .sort((a: any, b: any) => a - b)
                                  .map((weekNum: any) => {
                                    const weekProgress = learningProgress.progress.filter((p: any) => p.week_number === weekNum);
                                    const weekCompleted = weekProgress.filter((p: any) => p.completed).length;
                                    const weekTotal = weekProgress.length;
                                    const weekPercentage = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
                                    
                                    return (
                                      <div key={weekNum} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-900">Week {weekNum}</span>
                                          <span className="text-xs text-gray-600">
                                            {weekCompleted} / {weekTotal} lessons
                                          </span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                          <div
                                            className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${weekPercentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm">
                            <FaGraduationCap className="inline mr-2" />
                            This applicant hasn't created an account yet or hasn't started the learning program.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-600 text-sm">Click "View" to load learning progress.</p>
                    </div>
                  )}
                </div>
                
                {/* Status Update Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                          onClick={() => handleStatusUpdate('pending')}
                          disabled={updatingStatus || selectedApplication.status === 'pending'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedApplication.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('reviewed')}
                          disabled={updatingStatus || selectedApplication.status === 'reviewed'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedApplication.status === 'reviewed'
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                              : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Reviewed
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('accepted')}
                          disabled={updatingStatus || selectedApplication.status === 'accepted'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedApplication.status === 'accepted'
                              ? 'bg-green-100 text-green-800 border-2 border-green-300'
                              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('rejected')}
                          disabled={updatingStatus || selectedApplication.status === 'rejected'}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedApplication.status === 'rejected'
                              ? 'bg-red-100 text-red-800 border-2 border-red-300'
                              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                      <textarea
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Add notes about this status change..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
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

