import {
  CheckCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface QueryResult {
  data: any[];
  columns: string[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

interface SavedQuery {
  id: string;
  name: string;
  sql: string;
  description: string;
  createdAt: string;
}

export default function QueryExecutor() {
  const [sqlQuery, setSqlQuery] = useState('');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [queryDescription, setQueryDescription] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [executionHistory, setExecutionHistory] = useState<Array<{
    sql: string;
    timestamp: string;
    executionTime: number;
    success: boolean;
  }>>([]);

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/database/raw-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: sqlQuery,
          params: []
        })
      });
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract columns from the first row if data exists
        const columns = data.data && data.data.length > 0 ? Object.keys(data.data[0]) : [];
        
        setResults({
          data: data.data || [],
          columns,
          rowCount: data.data ? data.data.length : 0,
          executionTime
        });
        
        // Add to execution history
        setExecutionHistory(prev => [{
          sql: sqlQuery,
          timestamp: new Date().toISOString(),
          executionTime,
          success: true
        }, ...prev.slice(0, 9)]); // Keep last 10 queries
      } else {
        const errorData = await response.json();
        setResults({
          data: [],
          columns: [],
          rowCount: 0,
          executionTime,
          error: errorData.error || 'Query execution failed'
        });
        
        // Add to execution history
        setExecutionHistory(prev => [{
          sql: sqlQuery,
          timestamp: new Date().toISOString(),
          executionTime,
          success: false
        }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      setResults({
        data: [],
        columns: [],
        rowCount: 0,
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      // Add to execution history
      setExecutionHistory(prev => [{
        sql: sqlQuery,
        timestamp: new Date().toISOString(),
        executionTime,
        success: false
      }, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuery = async () => {
    if (!queryName.trim() || !sqlQuery.trim()) return;
    
    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name: queryName,
      sql: sqlQuery,
      description: queryDescription,
      createdAt: new Date().toISOString()
    };
    
    setSavedQueries(prev => [newQuery, ...prev]);
    setShowSaveModal(false);
    setQueryName('');
    setQueryDescription('');
  };

  const loadQuery = (query: SavedQuery) => {
    setSqlQuery(query.sql);
    setSelectedQuery(query.id);
  };

  const deleteQuery = (queryId: string) => {
    setSavedQueries(prev => prev.filter(q => q.id !== queryId));
  };

  const clearResults = () => {
    setResults(null);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">NULL</span>;
    }
    
    if (typeof value === 'object') {
      return <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{JSON.stringify(value)}</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'true' : 'false'}
        </span>
      );
    }
    
    return String(value);
  };

  const getQueryType = (sql: string) => {
    const upperSql = sql.trim().toUpperCase();
    if (upperSql.startsWith('SELECT')) return 'SELECT';
    if (upperSql.startsWith('INSERT')) return 'INSERT';
    if (upperSql.startsWith('UPDATE')) return 'UPDATE';
    if (upperSql.startsWith('DELETE')) return 'DELETE';
    if (upperSql.startsWith('CREATE')) return 'CREATE';
    if (upperSql.startsWith('ALTER')) return 'ALTER';
    if (upperSql.startsWith('DROP')) return 'DROP';
    return 'OTHER';
  };

  const getQueryTypeColor = (type: string) => {
    switch (type) {
      case 'SELECT': return 'bg-blue-100 text-blue-800';
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'CREATE': return 'bg-purple-100 text-purple-800';
      case 'ALTER': return 'bg-indigo-100 text-indigo-800';
      case 'DROP': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">SQL Query Executor</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!sqlQuery.trim()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Save Query
          </button>
          <button
            onClick={clearResults}
            disabled={!results}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* SQL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SQL Query
            </label>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your SQL query here..."
            />
          </div>

          {/* Execute Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={executeQuery}
              disabled={!sqlQuery.trim() || isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              Execute Query
            </button>

            {results && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {results.executionTime}ms
                </div>
                <div className="flex items-center">
                  {results.error ? (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {results.error ? 'Error' : `${results.rowCount} rows`}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {results && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {results.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Query Error</h4>
                      <p className="text-sm text-red-700 mt-1">{results.error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {results.columns.map((column) => (
                          <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {results.columns.map((column) => (
                            <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatValue(row[column])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Saved Queries */}
          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Saved Queries</h4>
            {savedQueries.length === 0 ? (
              <p className="text-sm text-gray-500">No saved queries yet</p>
            ) : (
              <div className="space-y-2">
                {savedQueries.map((query) => (
                  <div
                    key={query.id}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-50 ${
                      selectedQuery === query.id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => loadQuery(query)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {query.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuery(query.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{query.description}</p>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQueryTypeColor(getQueryType(query.sql))}`}>
                        {getQueryType(query.sql)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Execution History */}
          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Queries</h4>
            {executionHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No queries executed yet</p>
            ) : (
              <div className="space-y-2">
                {executionHistory.map((query, index) => (
                  <div
                    key={index}
                    className="p-2 rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => setSqlQuery(query.sql)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQueryTypeColor(getQueryType(query.sql))}`}>
                        {getQueryType(query.sql)}
                      </span>
                      <span className="text-xs text-gray-500">{query.executionTime}ms</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{query.sql}</p>
                    <div className="flex items-center mt-1">
                      {query.success ? (
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ExclamationTriangleIcon className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(query.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Query Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Query</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Query Name</label>
                <input
                  type="text"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a name for this query"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={queryDescription}
                  onChange={(e) => setQueryDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveQuery}
                disabled={!queryName.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Save Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
