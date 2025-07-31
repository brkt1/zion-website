import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../utility/LoadingSpinner';
import Error from '../utility/Error';
import SuperAdminActivityLog from './SuperAdminActivityLog';
import SuperAdminPermissionRequests from './SuperAdminPermissionRequests';
import SuperAdminManageAdmins from './SuperAdminManageAdmins';
import CertificatesTable from './CertificatesTable';
import CafeOwnerManagement from './CafeOwnerManagement';
import EnhancedCardGenerator from '../cards/EnhancedCardGenerator';
import WinnerList from './WinnerList';
import PlayerIdGenerator from '../utility/PlayerIdGenerator';
import useSWR from 'swr';
import Sidebar from './Sidebar';

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
    throw new (Error as any)(errorData.message || 'Failed to fetch data');
  }

  return response.json();
};

const SuperAdminPanel = () => {
  const { session, profile, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'activity', 'requests'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Add admin-like tabs for super admin
  const adminTabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'certificates', name: 'Certificates' },
    { id: 'cafeOwners', name: 'Cafe Owners' },
    { id: 'cardGenerator', name: 'Card Generator' },
    { id: 'winners', name: 'Winners' },
    { id: 'playerIdGenerator', name: 'Player ID Generator' },
    { id: 'activity', name: 'Activity Log' },
    { id: 'requests', name: 'Permission Requests' },
    { id: 'manage-admins', name: 'Manage Admins' },
  ];

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
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-gold-light"
        title="Open sidebar menu"
        aria-label="Open sidebar menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={() => { useAuthStore.getState().signOut(); navigate('/login'); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile}
        tabs={adminTabs}
      />
      <main className="flex-1 p-4 sm:p-8 lg:ml-64 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-primary mb-6 capitalize border-b-2 border-gold-primary pb-2">
            Super Admin Panel
          </h1>
          <div className="bg-black-secondary rounded-xl shadow-xl p-4 sm:p-6 border border-gray-dark">
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
                      {dashboardData.roleCounts.map((rc: {role: string; count: number}, index: number) => (
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
                        {dashboardData.allUsers.map((user: {id: string; email: string; role: string}, index: number) => (
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
            {activeTab === 'certificates' && <CertificatesTable />}
            {activeTab === 'cafeOwners' && <CafeOwnerManagement />}
            {activeTab === 'cardGenerator' && <EnhancedCardGenerator />}
            {activeTab === 'winners' && <WinnerList />}
            {activeTab === 'playerIdGenerator' && <PlayerIdGenerator />}
            {activeTab === 'activity' && <SuperAdminActivityLog />}
            {activeTab === 'requests' && <SuperAdminPermissionRequests />}
            {activeTab === 'manage-admins' && <SuperAdminManageAdmins />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminPanel;