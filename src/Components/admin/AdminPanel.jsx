import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import CertificatesTable from './CertificatesTable';
import AddCafeOwner from './AddCafeOwner';
import CardGenerator from '../../payment/CardGenerator';
import WinnerList from './WinnerList';
import Sidebar from './Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('certificates');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        navigate('/login');
        return;
      }

      // Check if user is admin
      const userRole = sessionStorage.getItem('userRole');
      if (userRole !== 'admin') {
        navigate('/');
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />
      
      <main className="flex-1 p-8 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-8 capitalize">
            {activeTab }
          </h1>
          {activeTab === 'certificates' && <CertificatesTable />}
          {activeTab === 'cafeOwners' && <AddCafeOwner />}
          {activeTab === 'cardGenerator' && <CardGenerator />}
          {activeTab === 'winners' && <WinnerList />}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
