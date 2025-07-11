import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../utility/LoadingSpinner';
import { API_BASE_URL } from '../../services/api';
import useSWR from 'swr';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch data');
  }

  return response.json();
};

const SuperAdminManageAdmins: React.FC = () => {
  const { session, profile, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'ADMIN' | 'CAFE_OWNER'>('ADMIN');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { data: admins, error: adminsError, isLoading: isLoadingAdmins, mutate: mutateAdmins } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/profile/all`, session.access_token] : null,
    ([url, token]) => fetcher(url, token),
    { 
      revalidateOnFocus: false, // Disable revalidation on focus for this list
      revalidateOnMount: true, // Revalidate on mount
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b) // Deep comparison for array data
    }
  );

  const { data: availablePermissions, error: permissionsError, isLoading: isLoadingPermissions } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/super-admin/permissions`, session.access_token] : null,
    ([url, token]) => fetcher(url, token),
    { 
      revalidateOnFocus: false, // Disable revalidation on focus for this list
      revalidateOnMount: true, // Revalidate on mount
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b) // Deep comparison for array data
    }
  );

  useEffect(() => {
    if (!authLoading) {
      if (!session || profile?.role !== 'SUPER_ADMIN') {
        navigate('/access-denied');
      }
    }
  }, [authLoading, session, profile, navigate]);

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionName)
        ? prev.filter(name => name !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          role: newAdminRole,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin user');
      }

      alert('Admin user created successfully!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminRole('ADMIN');
      setSelectedPermissions([]);
      mutateAdmins(); // Revalidate the admins list
    } catch (err: any) {
      alert(`Error: ${err.message || 'Failed to create admin user'}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (authLoading || isLoadingAdmins || isLoadingPermissions) {
    return <LoadingSpinner />;
  }

  if (adminsError || permissionsError) {
    return <div className="text-red-500 text-center mt-8">Error: {adminsError?.message || permissionsError?.message || 'An unexpected error occurred.'}</div>;
  }

  const filteredAdmins = admins?.filter(user => user.role === 'ADMIN' || user.role === 'CAFE_OWNER') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-purple-400">
          Manage Admin Users
        </h1>

        {/* Create New Admin Form */}
        <div className="mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Create New Admin</h2>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role</label>
              <select
                id="role"
                className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as 'ADMIN' | 'CAFE_OWNER')}
              >
                <option value="ADMIN">Admin</option>
                <option value="CAFE_OWNER">Cafe Owner</option>
              </select>
            </div>
            
            {/* Permissions Selection */}
            {newAdminRole === 'ADMIN' && availablePermissions && availablePermissions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-800 p-3 rounded-md border border-gray-600">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={permission.name}
                        checked={selectedPermissions.includes(permission.name)}
                        onChange={() => handlePermissionToggle(permission.name)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor={permission.name} className="ml-2 text-sm text-gray-300 cursor-pointer">
                        {permission.name.replace(/_/g, ' ').replace(/can /, 'Can ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isCreating ? 'bg-purple-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'}`}
            >
              {isCreating ? 'Creating...' : 'Create Admin User'}
            </button>
          </form>
        </div>

        {/* List Existing Admins */}
        <div className="p-6 bg-gray-700 rounded-lg border border-gray-600">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Existing Admin Users</h2>
          {filteredAdmins.length === 0 ? (
            <p className="text-center text-gray-400">No admin users to display.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Role</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b border-gray-600 last:border-b-0">
                      <td className="py-3 px-4 text-sm text-gray-300">{admin.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{admin.role}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{admin.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminManageAdmins;