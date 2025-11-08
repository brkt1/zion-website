import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheckCircle, FaEdit, FaPlus, FaTimesCircle, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { CommissionSeller } from '../../types';

const CommissionSellers = () => {
  const { loading: authLoading } = useAdminAuth();
  const [sellers, setSellers] = useState<CommissionSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState<CommissionSeller | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission_rate: '',
    commission_type: 'percentage' as 'percentage' | 'fixed',
    is_active: true,
    notes: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      loadSellers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const loadSellers = async () => {
    try {
      const data = await adminApi.commissionSellers.getAll();
      setSellers(data);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              <FaArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Commission Ticket Sellers</h1>
              <p className="text-sm text-gray-600 mt-1">Manage commission rates for ticket sellers</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingSeller(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FaPlus />
            Add Seller
          </button>
        </div>

        {loading ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="animate-pulse p-6 space-y-4">
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
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-4">No commission sellers found.</p>
            <button
              onClick={() => {
                resetForm();
                setEditingSeller(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FaPlus />
              Add Your First Seller
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sellers.map((seller) => (
                  <tr key={seller.id} className={!seller.is_active ? 'opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {seller.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {seller.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {seller.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCommission(seller)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        seller.commission_type === 'percentage'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {seller.commission_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleActive(seller)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          seller.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(seller)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit seller"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(seller.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete seller"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingSeller ? 'Edit Commission Seller' : 'Add New Commission Seller'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Seller full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="seller@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="+251 9XX XXX XXX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commission Type *</label>
                    <select
                      required
                      value={formData.commission_type}
                      onChange={(e) => setFormData({ ...formData, commission_type: e.target.value as 'percentage' | 'fixed' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (ETB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commission Rate *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder={formData.commission_type === 'percentage' ? '10' : '100'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.commission_type === 'percentage'
                        ? 'Enter percentage (e.g., 10 for 10%)'
                        : 'Enter fixed amount in ETB'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">Inactive sellers won't be used for new ticket sales</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Additional notes about this seller..."
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSeller(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingSeller ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionSellers;

