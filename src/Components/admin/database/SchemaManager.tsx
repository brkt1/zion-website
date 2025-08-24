import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface SchemaInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
  constraint_type: string | null;
  constraint_name: string | null;
}

interface TableSchema {
  name: string;
  columns: SchemaInfo[];
  indexes: any[];
  foreign_keys: any[];
  triggers: any[];
}

export default function SchemaManager() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [schema, setSchema] = useState<TableSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'text',
    nullable: true,
    default: '',
    length: '',
    precision: '',
    scale: ''
  });

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableSchema();
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

  const fetchTableSchema = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/database/schema?table=${selectedTable}`);
      if (response.ok) {
        const data = await response.json();
        setSchema(data.schema);
      }
    } catch (error) {
      console.error('Error fetching table schema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addColumn = async () => {
    if (!selectedTable || !newColumn.name || !newColumn.type) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/add-column', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          column: newColumn
        })
      });
      
      if (response.ok) {
        setShowCreateColumnModal(false);
        setNewColumn({
          name: '',
          type: 'text',
          nullable: true,
          default: '',
          length: '',
          precision: '',
          scale: ''
        });
        fetchTableSchema();
      }
    } catch (error) {
      console.error('Error adding column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dropColumn = async (columnName: string) => {
    if (!selectedTable || !confirm(`Are you sure you want to drop column "${columnName}"?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/drop-column', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          column: columnName
        })
      });
      
      if (response.ok) {
        fetchTableSchema();
      }
    } catch (error) {
      console.error('Error dropping column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDataTypeDisplay = (column: SchemaInfo) => {
    let type = column.data_type;
    
    if (column.character_maximum_length) {
      type += `(${column.character_maximum_length})`;
    } else if (column.numeric_precision) {
      if (column.numeric_scale) {
        type += `(${column.numeric_precision},${column.numeric_scale})`;
      } else {
        type += `(${column.numeric_precision})`;
      }
    }
    
    return type;
  };

  const getConstraintDisplay = (column: SchemaInfo) => {
    if (column.constraint_type === 'PRIMARY KEY') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Primary Key</span>;
    } else if (column.constraint_type === 'UNIQUE') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Unique</span>;
    } else if (column.constraint_type === 'FOREIGN KEY') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Foreign Key</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Database Schema</h3>
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
              onClick={() => setShowCreateColumnModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Column
            </button>
          )}
        </div>
      </div>

      {selectedTable && (
        <>
          {/* Schema Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Table Schema</h4>
                <p className="text-sm text-blue-700">
                  Viewing schema for table "{selectedTable}"
                </p>
              </div>
            </div>
          </div>

          {/* Schema Details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : schema ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nullable</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constraints</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schema.columns.map((column) => (
                      <tr key={column.column_name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {column.column_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {getDataTypeDisplay(column)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.is_nullable === 'YES' ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {column.column_default || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getConstraintDisplay(column)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => dropColumn(column.column_name)}
                            disabled={column.constraint_type === 'PRIMARY KEY'}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={column.constraint_type === 'PRIMARY KEY' ? 'Cannot drop primary key column' : 'Drop column'}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No schema information available
              </div>
            )}
          </div>

          {/* Additional Schema Information */}
          {schema && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Indexes */}
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Indexes</h4>
                {schema.indexes && schema.indexes.length > 0 ? (
                  <div className="space-y-2">
                    {schema.indexes.map((index, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{index.name}</span>
                        <span className="text-xs text-gray-500">{index.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No indexes found</p>
                )}
              </div>

              {/* Foreign Keys */}
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Foreign Keys</h4>
                {schema.foreign_keys && schema.foreign_keys.length > 0 ? (
                  <div className="space-y-2">
                    {schema.foreign_keys.map((fk, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded">
                        <div className="text-sm font-medium">{fk.constraint_name}</div>
                        <div className="text-xs text-gray-500">
                          {fk.column_name} → {fk.foreign_table_name}.{fk.foreign_column_name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No foreign keys found</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Column Modal */}
      {showCreateColumnModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Column</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Column Name</label>
                <input
                  type="text"
                  value={newColumn.name}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter column name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data Type</label>
                <select
                  value={newColumn.type}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">text</option>
                  <option value="varchar">varchar</option>
                  <option value="integer">integer</option>
                  <option value="bigint">bigint</option>
                  <option value="boolean">boolean</option>
                  <option value="uuid">uuid</option>
                  <option value="timestamp">timestamp</option>
                  <option value="jsonb">jsonb</option>
                  <option value="numeric">numeric</option>
                </select>
              </div>

              {newColumn.type === 'varchar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Length</label>
                  <input
                    type="number"
                    value={newColumn.length}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, length: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 255"
                  />
                </div>
              )}

              {newColumn.type === 'numeric' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precision</label>
                    <input
                      type="number"
                      value={newColumn.precision}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, precision: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scale</label>
                    <input
                      type="number"
                      value={newColumn.scale}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, scale: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Default Value</label>
                <input
                  type="text"
                  value={newColumn.default}
                  onChange={(e) => setNewColumn(prev => ({ ...prev, default: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional default value"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newColumn.nullable}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, nullable: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow NULL values</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateColumnModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addColumn}
                disabled={!newColumn.name || !newColumn.type}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
