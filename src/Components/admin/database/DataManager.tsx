import {
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface TableData {
  [key: string]: any;
}

export default function DataManager() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [data, setData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState<TableData | null>(null);
  const [newRow, setNewRow] = useState<TableData>({});
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable, limit, offset, filters]);

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

  const fetchTableData = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      const filterParams = Object.entries(filters)
        .filter(([_, value]) => value.trim())
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const response = await fetch(
        `/api/database/select?table=${selectedTable}&limit=${limit}&offset=${offset}${filterParams ? `&filter=${encodeURIComponent(JSON.stringify(filters))}` : ''}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
        if (result.data && result.data.length > 0) {
          setColumns(Object.keys(result.data[0]));
        }
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const insertRow = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/database/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          data: newRow
        })
      });
      
      if (response.ok) {
        setShowInsertModal(false);
        setNewRow({});
        fetchTableData();
      }
    } catch (error) {
      console.error('Error inserting row:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRow = async () => {
    if (!selectedTable || !editingRow) return;
    
    setIsLoading(true);
    try {
      // Create filter for the row being edited (assuming first column is unique identifier)
      const filter = { [columns[0]]: editingRow[columns[0]] };
      
      const response = await fetch('/api/database/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          data: editingRow,
          filter
        })
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setEditingRow(null);
        fetchTableData();
      }
    } catch (error) {
      console.error('Error updating row:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRow = async (row: TableData) => {
    if (!selectedTable) return;
    
    if (!confirm('Are you sure you want to delete this row?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Create filter for the row being deleted (assuming first column is unique identifier)
      const filter = { [columns[0]]: row[columns[0]] };
      
      const response = await fetch('/api/database/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          filter
        })
      });
      
      if (response.ok) {
        fetchTableData();
      }
    } catch (error) {
      console.error('Error deleting row:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const refreshData = () => {
    fetchTableData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Data Operations</h3>
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
              onClick={() => setShowInsertModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Insert Row
            </button>
          )}
        </div>
      </div>

      {selectedTable && (
        <>
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Filters</h4>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {columns.map((column) => (
                <div key={column}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {column}
                  </label>
                  <input
                    type="text"
                    value={filters[column] || ''}
                    onChange={(e) => handleFilterChange(column, e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Filter ${column}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-700">Limit:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                {offset + 1} - {offset + data.length}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={data.length < limit}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
            
            <button
              onClick={refreshData}
              className="text-blue-600 hover:text-blue-800"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof row[column] === 'object' 
                              ? JSON.stringify(row[column]) 
                              : String(row[column] || '')}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingRow({ ...row });
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteRow(row)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
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
        </>
      )}

      {/* Insert Row Modal */}
      {showInsertModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Insert New Row</h3>
            
            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column}>
                  <label className="block text-sm font-medium text-gray-700">{column}</label>
                  <input
                    type="text"
                    value={newRow[column] || ''}
                    onChange={(e) => setNewRow(prev => ({ ...prev, [column]: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${column}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInsertModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={insertRow}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Insert Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Row Modal */}
      {showEditModal && editingRow && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Row</h3>
            
            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column}>
                  <label className="block text-sm font-medium text-gray-700">{column}</label>
                  <input
                    type="text"
                    value={editingRow[column] || ''}
                    onChange={(e) => setEditingRow(prev => ({ ...prev, [column]: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${column}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateRow}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Update Row
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
