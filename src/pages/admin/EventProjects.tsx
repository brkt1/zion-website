import { useEffect, useState } from 'react';
import { FaCheck, FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, Event } from '../../services/api';
import { getOrganizerEvents, getUserRole } from '../../services/auth';
import { CreateEventProjectData, EventProject, UpdateEventProjectData } from '../../types';

const EventProjects = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [projects, setProjects] = useState<EventProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'event_organizer' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<EventProject | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [formData, setFormData] = useState<CreateEventProjectData>({
    event_id: '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignee_email: '',
    assignee_name: '',
    due_date: '',
  });

  useEffect(() => {
    if (!authLoading) {
      checkUserRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const checkUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
    
    if (!role || (role !== 'admin' && role !== 'event_organizer')) {
      window.location.href = '/admin/seller-dashboard';
      return;
    }
    
    loadEvents();
  };

  useEffect(() => {
    if (selectedEventId && userRole) {
      loadProjects();
    } else {
      setProjects([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, userRole]);

  const loadEvents = async () => {
    try {
      const allEvents = await api.getEvents();
      setEvents(allEvents);
      
      let filteredEvents: Event[] = [];
      
      // Filter events based on user role
      if (userRole === 'admin') {
        // Admins can see all events
        filteredEvents = allEvents;
      } else if (userRole === 'event_organizer') {
        // Event organizers can only see their assigned events
        const organizerEventIds = await getOrganizerEvents();
        filteredEvents = allEvents.filter(e => organizerEventIds.includes(e.id));
      }
      
      setAvailableEvents(filteredEvents);
      
      if (filteredEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(filteredEvents[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    if (!selectedEventId) return;
    try {
      const data = await adminApi.eventProjects.getByEventId(selectedEventId);
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await adminApi.eventProjects.update(editingProject.id, formData as UpdateEventProjectData);
      } else {
        await adminApi.eventProjects.create({
          ...formData,
          event_id: selectedEventId,
        });
      }
      setShowModal(false);
      setEditingProject(null);
      resetForm();
      loadProjects();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (project: EventProject) => {
    setEditingProject(project);
    setFormData({
      event_id: project.event_id,
      title: project.title,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      assignee_email: project.assignee_email || '',
      assignee_name: project.assignee_name || '',
      due_date: project.due_date || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await adminApi.eventProjects.delete(id);
      loadProjects();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleStatusChange = async (project: EventProject, newStatus: EventProject['status']) => {
    try {
      await adminApi.eventProjects.update(project.id, { status: newStatus });
      loadProjects();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      event_id: selectedEventId,
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignee_email: '',
      assignee_name: '',
      due_date: '',
    });
  };

  const getStatusColor = (status: EventProject['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: EventProject['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filterStatus !== 'all' && project.status !== filterStatus) return false;
    if (filterPriority !== 'all' && project.priority !== filterPriority) return false;
    return true;
  });

  const selectedEvent = availableEvents.find((e) => e.id === selectedEventId);
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const pendingCount = projects.filter((p) => p.status === 'pending').length;
  const progressPercentage = projects.length > 0 ? Math.round((completedCount / projects.length) * 100) : 0;

  if (loading) {
    return (
      <AdminLayout title="Event Project Management">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Event Project Management">
      {/* Event Selector */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
          {userRole === 'event_organizer' && (
            <span className="ml-2 text-xs text-gray-500">(Your assigned events only)</span>
          )}
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="block w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">-- Select an event --</option>
          {availableEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
        {userRole === 'event_organizer' && availableEvents.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            You haven't been assigned to any events yet. Contact an admin to get assigned.
          </p>
        )}
      </div>

      {selectedEvent && (
        <>
          {/* Progress Overview */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Tasks</div>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </div>
          </div>

          {/* Progress Bar */}
          {projects.length > 0 && (
            <div className="mb-6 bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingProject(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white transition-all shadow-md hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
            >
              <FaPlus />
              <span>Add Task</span>
            </button>
          </div>

          {/* Projects List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {projects.length === 0 ? (
                  <div>
                    <p className="mb-2">No tasks yet for this event.</p>
                    <p className="text-sm">Click "Add Task" to get started!</p>
                  </div>
                ) : (
                  <p>No tasks match the selected filters.</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const isOverdue = project.due_date && new Date(project.due_date) < new Date() && project.status !== 'completed';
                  return (
                    <div
                      key={project.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${project.status === 'completed' ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-2">
                            <button
                              onClick={() => {
                                const newStatus = project.status === 'completed' ? 'pending' : 'completed';
                                handleStatusChange(project, newStatus);
                              }}
                              className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                project.status === 'completed'
                                  ? 'bg-green-600 border-green-600'
                                  : 'border-gray-300 hover:border-green-600'
                              }`}
                            >
                              {project.status === 'completed' && <FaCheck className="text-white text-xs" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-lg font-semibold ${project.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {project.title}
                              </h3>
                              {project.description && (
                                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority.toUpperCase()}
                            </span>
                            {project.assignee_name && (
                              <span className="text-gray-600">
                                👤 {project.assignee_name}
                                {project.assignee_email && ` (${project.assignee_email})`}
                              </span>
                            )}
                            {project.due_date && (
                              <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                📅 Due: {new Date(project.due_date).toLocaleDateString()}
                                {isOverdue && ' (Overdue)'}
                              </span>
                            )}
                            {project.completed_at && (
                              <span className="text-sm text-gray-500">
                                ✓ Completed: {new Date(project.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-2 rounded hover:bg-gray-100 transition-colors"
                            style={{ color: '#FF6F5E' }}
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-2 rounded hover:bg-gray-100 transition-colors text-red-600"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {editingProject ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                  resetForm();
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EventProject['status'] })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as EventProject['priority'] })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee Name</label>
                  <input
                    type="text"
                    value={formData.assignee_name}
                    onChange={(e) => setFormData({ ...formData, assignee_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter assignee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee Email</label>
                  <input
                    type="email"
                    value={formData.assignee_email}
                    onChange={(e) => setFormData({ ...formData, assignee_email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter assignee email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-md transition-all shadow-md hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EventProjects;

