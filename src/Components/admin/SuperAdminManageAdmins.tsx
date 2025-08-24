import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { API_BASE_URL } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../utility/LoadingSpinner';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  permission_name: string;
  granted_at: string;
  granted_by?: string;
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
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'ADMIN' | 'CAFE_OWNER'>('ADMIN');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const { data: admins, error: adminsError, isLoading: isLoadingAdmins, mutate: mutateAdmins } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/profile/all`, session.access_token] : null,
    ([url, token]) => fetcher(url, token),
    { 
      revalidateOnFocus: false,
      revalidateOnMount: true,
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b)
    }
  );

  const { data: availablePermissions, error: permissionsError, isLoading: isLoadingPermissions } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/super-admin/permissions`, session.access_token] : null,
    ([url, token]) => fetcher(url, token),
    { 
      revalidateOnFocus: false,
      revalidateOnMount: true,
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b)
    }
  );

  const { data: userPermissions, error: userPermissionsError, isLoading: isLoadingUserPermissions, mutate: mutateUserPermissions } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' && selectedUser ? [`${API_BASE_URL}/super-admin/user-permissions/${selectedUser}`, session.access_token] : null,
    ([url, token]) => fetcher(url, token),
    { 
      revalidateOnFocus: false,
      revalidateOnMount: true
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
          name: newAdminName,
          role: newAdminRole,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin user');
      }

      toast.success('Admin user created successfully!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminRole('ADMIN');
      setSelectedPermissions([]);
      mutateAdmins();
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to create admin user'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleUserPermission = async (userId: string, permissionId: string, hasPermission: boolean) => {
    if (!session) return;

    try {
      if (hasPermission) {
        // Revoke permission
        await fetch(`${API_BASE_URL}/super-admin/user-permissions`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: userId, permission_id: permissionId }),
        });
      } else {
        // Grant permission
        await fetch(`${API_BASE_URL}/super-admin/user-permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: userId, permission_id: permissionId }),
        });
      }

      mutateUserPermissions();
      toast.success(`Permission ${hasPermission ? 'revoked from' : 'granted to'} user`);
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to update user permission'}`);
    }
  };

  const handleDeleteAdmin = async (userId: string, userEmail: string) => {
    if (!session || !confirm(`Are you sure you want to delete admin user "${userEmail}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/delete-admin`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete admin user');
      }

      toast.success('Admin user deleted successfully!');
      mutateAdmins();
      if (selectedUser === userId) {
        setSelectedUser(null);
        setShowPermissionModal(false);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to delete admin user'}`);
    }
  };

  const openPermissionModal = (userId: string) => {
    setSelectedUser(userId);
    setShowPermissionModal(true);
  };

  if (authLoading || isLoadingAdmins || isLoadingPermissions) {
    return <LoadingSpinner />;
  }

  if (adminsError || permissionsError) {
    return <div className="text-red-500 text-center mt-8">Error: {adminsError?.message || permissionsError?.message || 'An unexpected error occurred.'}</div>;
  }

  const filteredAdmins = admins?.filter(user => user.role === 'ADMIN' || user.role === 'CAFE_OWNER') || [];
  const permissionsByCategory = availablePermissions?.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {}) || {};

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                />
              </div>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            {/* Permissions Selection */}
            {newAdminRole === 'ADMIN' && availablePermissions && availablePermissions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign Additional Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-gray-800 p-3 rounded-md border border-gray-600 max-h-40 overflow-y-auto">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={permission.name}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor={permission.name} className="ml-2 text-sm text-gray-300 cursor-pointer">
                        {permission.name.replace(/_/g, ' ').replace(/can /i, 'Can ')}
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
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Role</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Created</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b border-gray-600 last:border-b-0">
                      <td className="py-3 px-4 text-sm text-gray-300">{admin.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{admin.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.role === 'ADMIN' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openPermissionModal(admin.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Manage Permissions"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Admin"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

        {/* Permission Management Modal */}
        {showPermissionModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-purple-300">
                  Manage User Permissions
                </h3>
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {isLoadingUserPermissions ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <div key={category} className="border-l-4 border-gray-600 pl-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {categoryPermissions.map((permission) => {
                          const hasPermission = userPermissions?.some((up: UserPermission) => 
                            up.permission_id === permission.id
                          ) || false;
                          
                          return (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${selectedUser}-${permission.id}`}
                                checked={hasPermission}
                                onChange={() => handleToggleUserPermission(selectedUser, permission.id, hasPermission)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`${selectedUser}-${permission.id}`}
                                className="text-sm text-gray-300 cursor-pointer"
                              >
                                {permission.name.replace(/_/g, ' ').replace(/can /i, 'Can ')}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminManageAdmins;