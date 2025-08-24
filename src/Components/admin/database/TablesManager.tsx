import {
  CogIcon,
  EyeIcon,
  PlusIcon,
  ServerIcon,
  TableCellsIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../../stores/authStore';

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
  size: string;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  primary: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function TablesManager() {
  const { session, profile } = useAuthStore();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableColumns, setNewTableColumns] = useState<Partial<ColumnInfo>[]>([
    { name: 'id', type: 'uuid', nullable: false, primary: true, default: 'gen_random_uuid()' }
  ]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    fetchTables();
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    if (!session?.access_token) return;
    
    setIsLoadingPermissions(true);
    try {
      const response = await fetch('/api/profile/permissions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (response.ok) {
        const permissions = await response.json();
        setUserPermissions(Array.isArray(permissions) ? permissions : []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Failed to fetch database tables');
    } finally {
      setIsLoading(false);
    }
  };

  const createTable = async () => {
    if (!newTableName.trim()) return;
    
    // Check permission
    if (!userPermissions.includes('CAN_CREATE_TABLES')) {
      toast.error('You do not have permission to create tables');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTableName,
          columns: newTableColumns
        })
      });
      
      if (response.ok) {
        toast.success('Table created successfully!');
        setShowCreateModal(false);
        setNewTableName('');
        setNewTableColumns([{ name: 'id', type: 'uuid', nullable: false, primary: true, default: 'gen_random_uuid()' }]);
        fetchTables();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create table');
      }
    } catch (error: any) {
      console.error('Error creating table:', error);
      toast.error(`Error: ${error.message || 'Failed to create table'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTable = async (tableName: string) => {
    // Check permission
    if (!userPermissions.includes('CAN_MODIFY_SCHEMA')) {
      toast.error('You do not have permission to delete tables');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete table "${tableName}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/database/delete-table`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tableName })
      });
      
      if (response.ok) {
        toast.success('Table deleted successfully!');
        fetchTables();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete table');
      }
    } catch (error: any) {
      console.error('Error deleting table:', error);
      toast.error(`Error: ${error.message || 'Failed to delete table'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addColumn = () => {
    setNewTableColumns([...newTableColumns, { name: '', type: 'text', nullable: true }]);
  };

  const removeColumn = (index: number) => {
    setNewTableColumns(newTableColumns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, field: keyof ColumnInfo, value: any) => {
    const updated = [...newTableColumns];
    updated[index] = { ...updated[index], [field]: value };
    setNewTableColumns(updated);
  };

  const canCreateTables = userPermissions.includes('CAN_CREATE_TABLES');
  const canModifySchema = userPermissions.includes('CAN_MODIFY_SCHEMA');
  const canViewDatabase = userPermissions.includes('CAN_VIEW_DATABASE');

  if (!canViewDatabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
          <div className="text-center">
            <ServerIcon className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              You do not have permission to access the database management features.
            </p>
            <p className="text-gray-400 text-sm">
              Contact your super administrator to request the necessary permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-400">Database Tables</h1>
            <p className="text-gray-400 mt-2">Manage database structure and tables</p>
          </div>
          <div className="flex space-x-3">
            {canCreateTables && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Table
              </button>
            )}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Permission Status */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Your Database Permissions</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              canViewDatabase ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {canViewDatabase ? '✓ View Database' : '✗ View Database'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              canCreateTables ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {canCreateTables ? '✓ Create Tables' : '✗ Create Tables'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              canModifySchema ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {canModifySchema ? '✓ Modify Schema' : '✗ Modify Schema'}
            </span>
          </div>
        </div>

        {/* Tables List */}
        <div className="bg-gray-700 shadow overflow-hidden rounded-lg border border-gray-600">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading database tables...</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-600">
              {tables.map((table) => (
                <li key={table.name} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TableCellsIcon className="h-8 w-8 text-purple-400" />
                      <div>
                        <h4 className="text-lg font-medium text-purple-300">{table.name}</h4>
                        <p className="text-sm text-gray-400">
                          {table.rowCount} rows • {table.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-md hover:bg-gray-600"
                        title="View Table Structure"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {canModifySchema && (
                        <button
                          onClick={() => deleteTable(table.name)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-md hover:bg-gray-600"
                          title="Delete Table"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Table Details */}
                  {selectedTable === table.name && (
                    <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-600">
                      <h5 className="text-sm font-medium text-purple-300 mb-3">Table Structure</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                          <thead className="bg-gray-700">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Column</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nullable</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Default</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Primary</th>
                            </tr>
                          </thead>
                          <tbody className="bg-gray-800 divide-y divide-gray-600">
                            {table.columns.map((column) => (
                              <tr key={column.name}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-purple-300">
                                  {column.name}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                                  {column.type}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    column.nullable ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {column.nullable ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                                  {column.default || '-'}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    column.primary ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {column.primary ? 'Yes' : 'No'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create Table Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-600">
              <h3 className="text-lg font-medium text-purple-300 mb-4">Create New Table</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Table Name</label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="mt-1 block w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter table name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Columns</label>
                  <div className="space-y-2">
                    {newTableColumns.map((column, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={column.name || ''}
                          onChange={(e) => updateColumn(index, 'name', e.target.value)}
                          className="flex-1 border border-gray-600 rounded px-2 py-1 text-sm bg-gray-700 text-white"
                          placeholder="Column name"
                        />
                        <select
                          value={column.type || 'text'}
                          onChange={(e) => updateColumn(index, 'type', e.target.value)}
                          className="border border-gray-600 rounded px-2 py-1 text-sm bg-gray-700 text-white"
                        >
                          <option value="text">text</option>
                          <option value="integer">integer</option>
                          <option value="bigint">bigint</option>
                          <option value="boolean">boolean</option>
                          <option value="uuid">uuid</option>
                          <option value="timestamp">timestamp</option>
                          <option value="jsonb">jsonb</option>
                        </select>
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={column.nullable || false}
                            onChange={(e) => updateColumn(index, 'nullable', e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-300">Nullable</span>
                        </label>
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={column.primary || false}
                            onChange={(e) => updateColumn(index, 'primary', e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-300">Primary</span>
                        </label>
                        <input
                          type="text"
                          value={column.default || ''}
                          onChange={(e) => updateColumn(index, 'default', e.target.value)}
                          className="flex-1 border border-gray-600 rounded px-2 py-1 text-sm bg-gray-700 text-white"
                          placeholder="Default value"
                        />
                        {index > 0 && (
                          <button
                            onClick={() => removeColumn(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addColumn}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    + Add Column
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTable}
                  disabled={!newTableName.trim() || isLoading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !newTableName.trim() || isLoading
                      ? 'bg-purple-700 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  } transition-colors`}
                >
                  {isLoading ? 'Creating...' : 'Create Table'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
              <h3 className="text-lg font-medium text-purple-300 mb-4">Database Settings</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Current User</h4>
                  <p className="text-sm text-gray-400">{profile?.email || 'Unknown'}</p>
                  <p className="text-sm text-gray-400">Role: {profile?.role || 'Unknown'}</p>
                </div>
                
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Database Permissions</h4>
                  <div className="space-y-1">
                    {isLoadingPermissions ? (
                      <p className="text-sm text-gray-400">Loading permissions...</p>
                    ) : (
                      userPermissions
                        .filter(perm => perm.includes('DATABASE') || perm.includes('TABLE') || perm.includes('SCHEMA'))
                        .map(permission => (
                          <span key={permission} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                            {permission.replace(/_/g, ' ')}
                          </span>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
