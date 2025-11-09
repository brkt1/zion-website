import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ImageUpload } from '../../Components/admin/ImageUpload';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, Destination } from '../../services/api';
import { CommissionSeller } from '../../types';

const Destinations = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    img: '',
    featured: false,
    allowed_commission_seller_ids: [] as string[],
  });
  const [commissionSellers, setCommissionSellers] = useState<CommissionSeller[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/commission-sellers';
        return;
      }
      loadDestinations();
      loadCommissionSellers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

  const loadCommissionSellers = async () => {
    try {
      const sellers = await adminApi.commissionSellers.getAll();
      setCommissionSellers(sellers);
    } catch (error) {
      console.error('Error loading commission sellers:', error);
    }
  };

  const loadDestinations = async () => {
    try {
      const data = await api.getDestinations();
      setDestinations(data);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDestination) {
        await adminApi.destinations.update(editingDestination.id, formData);
      } else {
        await adminApi.destinations.create(formData);
      }
      setShowModal(false);
      setEditingDestination(null);
      resetForm();
      loadDestinations();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      location: destination.location,
      img: destination.img,
      featured: destination.featured || false,
      allowed_commission_seller_ids: destination.allowed_commission_seller_ids || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
    try {
      await adminApi.destinations.delete(id);
      loadDestinations();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', img: '', featured: false, allowed_commission_seller_ids: [] });
  };

  const toggleCommissionSeller = (sellerId: string) => {
    setFormData({
      ...formData,
      allowed_commission_seller_ids: formData.allowed_commission_seller_ids.includes(sellerId)
        ? formData.allowed_commission_seller_ids.filter(id => id !== sellerId)
        : [...formData.allowed_commission_seller_ids, sellerId],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Destinations Management</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingDestination(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FaPlus />
            Add Destination
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <div key={destination.id} className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={destination.img}
                alt={destination.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{destination.name}</h3>
                <p className="text-sm text-gray-600">{destination.location}</p>
                {destination.featured && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                    Featured
                  </span>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(destination)}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    <FaEdit className="inline mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(destination.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingDestination ? 'Edit Destination' : 'Add New Destination'}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <ImageUpload
                    value={formData.img}
                    onChange={(url) => setFormData({ ...formData, img: url })}
                    label="Destination Image"
                    folder="destinations"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Commission Sellers
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which commission sellers can sell tickets for this destination. Leave empty to allow all sellers.
                  </p>
                  <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                    {commissionSellers.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No commission sellers available</p>
                    ) : (
                      <div className="space-y-2">
                        {commissionSellers.map((seller) => (
                          <label
                            key={seller.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.allowed_commission_seller_ids.includes(seller.id)}
                              onChange={() => toggleCommissionSeller(seller.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">
                              {seller.name} {seller.email ? `(${seller.email})` : ''}
                              {!seller.is_active && <span className="text-red-500 ml-1">(Inactive)</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.allowed_commission_seller_ids.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.allowed_commission_seller_ids.length} seller(s) selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDestination(null);
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
                    {editingDestination ? 'Update' : 'Create'}
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

export default Destinations;

