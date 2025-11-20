import { useEffect, useState } from 'react';
import { FaTimes, FaTrash, FaUserCheck, FaUserPlus } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, Event } from '../../services/api';
import { supabase } from '../../services/supabase';

interface EventOrganizer {
  id: string;
  event_id: string;
  user_id: string;
  user_email: string;
  created_at: string;
}

const EventOrganizers = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<EventOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [formData, setFormData] = useState({
    userEmail: '',
    eventId: '',
    autoAssignRole: true,
  });
  const [roleFormData, setRoleFormData] = useState({
    userEmail: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/seller-dashboard';
        return;
      }
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

  useEffect(() => {
    if (selectedEventId) {
      loadOrganizers();
    } else {
      setOrganizers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const loadData = async () => {
    try {
      const eventsData = await api.getEvents();
      setEvents(eventsData);
      if (eventsData.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizers = async () => {
    if (!selectedEventId) return;
    try {
      const data = await adminApi.eventOrganizers.getByEventId(selectedEventId);
      setOrganizers(data as EventOrganizer[]);
    } catch (error) {
      console.error('Error loading organizers:', error);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Try using RPC function first
      const { data, error } = await supabase.rpc('assign_event_organizer_role', {
        user_email: roleFormData.userEmail.toLowerCase(),
      });

      if (error) {
        // Fallback: Manual role assignment via direct insert
        // Note: This requires the user to exist in auth.users
        // We'll show a helpful error message
        throw new Error(`Unable to assign role automatically. Please ensure the user has signed up first, or assign the role manually in Supabase dashboard. Error: ${error.message}`);
      }

      alert('Event organizer role assigned successfully!');
      setShowRoleModal(false);
      setRoleFormData({ userEmail: '' });
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleAssignToEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.eventOrganizers.assign(
        formData.eventId,
        formData.userEmail,
        formData.autoAssignRole
      );
      alert('Organizer assigned to event successfully!');
      setShowAssignModal(false);
      setFormData({ userEmail: '', eventId: selectedEventId, autoAssignRole: true });
      loadOrganizers();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleUnassign = async (organizer: EventOrganizer) => {
    if (!window.confirm(`Are you sure you want to remove ${organizer.user_email} from this event?`)) return;
    try {
      await adminApi.eventOrganizers.unassign(organizer.event_id, organizer.user_id);
      loadOrganizers();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  if (loading) {
    return (
      <AdminLayout title="Event Organizers Management">
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
    <AdminLayout title="Event Organizers Management">
      {/* Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowRoleModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white transition-all shadow-md hover:shadow-lg bg-indigo-600 hover:bg-indigo-700"
        >
          <FaUserPlus />
          <span>Assign Event Organizer Role</span>
        </button>
        <button
          onClick={() => {
            setFormData({ userEmail: '', eventId: selectedEventId, autoAssignRole: true });
            setShowAssignModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white transition-all shadow-md hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
        >
          <FaUserCheck />
          <span>Assign Organizer to Event</span>
        </button>
      </div>

      {/* Event Selector */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="block w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">-- Select an event --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Organizers List */}
      {selectedEvent && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Organizers for: {selectedEvent.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {organizers.length} organizer(s) assigned
            </p>
          </div>
          {organizers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No organizers assigned to this event yet.</p>
              <p className="text-sm mt-2">Click "Assign Organizer to Event" to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {organizers.map((organizer) => (
                <div
                  key={organizer.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{organizer.user_email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Assigned on {new Date(organizer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnassign(organizer)}
                    className="p-2 rounded hover:bg-gray-100 transition-colors text-red-600"
                    title="Remove organizer"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assign Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Assign Event Organizer Role</h2>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setRoleFormData({ userEmail: '' });
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email *
                </label>
                <input
                  type="email"
                  required
                  value={roleFormData.userEmail}
                  onChange={(e) => setRoleFormData({ userEmail: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="user@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The user must have signed up first. This will grant them the event_organizer role.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setRoleFormData({ userEmail: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to Event Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Assign Organizer to Event</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setFormData({ userEmail: '', eventId: selectedEventId, autoAssignRole: true });
                }}
                className="p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignToEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="user@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The user must have the event_organizer role (or admin role).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event *
                </label>
                <select
                  required
                  value={formData.eventId || selectedEventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">-- Select an event --</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoAssignRole}
                    onChange={(e) => setFormData({ ...formData, autoAssignRole: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Automatically assign event_organizer role if user doesn't have it
                  </span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setFormData({ userEmail: '', eventId: selectedEventId, autoAssignRole: true });
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
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EventOrganizers;

