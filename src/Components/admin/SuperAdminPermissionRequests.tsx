import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../utility/LoadingSpinner';

interface PermissionRequest {
  id: string;
  requester_admin_id: string;
  requester_role: string;
  action_type: string;
  target_table: string;
  target_id: string;
  request_details: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
  responded_by_super_admin_id: string | null;
  responded_at: string | null;
  response_reason: string | null;
}

const SuperAdminPermissionRequests: React.FC = () => {
  const { session, profile, loading } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissionRequests = useCallback(async () => {
    if (loading) return; // Wait for auth store to load

    if (!session || profile?.role !== 'SUPER_ADMIN') {
      navigate('/access-denied');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/super-admin/permission-requests', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permission requests');
    } finally {
      setIsLoading(false);
    }
  }, [session, profile, loading, navigate]);

  useEffect(() => {
    fetchPermissionRequests();
  }, [fetchPermissionRequests]);

  const handleResponse = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    if (!session) return;

    try {
      const response = await fetch(`http://localhost:3001/api/super-admin/permission-requests/${requestId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} request`);
      }

      alert(`Request ${action}d successfully!`);
      fetchPermissionRequests(); // Refresh the list
    } catch (err: any) {
      setError(err.message || `Failed to ${action} request`);
    }
  };

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
          Permission Requests
        </h1>

        {requests.length === 0 ? (
          <p className="text-center text-gray-400">No pending permission requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-600">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Requested At</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Requester Role</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Action Type</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Target Table</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Target ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Details</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-600 last:border-b-0">
                    <td className="py-3 px-4 text-sm text-gray-300">{new Date(request.requested_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{request.requester_role}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{request.action_type}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{request.target_table}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{request.target_id}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <pre className="whitespace-pre-wrap text-xs bg-gray-600 p-2 rounded">{JSON.stringify(request.request_details, null, 2)}</pre>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleResponse(request.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) handleResponse(request.id, 'reject', reason);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        Reject
                      </button>
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

export default SuperAdminPermissionRequests;
