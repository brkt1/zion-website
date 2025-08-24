import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { API_BASE_URL } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../utility/LoadingSpinner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
}

interface AdminRole {
  id: string;
  name: string;
  description: string;
  created_by: string;
  is_active: boolean;
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

const RolePermissionEditor: React.FC = () => {
  const { session, profile, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'custom-roles'>('roles');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const { data: permissions, error: permissionsError, isLoading: isLoadingPermissions, mutate: mutatePermissions } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/super-admin/permissions`, session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  const { data: rolePermissions, error: rolePermissionsError, isLoading: isLoadingRolePermissions, mutate: mutateRolePermissions } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/super-admin/role-permissions`, session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  const { data: adminRoles, error: adminRolesError, isLoading: isLoadingAdminRoles, mutate: mutateAdminRoles } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/super-admin/admin-roles`, session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  useEffect(() => {
    if (!authLoading) {
      if (!session || profile?.role !== 'SUPER_ADMIN') {
        navigate('/access-denied');
      }
    }
  }, [authLoading, session, profile, navigate]);

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newRoleName.trim()) return;

    setIsCreatingRole(true);
    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/admin-roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          permissions: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create custom role');
      }

      toast.success('Custom role created successfully!');
      setNewRoleName('');
      setNewRoleDescription('');
      setSelectedPermissions([]);
      mutateAdminRoles();
      mutateRolePermissions();
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to create custom role'}`);
    } finally {
      setIsCreatingRole(false);
    }
  };

  const handleToggleRolePermission = async (role: string, permissionId: string, hasPermission: boolean) => {
    if (!session) return;

    try {
      if (hasPermission) {
        // Remove permission
        await fetch(`${API_BASE_URL}/super-admin/role-permissions`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ role, permission_id: permissionId }),
        });
      } else {
        // Add permission
        await fetch(`${API_BASE_URL}/super-admin/role-permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ role, permission_id: permissionId }),
        });
      }

      mutateRolePermissions();
      toast.success(`Permission ${hasPermission ? 'removed from' : 'added to'} role ${role}`);
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to update role permission'}`);
    }
  };

  const handleDeleteCustomRole = async (roleId: string) => {
    if (!session || !confirm('Are you sure you want to delete this custom role? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/admin-roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete custom role');
      }

      toast.success('Custom role deleted successfully!');
      mutateAdminRoles();
      mutateRolePermissions();
    } catch (err: any) {
      toast.error(`Error: ${err.message || 'Failed to delete custom role'}`);
    }
  };

  const getPermissionsByCategory = () => {
    if (!permissions) return {};
    
    return permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});
  };

  const hasPermission = (role: string, permissionId: string) => {
    if (!rolePermissions) return false;
    return rolePermissions.some((rp: RolePermission) => 
      rp.role === role && rp.permission_id === permissionId
    );
  };

  const getPermissionCount = (role: string) => {
    if (!rolePermissions) return 0;
    return rolePermissions.filter((rp: RolePermission) => rp.role === role).length;
  };

  if (authLoading || isLoadingPermissions || isLoadingRolePermissions || isLoadingAdminRoles) {
    return <LoadingSpinner />;
  }

  if (permissionsError || rolePermissionsError || adminRolesError) {
    return (
      <div className="text-red-500 text-center mt-8">
        Error: {permissionsError?.message || rolePermissionsError?.message || adminRolesError?.message || 'An unexpected error occurred.'}
      </div>
    );
  }

  const permissionsByCategory = getPermissionsByCategory();
  const standardRoles = ['SUPER_ADMIN', 'ADMIN', 'CAFE_OWNER', 'USER'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-purple-400">
          Role & Permission Management
        </h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'roles'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            Standard Roles
          </button>
          <button
            onClick={() => setActiveTab('custom-roles')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'custom-roles'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            Custom Admin Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            All Permissions
          </button>
        </div>

        {/* Standard Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-purple-300">Standard Role Permissions</h2>
            <div className="grid gap-6">
              {standardRoles.map((role) => (
                <div key={role} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300">{role}</h3>
                      <p className="text-sm text-gray-400">
                        {getPermissionCount(role)} permissions assigned
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {role === 'SUPER_ADMIN' ? 'System Role' : 'Standard Role'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                      <div key={category} className="border-l-4 border-gray-600 pl-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">
                          {category.replace('_', ' ')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${role}-${permission.id}`}
                                checked={hasPermission(role, permission.id)}
                                onChange={() => handleToggleRolePermission(role, permission.id, hasPermission(role, permission.id))}
                                disabled={role === 'SUPER_ADMIN'} // Super admin should always have all permissions
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                              />
                              <label
                                htmlFor={`${role}-${permission.id}`}
                                className="text-sm text-gray-300 cursor-pointer disabled:cursor-not-allowed"
                              >
                                {permission.name.replace(/_/g, ' ').replace(/can /i, 'Can ')}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Admin Roles Tab */}
        {activeTab === 'custom-roles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-purple-300">Custom Admin Roles</h2>
              <button
                onClick={() => setEditingRole('new')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Custom Role
              </button>
            </div>

            {/* Create/Edit Custom Role Form */}
            {editingRole && (
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">
                  {editingRole === 'new' ? 'Create New Custom Role' : 'Edit Custom Role'}
                </h3>
                <form onSubmit={handleCreateCustomRole} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Role Name</label>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      placeholder="Enter role name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                      className="mt-1 block w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                      placeholder="Enter role description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Assign Permissions</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-gray-800 p-3 rounded-md border border-gray-600 max-h-60 overflow-y-auto">
                      {permissions?.map(permission => (
                        <div key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`new-role-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => {
                              setSelectedPermissions(prev => 
                                prev.includes(permission.id)
                                  ? prev.filter(id => id !== permission.id)
                                  : [...prev, permission.id]
                              );
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`new-role-${permission.id}`} className="ml-2 text-sm text-gray-300 cursor-pointer">
                            {permission.name.replace(/_/g, ' ').replace(/can /i, 'Can ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRole(null);
                        setNewRoleName('');
                        setNewRoleDescription('');
                        setSelectedPermissions([]);
                      }}
                      className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingRole || !newRoleName.trim()}
                      className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                        isCreatingRole || !newRoleName.trim()
                          ? 'bg-purple-700 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } transition-colors`}
                    >
                      {isCreatingRole ? 'Creating...' : 'Create Role'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Existing Custom Roles */}
            <div className="grid gap-4">
              {adminRoles?.map((role: AdminRole) => (
                <div key={role.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300">{role.name}</h3>
                      <p className="text-sm text-gray-400">{role.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeleteCustomRole(role.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>Created by: {role.created_by}</p>
                    <p>Permissions: {getPermissionCount(role.name)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-purple-300">All Available Permissions</h2>
            <div className="grid gap-6">
              {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                <div key={category} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                  <h3 className="text-lg font-semibold text-purple-300 mb-4 capitalize">
                    {category.replace('_', ' ')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                        <h4 className="font-medium text-purple-300 mb-2">
                          {permission.name.replace(/_/g, ' ').replace(/can /i, 'Can ')}
                        </h4>
                        <p className="text-sm text-gray-400 mb-3">
                          {permission.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          ID: {permission.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolePermissionEditor;
