import { useEffect, useState } from 'react';
import {
    FaBars,
    FaCalendarAlt,
    FaChartLine,
    FaCheckCircle,
    FaCog,
    FaEdit,
    FaEnvelope,
    FaHome,
    FaImages,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaNewspaper,
    FaPlus,
    FaQrcode,
    FaSignOutAlt,
    FaTicketAlt,
    FaTimes,
    FaTimesCircle,
    FaTrash,
    FaUser
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { supabase } from '../../services/supabase';
import { CommissionSeller } from '../../types';

const CommissionSellers = () => {
  const { loading: authLoading, isAdminUser, isSeller } = useAdminAuth();
  const [sellers, setSellers] = useState<CommissionSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState<CommissionSeller | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission_rate: '',
    commission_type: 'percentage' as 'percentage' | 'fixed',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadSellers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser, isSeller]);

  const loadSellers = async () => {
    try {
      // If user is a commission seller (not admin), only show their own data
      if (isSeller && !isAdminUser) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const data = await adminApi.commissionSellers.getAll();
          // Filter to only show the seller's own record
          const sellerData = data.filter(s => s.email.toLowerCase() === session.user.email?.toLowerCase());
          setSellers(sellerData);
        } else {
          setSellers([]);
        }
      } else {
        // Admin can see all sellers
        const data = await adminApi.commissionSellers.getAll();
        setSellers(data);
      }
    } catch (error) {
      console.error('Error loading commission sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sellerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        commission_rate: parseFloat(formData.commission_rate),
        commission_type: formData.commission_type,
        is_active: formData.is_active,
        notes: formData.notes || undefined,
      };

      if (editingSeller) {
        await adminApi.commissionSellers.update(editingSeller.id, sellerData);
      } else {
        await adminApi.commissionSellers.create(sellerData);
      }
      setShowModal(false);
      setEditingSeller(null);
      resetForm();
      loadSellers();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to save seller'));
    }
  };

  const handleEdit = (seller: CommissionSeller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name,
      email: seller.email,
      phone: seller.phone || '',
      commission_rate: seller.commission_rate.toString(),
      commission_type: seller.commission_type,
      is_active: seller.is_active,
      notes: seller.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this commission seller?')) return;
    try {
      await adminApi.commissionSellers.delete(id);
      loadSellers();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to delete seller'));
    }
  };

  const toggleActive = async (seller: CommissionSeller) => {
    try {
      await adminApi.commissionSellers.update(seller.id, {
        is_active: !seller.is_active,
      });
      loadSellers();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to update seller status'));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      commission_rate: '',
      commission_type: 'percentage',
      is_active: true,
      notes: '',
    });
  };

  const formatCommission = (seller: CommissionSeller) => {
    if (seller.commission_type === 'percentage') {
      return `${seller.commission_rate}%`;
    }
    return `${seller.commission_rate} ETB`;
  };

  const menuItems = [
    { icon: FaQrcode, label: 'Verify Tickets', path: '/admin/verify', color: 'text-cyan-600 bg-cyan-50' },
    { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', color: 'text-blue-600 bg-blue-50' },
    { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', color: 'text-green-600 bg-green-50' },
    { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', color: 'text-purple-600 bg-purple-50' },
    { icon: FaImages, label: 'Gallery', path: '/admin/gallery', color: 'text-pink-600 bg-pink-50' },
    { icon: FaHome, label: 'Home Content', path: '/admin/home', color: 'text-yellow-600 bg-yellow-50' },
    { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', color: 'text-indigo-600 bg-indigo-50' },
    { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', color: 'text-red-600 bg-red-50' },
    { icon: FaTicketAlt, label: 'Commission Sellers', path: '/admin/commission-sellers', color: 'text-orange-600 bg-orange-50' },
    { icon: FaCog, label: 'Site Settings', path: '/admin/settings', color: 'text-gray-600 bg-gray-50' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Only show for admins */}
      {isAdminUser && (
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out hidden lg:block`}
        >
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">Commission Sellers</p>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                {sidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaChartLine className="flex-shrink-0" size={20} />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
              
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="flex-shrink-0" size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaUser className="text-indigo-600" size={18} />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaSignOutAlt size={16} />
                {sidebarOpen && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${isAdminUser && sidebarOpen ? 'lg:ml-64' : isAdminUser ? 'lg:ml-20' : ''} transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {isAdminUser && (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <FaBars size={20} />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isAdminUser ? 'Commission Ticket Sellers' : 'My Commission Information'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isAdminUser 
                      ? 'Manage commission rates for ticket sellers'
                      : 'View your commission rate and seller information'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                    <FaUser className="text-gray-400" />
                    <span>{user?.email || ''}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {isAdminUser && mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col h-full">
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-xs text-gray-500">Commission Sellers</p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FaChartLine size={20} />
                    <span>Dashboard</span>
                  </Link>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-gray-200 p-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Action Bar */}
          {isAdminUser && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => {
                  resetForm();
                  setEditingSeller(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
              >
                <FaPlus />
                Add Seller
              </button>
            </div>
          )}

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-12">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : sellers.length === 0 ? (
              <div className="p-12 text-center">
                <FaTicketAlt className="mx-auto mb-4 text-gray-300" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No commission sellers found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {isAdminUser 
                    ? 'Get started by adding your first commission seller.'
                    : 'You are not registered as a commission seller.'}
                </p>
                {isAdminUser && (
                  <button
                    onClick={() => {
                      resetForm();
                      setEditingSeller(null);
                      setShowModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <FaPlus />
                    Add Your First Seller
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sellers.map((seller) => (
                      <tr 
                        key={seller.id} 
                        className={`hover:bg-gray-50 transition-colors ${!seller.is_active ? 'opacity-60' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-orange-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {seller.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{seller.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{seller.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCommission(seller)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            seller.commission_type === 'percentage'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {seller.commission_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isAdminUser ? (
                            <button
                              onClick={() => toggleActive(seller)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                                seller.is_active
                                  ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              {seller.is_active ? (
                                <>
                                  <FaCheckCircle />
                                  Active
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle />
                                  Inactive
                                </>
                              )}
                            </button>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              seller.is_active
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {seller.is_active ? (
                                <>
                                  <FaCheckCircle />
                                  Active
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle />
                                  Inactive
                                </>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {isAdminUser && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleEdit(seller)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                title="Edit seller"
                              >
                                <FaEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(seller.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete seller"
                              >
                                <FaTrash size={16} />
                              </button>
                            </div>
                          )}
                          {!isAdminUser && (
                            <span className="text-gray-400 text-xs font-normal">Read-only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && isAdminUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSeller ? 'Edit Commission Seller' : 'Add New Commission Seller'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSeller(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Seller full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="seller@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="+251 9XX XXX XXX"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type *</label>
                  <select
                    required
                    value={formData.commission_type}
                    onChange={(e) => setFormData({ ...formData, commission_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (ETB)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder={formData.commission_type === 'percentage' ? '10' : '100'}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.commission_type === 'percentage'
                      ? 'Enter percentage (e.g., 10 for 10%)'
                      : 'Enter fixed amount in ETB'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
                <p className="text-xs text-gray-500 ml-auto">Inactive sellers won't be used for new ticket sales</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Additional notes about this seller..."
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSeller(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium"
                >
                  {editingSeller ? 'Update Seller' : 'Create Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionSellers;
