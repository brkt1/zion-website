// components/admin/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CertificatesTable from './CertificatesTable';
import AddCafeOwner from './AddCafeOwner';
import EnhancedCardGenerator from '../cards/EnhancedCardGenerator';
import WinnerList from './WinnerList';
import Sidebar from './Sidebar';
import LoadingSpinner from '../utility/LoadingSpinner';
import Error from '../utility/Error';
import { useAuthStore } from '../../stores/authStore';

interface AdminDashboardData {
  totalUsers: number;
  activeSessions: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  userRoles: Array<{
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'CAFE_OWNER';
  }>;
}

const API_BASE_URL = 'http://localhost:3001/api';

const AdminPanel = () => {
  const { session, profile, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    if (!session?.access_token) {
      setError('Authentication required.');
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data: AdminDashboardData = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!session || profile?.role !== 'ADMIN') {
        navigate('/access-denied'); // Redirect if not authenticated or not admin
      } else {
        fetchDashboardData();
      }
    }
  }, [authLoading, session, profile, navigate]);

  const handleLogout = async () => {
    // Assuming useAuthStore has a signOut method
    // await supabase.auth.signOut(); // This was directly calling supabase, should use store
    useAuthStore.getState().signOut();
    navigate('/login');
  };

  if (authLoading || loadingData) return <LoadingSpinner />;

  if (error) return <Error message={error} />;

  return (
    <div className="flex min-h-screen bg-black-primary text-cream">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-gold-light"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          tabs={[
            { id: 'dashboard', name: 'Dashboard' },
            { id: 'certificates', name: 'Certificates' },
            { id: 'cafeOwners', name: 'Cafe Owners' },
            { id: 'cardGenerator', name: 'Card Generator' },
            { id: 'winners', name: 'Winners' },
            { id: 'playerIdGenerator', name: 'Player ID Generator' }
          ]}
        />
      
      <main className="flex-1 p-4 sm:p-8 lg:ml-64 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gold-primary mb-6 capitalize border-b-2 border-gold-primary pb-2">
            {activeTab.replace(/([A-Z])/g, ' $1')}
          </h1>
          
          <div className="bg-black-secondary rounded-xl shadow-xl p-4 sm:p-6 border border-gray-dark">
            {activeTab === 'dashboard' && dashboardData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-black-primary p-4 rounded-lg border border-gray-medium">
                    <h3 className="text-lg font-semibold text-gold-light">Total Users</h3>
                    <p className="text-3xl font-bold text-cream">{dashboardData.totalUsers}</p>
                  </div>
                  <div className="bg-black-primary p-4 rounded-lg border border-gray-medium">
                    <h3 className="text-lg font-semibold text-gold-light">Active Sessions</h3>
                    <p className="text-3xl font-bold text-cream">{dashboardData.activeSessions}</p>
                  </div>
                  <div className="bg-black-primary p-4 rounded-lg border border-gray-medium">
                    <h3 className="text-lg font-semibold text-gold-light">User Roles</h3>
                    <ul className="list-disc list-inside text-cream">
                      {dashboardData.userRoles.map((user, index) => (
                        <li key={index}>{user.email} ({user.role})</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gold-primary mt-6 mb-4">Recent Activities</h2>
                {dashboardData.recentActivities.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-black-primary rounded-lg overflow-hidden border border-gray-medium">
                      <thead>
                        <tr className="bg-gray-dark text-gold-light">
                          <th className="py-2 px-4 text-left">Type</th>
                          <th className="py-2 px-4 text-left">Description</th>
                          <th className="py-2 px-4 text-left">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentActivities.map((activity, index) => (
                          <tr key={activity.id} className={index % 2 === 0 ? 'bg-black-secondary' : 'bg-black-primary'}>
                            <td className="py-2 px-4">{activity.type}</td>
                            <td className="py-2 px-4">{activity.description}</td>
                            <td className="py-2 px-4">{new Date(activity.timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-light">No recent activities to display.</p>
                )}
              </div>
            )}
            {activeTab === 'certificates' && <CertificatesTable />}
            {activeTab === 'cafeOwners' && <AddCafeOwner />}
            {activeTab === 'cardGenerator' && <EnhancedCardGenerator />}
            {activeTab === 'winners' && <WinnerList />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;