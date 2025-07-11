import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../utility/LoadingSpinner';
import Error from '../utility/Error';
import SuperAdminActivityLog from './SuperAdminActivityLog';
import SuperAdminPermissionRequests from './SuperAdminPermissionRequests';
import SuperAdminManageAdmins from './SuperAdminManageAdmins';
import useSWR from 'swr';

interface SuperAdminDashboardData {
  message: string;
  allUsers: Array<{
    id: string;
    email: string;
    role: string;
  }>;
  roleCounts: Array<{
    role: string;
    count: number;
  }>;
}

import { API_BASE_URL } from '../../services/api';

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

const SuperAdminPanel = () => {
  const { session, profile, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'activity', 'requests'
  const navigate = useNavigate();

  const { data: dashboardData, error: dashboardError, isLoading: isLoadingDashboard } = useSWR(
    session?.access_token ? [`${API_BASE_URL}/super-admin/dashboard`, session.access_token] : null,
    ([url, token]) => fetcher(url, token)
  );

  useEffect(() => {
    if (!authLoading) {
      // Ensure only SUPER_ADMIN can access this page
      if (!session || profile?.role !== 'SUPER_ADMIN') {
        navigate('/access-denied'); 
      }
    }
  }, [authLoading, session, profile, navigate]);

  if (authLoading || isLoadingDashboard) return <LoadingSpinner />;

  if (dashboardError) return <Error message={dashboardError.message || 'An unexpected error occurred.'} />;

  return (
    <div className="flex min-h-screen bg-black-primary text-cream">
      <main className="flex-1 p-4 sm:p-8 lg:ml-64 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-primary mb-6 capitalize border-b-2 border-gold-primary pb-2">
            Super Admin Panel
          </h1>
          
          <div className="mb-8">
            <div className="flex border-b border-gray-dark">
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-gold-primary text-gold-primary' : 'text-gray-400 hover:text-gold-light'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'activity' ? 'border-b-2 border-gold-primary text-gold-primary' : 'text-gray-400 hover:text-gold-light'}`}
                onClick={() => setActiveTab('activity')}
              >
                Activity Log
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-gold-primary text-gold-primary' : 'text-gray-400 hover:text-gold-light'}`}
                onClick={() => setActiveTab('requests')}
              >
                Permission Requests
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'manage-admins' ? 'border-b-2 border-gold-primary text-gold-primary' : 'text-gray-400 hover:text-gold-light'}`}
                onClick={() => setActiveTab('manage-admins')}
              >
                Manage Admins
              </button>
            </div>
          </div>

          {activeTab === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-black-primary p-4 rounded-lg border border-gray-medium">
                  <h3 className="text-lg font-semibold text-gold-light">Total Users</h3>
                  <p className="text-3xl font-bold text-cream">{dashboardData.allUsers.length}</p>
                </div>
                <div className="bg-black-primary p-4 rounded-lg border border-gray-medium">
                  <h3 className="text-lg font-semibold text-gold-light">Users by Role</h3>
                  <ul className="list-disc list-inside text-cream">
                    {dashboardData.roleCounts.map((rc, index) => (
                      <li key={index}>{rc.role}: {rc.count}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gold-primary mt-6 mb-4">All Users</h2>
              {dashboardData.allUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-black-primary rounded-lg overflow-hidden border border-gray-medium">
                    <thead>
                      <tr className="bg-gray-dark text-gold-light">
                        <th className="py-2 px-4 text-left">Email</th>
                        <th className="py-2 px-4 text-left">Role</th>
                        <th className="py-2 px-4 text-left">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.allUsers.map((user, index) => (
                        <tr key={user.id} className={index % 2 === 0 ? 'bg-black-secondary' : 'bg-black-primary'}>
                          <td className="py-2 px-4">{user.email}</td>
                          <td className="py-2 px-4">{user.role}</td>
                          <td className="py-2 px-4 text-xs">{user.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-light">No users to display.</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && <SuperAdminActivityLog />}
          {activeTab === 'requests' && <SuperAdminPermissionRequests />}
          {activeTab === 'manage-admins' && <SuperAdminManageAdmins />}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminPanel;