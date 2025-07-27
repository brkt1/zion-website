import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import useSWR from 'swr';
import { API_BASE_URL } from '../../services/api';
import LoadingSpinner from '../utility/LoadingSpinner';
import Error from '../utility/Error';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  route_access: string[];
}

const availableRoutes = [
  { id: 'trivia', name: 'Trivia Game', path: '/trivia-game' },
  { id: 'truth-dare', name: 'Truth or Dare', path: '/truth-or-dare' },
  { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', path: '/rock-paper-scissors' },
  { id: 'emoji', name: 'Emoji Game', path: '/emoji-game' },
  { id: 'lovers', name: 'Lovers Game', path: '/lovers' },
  { id: 'friends', name: 'Friends Game', path: '/friends' },
];

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch data');
  }
  return response.json();
};

const SuperAdminManageUserRoutes: React.FC = () => {
  const { session } = useAuthStore();
  const { data: users, error, isLoading, mutate } = useSWR<UserProfile[]>(
    session?.access_token ? [`${API_BASE_URL}/profile/all`, session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = (user: UserProfile) => {
    setEditingUserId(user.id);
    setSelectedRoutes(user.route_access || []);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRoutes([]);
  };

  const handleRouteToggle = (routeId: string) => {
    setSelectedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleUpdateRoutes = async () => {
    if (!editingUserId || !session?.access_token) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile/${editingUserId}/route-access`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ route_access: selectedRoutes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user routes');
      }

      alert('User routes updated successfully!');
      mutate(); // Revalidate SWR cache to refresh user list
      handleCancelEdit();
    } catch (err: any) {
      alert(`Error updating routes: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-gold-primary mb-6">Manage User Route Access</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gold-light">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gold-light">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gold-light">Current Routes</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gold-light">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users?.map(user => (
              <React.Fragment key={user.id}>
                <tr className="hover:bg-gray-700/50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{user.role}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {(user.route_access && user.route_access.length > 0)
                      ? user.route_access.map(routeId => 
                          availableRoutes.find(r => r.id === routeId)?.name || routeId
                        ).join(', ')
                      : 'None'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {editingUserId === user.id ? (
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 mr-2"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(user)}
                        className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Edit Routes
                      </button>
                    )}
                  </td>
                </tr>
                {editingUserId === user.id && (
                  <tr>
                    <td colSpan={4} className="p-4 bg-gray-700">
                      <div className="space-y-3">
                        <p className="text-gold-light font-semibold">Select Routes for {user.email}:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {availableRoutes.map(route => (
                            <div key={route.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`route-${user.id}-${route.id}`}
                                checked={selectedRoutes.includes(route.id)}
                                onChange={() => handleRouteToggle(route.id)}
                                className="mr-2 h-4 w-4 text-gold-primary focus:ring-gold-primary border-gray-300 rounded"
                              />
                              <label htmlFor={`route-${user.id}-${route.id}`} className="text-gray-300 cursor-pointer">
                                {route.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleUpdateRoutes}
                          disabled={isUpdating}
                          className={`mt-4 px-4 py-2 rounded-md w-full ${
                            isUpdating ? 'bg-green-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                        >
                          {isUpdating ? 'Updating...' : 'Save Routes'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminManageUserRoutes;
