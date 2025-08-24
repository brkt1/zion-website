import {
  EyeIcon,
  LockClosedIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface RLSPolicy {
  id: string;
  table_name: string;
  name: string;
  operation: string;
  definition: string;
  roles: string[];
  enabled: boolean;
}

export default function RLSManager() {
  const [tables, setTables] = useState<string[]>([]);
  const [policies, setPolicies] = useState<RLSPolicy[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RLSPolicy | null>(null);
  const [newPolicy, setNewPolicy] = useState<Partial<RLSPolicy>>({
    table_name: '',
    name: '',
    operation: 'ALL',
    definition: '',
    roles: [],
    enabled: true
  });

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchPolicies();
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/database/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables.map((t: any) => t.name));
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchPolicies = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/database/rls-policies?table=${selectedTable}`);
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error('Error fetching RLS policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPolicy = async () => {
    if (!newPolicy.table_name || !newPolicy.name || !newPolicy.definition) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/create-rls-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setNewPolicy({
          table_name: '',
          name: '',
          operation: 'ALL',
          definition: '',
          roles: [],
          enabled: true
        });
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error creating RLS policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePolicy = async () => {
    if (!editingPolicy) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/update-rls-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPolicy)
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setEditingPolicy(null);
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error updating RLS policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this RLS policy?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/delete-rls-policy', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: policyId })
      });
      
      if (response.ok) {
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error deleting RLS policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePolicy = async (policy: RLSPolicy) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/toggle-rls-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: policy.id, 
          enabled: !policy.enabled 
        })
      });
      
      if (response.ok) {
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error toggling RLS policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRole = () => {
    setNewPolicy(prev => ({
      ...prev,
      roles: [...(prev.roles || []), '']
    }));
  };

  const removeRole = (index: number) => {
    setNewPolicy(prev => ({
      ...prev,
      roles: prev.roles?.filter((_, i) => i !== index) || []
    }));
  };

  const updateRole = (index: number, value: string) => {
    setNewPolicy(prev => ({
      ...prev,
      roles: prev.roles?.map((role, i) => i === index ? value : role) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Row Level Security (RLS) Policies</h3>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a table</option>
            {tables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
          
          {selectedTable && (
            <button
              onClick={() => {
                setNewPolicy(prev => ({ ...prev, table_name: selectedTable }));
                setShowCreateModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Policy
            </button>
          )}
        </div>
      </div>

      {selectedTable && (
        <>
          {/* RLS Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">RLS Status</h4>
                <p className="text-sm text-blue-700">
                  Row Level Security is enabled for table "{selectedTable}"
                </p>
              </div>
            </div>
          </div>

          {/* Policies List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {policies.map((policy) => (
                  <li key={policy.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${policy.enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                          {policy.enabled ? (
                            <LockClosedIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{policy.name}</h4>
                          <p className="text-sm text-gray-500">
                            Operation: {policy.operation} • Roles: {policy.roles.join(', ') || 'All'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            {policy.definition}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => togglePolicy(policy)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            policy.enabled
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {policy.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPolicy({ ...policy });
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePolicy(policy.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                
                {policies.length === 0 && (
                  <li className="px-6 py-8 text-center text-gray-500">
                    <ShieldCheckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No RLS policies found for this table.</p>
                    <p className="text-sm">Create a policy to control row-level access.</p>
                  </li>
                )}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create RLS Policy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Name</label>
                <input
                  type="text"
                  value={newPolicy.name || ''}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter policy name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Operation</label>
                <select
                  value={newPolicy.operation || 'ALL'}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, operation: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">ALL</option>
                  <option value="SELECT">SELECT</option>
                  <option value="INSERT">INSERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Definition (SQL)</label>
                <textarea
                  value={newPolicy.definition || ''}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, definition: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., auth.uid() = user_id"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use SQL conditions to define when this policy applies. Common variables: auth.uid(), auth.role()
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles (Optional)</label>
                <div className="space-y-2">
                  {newPolicy.roles?.map((role, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => updateRole(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Role name"
                      />
                      <button
                        onClick={() => removeRole(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addRole}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Role
                </button>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPolicy.enabled || false}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable policy immediately</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createPolicy}
                disabled={!newPolicy.name || !newPolicy.definition}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {showEditModal && editingPolicy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit RLS Policy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Name</label>
                <input
                  type="text"
                  value={editingPolicy.name}
                  onChange={(e) => setEditingPolicy(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Operation</label>
                <select
                  value={editingPolicy.operation}
                  onChange={(e) => setEditingPolicy(prev => ({ ...prev, operation: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">ALL</option>
                  <option value="SELECT">SELECT</option>
                  <option value="INSERT">INSERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Definition (SQL)</label>
                <textarea
                  value={editingPolicy.definition}
                  onChange={(e) => setEditingPolicy(prev => ({ ...prev, definition: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPolicy.enabled}
                    onChange={(e) => setEditingPolicy(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable policy</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updatePolicy}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Update Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
