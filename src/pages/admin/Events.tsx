import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSpinner, FaTimes, FaTrash, FaUpload } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { ImageUpload } from '../../Components/admin/ImageUpload';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, Event } from '../../services/api';
import { uploadImage } from '../../services/upload';
import { CommissionSeller } from '../../types';

const Events = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    category: 'game' as 'game' | 'travel' | 'corporate' | 'community',
    image: '',
    description: '',
    attendees: 0,
    maxAttendees: 50,
    price: '',
    currency: 'ETB',
    featured: false,
    gallery: [] as string[],
    allowed_commission_seller_ids: [] as string[],
  });
  const [newGalleryImage, setNewGalleryImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [commissionSellers, setCommissionSellers] = useState<CommissionSeller[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        // Commission sellers should not access this page
        window.location.href = '/admin/commission-sellers';
        return;
      }
      loadEvents();
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

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await adminApi.events.update(editingEvent.id, formData);
      } else {
        await adminApi.events.create(formData);
      }
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      loadEvents();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time || '',
      location: event.location,
      category: event.category,
      image: event.image,
      description: event.description,
      attendees: event.attendees || 0,
      maxAttendees: event.maxAttendees || 50,
      price: event.price,
      currency: event.currency,
      featured: event.featured || false,
      gallery: event.gallery || [],
      allowed_commission_seller_ids: event.allowed_commission_seller_ids || [],
    });
    setNewGalleryImage('');
    setUploading(false);
    setUploadProgress('');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await adminApi.events.delete(id);
      loadEvents();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      category: 'game',
      image: '',
      description: '',
      attendees: 0,
      maxAttendees: 50,
      price: '',
      currency: 'ETB',
      featured: false,
      gallery: [],
      allowed_commission_seller_ids: [],
    });
    setNewGalleryImage('');
    setUploading(false);
    setUploadProgress('');
  };

  const toggleCommissionSeller = (sellerId: string) => {
    setFormData({
      ...formData,
      allowed_commission_seller_ids: formData.allowed_commission_seller_ids.includes(sellerId)
        ? formData.allowed_commission_seller_ids.filter(id => id !== sellerId)
        : [...formData.allowed_commission_seller_ids, sellerId],
    });
  };

  const addGalleryImage = () => {
    if (newGalleryImage.trim() && !formData.gallery.includes(newGalleryImage.trim())) {
      setFormData({
        ...formData,
        gallery: [...formData.gallery, newGalleryImage.trim()],
      });
      setNewGalleryImage('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index),
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress('');

    try {
      // First, validate all files before uploading
      const fileArray = Array.from(files);
      const invalidFiles: string[] = [];
      
      fileArray.forEach((file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          invalidFiles.push(`${file.name} is not an image file`);
        }
        // Validate file size (max 5MB)
        else if (file.size > 5 * 1024 * 1024) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          invalidFiles.push(`${file.name} is too large (${sizeMB}MB). Maximum size is 5MB`);
        }
      });

      if (invalidFiles.length > 0) {
        throw new Error(invalidFiles.join('\n'));
      }

      // Upload files one by one to show progress
      const uploadedUrls: string[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Uploading ${i + 1}/${fileArray.length}: ${file.name}...`);
        
        try {
          const url = await uploadImage(file);
          uploadedUrls.push(url);
        } catch (uploadError: any) {
          // If one file fails, continue with others but track the error
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
      }
      
      // Add all uploaded URLs to gallery
      setFormData({
        ...formData,
        gallery: [...formData.gallery, ...uploadedUrls],
      });

      setUploadProgress(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
      
      // Clear the file input
      event.target.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      // Show error in a more user-friendly way
      const errorMessage = error.message || 'Failed to upload images';
      alert(`Upload Error:\n\n${errorMessage}`);
      setUploadProgress('');
    } finally {
      setUploading(false);
      // Clear progress message after a delay
      setTimeout(() => setUploadProgress(''), 5000);
    }
  };

  return (
    <AdminLayout title="Events Management">
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => {
            resetForm();
            setEditingEvent(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FaPlus />
          Add Event
        </button>
      </div>

        {loading ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="animate-pulse p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    {event.featured && (
                      <span className="text-xs text-indigo-600">Featured</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.price} {event.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="6:00 PM"
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
                      placeholder="Enter location name or paste Google Maps link"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter location name (e.g., "Addis Ababa") or paste a Google Maps link. Users can click to view on Google Maps.
                    </p>
                    {formData.location && (
                      <a
                        href={
                          formData.location.includes('maps.google.com') || formData.location.includes('goo.gl/maps') || formData.location.includes('maps.app.goo.gl')
                            ? formData.location
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        Preview on Google Maps →
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="game">Game</option>
                      <option value="travel">Travel</option>
                      <option value="corporate">Corporate</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                  <div>
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      label="Event Image"
                      folder="events"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attendees</label>
                    <input
                      type="number"
                      value={formData.attendees}
                      onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Attendees</label>
                    <input
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 50 })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                {/* Gallery Images Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Images
                    <span className="text-xs text-gray-500 ml-2">(Additional images shown on event detail page)</span>
                  </label>
                  
                  {/* Upload images */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md transition-colors ${
                          uploading
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                            : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400'
                        }`}>
                          {uploading ? (
                            <>
                              <FaSpinner className="animate-spin text-indigo-600" />
                              <span className="text-sm text-gray-600">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <FaUpload className="text-indigo-600" />
                              <span className="text-sm text-indigo-600 font-medium">Choose Images to Upload</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    {uploadProgress && (
                      <p className="mt-2 text-sm text-gray-600">{uploadProgress}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">You can select multiple images. Max size: 5MB per image.</p>
                  </div>

                  {/* Add new gallery image by URL */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newGalleryImage}
                      onChange={(e) => setNewGalleryImage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addGalleryImage();
                        }
                      }}
                      placeholder="Or enter image URL"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={addGalleryImage}
                      disabled={!newGalleryImage.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPlus />
                      Add URL
                    </button>
                  </div>

                  {/* Gallery images preview */}
                  {formData.gallery.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.gallery.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={imageUrl}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            title="Remove image"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.gallery.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No gallery images added yet. Add image URLs above.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Commission Sellers
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which commission sellers can sell tickets for this event. Leave empty to allow all sellers.
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
                    <span className="text-sm font-medium text-gray-700">Featured Event</span>
                  </label>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEvent(null);
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
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default Events;

