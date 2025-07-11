import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../utility/LoadingSpinner';
import { API_BASE_URL } from '../../services/api';
import useSWR from 'swr';

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

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch data');
  }

  return response.json();
};

const SuperAdminPermissionRequests: React.FC = () => {
  const { session, profile, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: requests, error: requestsError, isLoading: isLoadingRequests, mutate } = useSWR(
    session?.access_token && profile?.role === 'SUPER_ADMIN' ? [`${API_BASE_URL}/super-admin/permission-requests`, session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  useEffect(() => {
    if (!authLoading) {
      if (!session || profile?.role !== 'SUPER_ADMIN') {
        navigate('/access-denied');
      }
    }
  }, [authLoading, session, profile, navigate]);

  const handleResponse = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_BASE_URL}/super-admin/permission-requests/${requestId}/${action}`,
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
      mutate(); // Revalidate the list
    } catch (err: any) {
      alert(`Error: ${err.message || `Failed to ${action} request`}`);
    }
  };

  const openModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequestId(null);
    setIsModalOpen(false);
    setRejectionReason('');
  };

  const handleReject = () => {
    if (selectedRequestId) {
      handleResponse(selectedRequestId, 'reject', rejectionReason);
      closeModal();
    }
  };

  if (authLoading || isLoadingRequests) {
    return <LoadingSpinner />;
  }

  if (requestsError) {
    return <div className="text-red-500 text-center mt-8">Error: {requestsError.message || 'An unexpected error occurred.'}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-8 text-white">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-purple-400">
          Permission Requests
        </h1>

        {requests && requests.length === 0 ? (
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
                {requests && requests.map((request) => (
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
                        onClick={() => openModal(request.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Rejection Reason</h2>
            <textarea
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPermissionRequests;
