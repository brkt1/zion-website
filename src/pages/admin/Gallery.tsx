import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { ImageUpload } from '../../Components/admin/ImageUpload';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, GalleryItem } from '../../services/api';

const Gallery = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    image: '',
    icon: '',
    main: '',
    sub: '',
    defaultColor: '#ED5565',
    category: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/commission-sellers';
        return;
      }
      loadGallery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

  const loadGallery = async () => {
    try {
      const data = await api.getGalleryItems();
      setGalleryItems(data);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminApi.gallery.update(editingItem.id, formData);
      } else {
        await adminApi.gallery.create(formData);
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      loadGallery();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      image: item.image,
      icon: item.icon || '',
      main: item.main,
      sub: item.sub,
      defaultColor: item.defaultColor,
      category: item.category || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await adminApi.gallery.delete(id);
      loadGallery();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      image: '',
      icon: '',
      main: '',
      sub: '',
      defaultColor: '#ED5565',
      category: '',
    });
  };

  return (
    <AdminLayout title="Gallery Management">
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FaPlus />
          Add Gallery Item
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
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.main}</h3>
                <p className="text-sm text-gray-600">{item.sub}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    <FaEdit className="inline mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
                {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    label="Gallery Image"
                    folder="gallery"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Main Text *</label>
                  <input
                    type="text"
                    required
                    value={formData.main}
                    onChange={(e) => setFormData({ ...formData, main: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub Text *</label>
                  <input
                    type="text"
                    required
                    value={formData.sub}
                    onChange={(e) => setFormData({ ...formData, sub: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="walking, snowflake, tree, etc."
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Color *</label>
                  <input
                    type="color"
                    required
                    value={formData.defaultColor}
                    onChange={(e) => setFormData({ ...formData, defaultColor: e.target.value })}
                    className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
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
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default Gallery;

