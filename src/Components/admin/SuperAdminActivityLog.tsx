import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../utility/LoadingSpinner';

interface ActivityLogEntry {
  id: string;
  admin_id: string;
  admin_role: string;
  action: string;
  target_id: string | null;
  details: any;
  timestamp: string;
}

const SuperAdminActivityLog: React.FC = () => {
  const { session, profile, loading } = useAuthStore();
  const navigate = useNavigate();
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (loading) return; // Wait for auth store to load

      if (!session || profile?.role !== 'SUPER_ADMIN') {
        navigate('/access-denied');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/super-admin/activity-log', {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-purple-400">
          Admin Activity Log
        </h1>

        {activityLogs.length === 0 ? (
          <p className="text-center text-gray-400">No admin activity to display.</p>
        ) : (
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
                {activityLogs.map((log) => (
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
        )}
      </div>
    </div>
  );
};

export default SuperAdminActivityLog;
