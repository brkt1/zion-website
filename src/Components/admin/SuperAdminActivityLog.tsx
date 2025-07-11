import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../utility/LoadingSpinner';
import { API_BASE_URL } from '../../services/api';

interface ActivityLogEntry {
  id: string;
  admin_id: string;
  admin_role: string;
  action: string;
  target_id: string | null;
  details: any;
  timestamp: string;
}

const ITEMS_PER_PAGE = 10;

const SuperAdminActivityLog: React.FC = () => {
  const { session, profile, loading } = useAuthStore();
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (loading) return;

      if (!session || profile?.role !== 'SUPER_ADMIN') {
        navigate('/access-denied');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/super-admin/activity-log`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setActivityLogs(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch activity logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityLogs();
  }, [session, profile, loading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  const totalPages = Math.ceil(activityLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = activityLogs.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-purple-400">
          Admin Activity Log
        </h1>

        {activityLogs.length === 0 ? (
          <p className="text-center text-gray-400">No admin activity to display.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Timestamp</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Admin Role</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Action</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Target ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-600 last:border-b-0">
                      <td className="py-3 px-4 text-sm text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{log.admin_role}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{log.action}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{log.target_id || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        <pre className="whitespace-pre-wrap text-xs bg-gray-600 p-2 rounded">{JSON.stringify(log.details, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-600 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">{page * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min((page + 1) * ITEMS_PER_PAGE, activityLogs.length)}</span> of <span className="font-medium">{activityLogs.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      className="relative inline-flex items-.center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminActivityLog;