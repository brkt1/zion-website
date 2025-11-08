import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaImages, FaMapMarkerAlt, FaNewspaper, FaCog, FaHome, FaInfoCircle, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '../../services/supabase';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    } else {
      setUser(session.user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', color: 'bg-blue-500' },
    { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', color: 'bg-green-500' },
    { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', color: 'bg-purple-500' },
    { icon: FaImages, label: 'Gallery', path: '/admin/gallery', color: 'bg-pink-500' },
    { icon: FaHome, label: 'Home Content', path: '/admin/home', color: 'bg-yellow-500' },
    { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', color: 'bg-indigo-500' },
    { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', color: 'bg-red-500' },
    { icon: FaCog, label: 'Site Settings', path: '/admin/settings', color: 'bg-gray-500' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your website content</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`${item.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-500">Manage {item.label.toLowerCase()}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaCalendarAlt className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaNewspaper className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gallery Items</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaImages className="text-pink-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Destinations</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <FaMapMarkerAlt className="text-purple-500" size={32} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

