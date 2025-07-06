// components/admin/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import CertificatesTable from './CertificatesTable';
import AddCafeOwner from './AddCafeOwner';
import CardGenerator from '../../payment/CardGenerator';
import WinnerList from './WinnerList';
import Sidebar from './Sidebar';
import LoadingSpinner from '../../Components/LoadingSpinner';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('certificates');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        navigate('/login');
        return;
      }

      const { data: userData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (roleError || !userData || userData.role !== 'admin') {
        navigate('/login');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') navigate('/login');
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading || !isAdmin) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-gray-900">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-amber-400"
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
            { id: 'certificates', name: 'Certificates' },
            { id: 'cafeOwners', name: 'Cafe Owners' },
            { id: 'cardGenerator', name: 'Card Generator' },
            { id: 'winners', name: 'Winners' },
            { id: 'playerIdGenerator', name: 'Player ID Generator' }
          ]}
        />
      
      <main className="flex-1 p-4 sm:p-8 lg:ml-64 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-6 capitalize border-b-2 border-amber-500 pb-2">
            {activeTab.replace(/([A-Z])/g, ' $1')}
          </h1>
          
          <div className="bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 border border-gray-700">
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