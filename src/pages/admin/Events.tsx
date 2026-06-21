import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaSpinner, FaTimes, FaTrash, FaUpload, FaEye, FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Components/admin/AdminLayout';
import { ImageUpload } from '../../Components/admin/ImageUpload';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useCommissionSellers } from '../../hooks/useApi';
import { adminApi } from '../../services/adminApi';
import { api, Event } from '../../services/api';
import { uploadImage } from '../../services/upload';

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
    social_media_link: '',
    telegram_link: '',
  });

  // ── Ticket tiers ─────────────────────────────────────────────────────────
  // Each tier: { name: string; price: string }
  // Serialised to/from event.price as "VIP: 1000, Regular: 500"
  const [ticketTiers, setTicketTiers] = useState<{ name: string; price: string }[]>([
    { name: '', price: '' },
  ]);

  /** Convert tiers array → price string stored in DB */
  const serilaizeTiers = (tiers: { name: string; price: string }[]) => {
    const filled = tiers.filter(t => t.price.trim() !== '');
    if (filled.length === 0) return '';
    if (filled.length === 1 && filled[0].name.trim() === '') return filled[0].price.trim();
    return filled.map(t => `${t.name.trim() || 'Ticket'}: ${t.price.trim()}`).join(', ');
  };

  /** Parse a price string back to tiers for editing */
  const parseTiers = (price: string): { name: string; price: string }[] => {
    if (!price || price === '0' || price.toLowerCase() === 'free') return [{ name: '', price: price || '' }];
    if (price.includes(':')) {
      const parts = price.split(',').map(p => p.trim());
      return parts.map(p => {
        const idx = p.indexOf(':');
        if (idx === -1) return { name: '', price: p.trim() };
        return { name: p.substring(0, idx).trim(), price: p.substring(idx + 1).trim() };
      });
    }
    return [{ name: '', price: price }];
  };

  const addTier = () => setTicketTiers(prev => [...prev, { name: '', price: '' }]);
  const removeTier = (i: number) => setTicketTiers(prev => prev.filter((_, idx) => idx !== i));
  const updateTier = (i: number, field: 'name' | 'price', value: string) =>
    setTicketTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  // ─────────────────────────────────────────────────────────────────────────

  const [newGalleryImage, setNewGalleryImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  // Use cached hook for commission sellers
  const { sellers: commissionSellers } = useCommissionSellers();

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        // Commission sellers should not access this page
        window.location.href = '/admin/seller-dashboard';
        return;
      }
      loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

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
    const serializedPrice = serilaizeTiers(ticketTiers);
    const payload = { ...formData, price: serializedPrice };
    try {
      if (editingEvent) {
        await adminApi.events.update(editingEvent.id, payload);
      } else {
        await adminApi.events.create(payload);
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
      social_media_link: event.social_media_link || '',
      telegram_link: event.telegram_link || '',
    });
    setTicketTiers(parseTiers(event.price));
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
      social_media_link: '',
      telegram_link: '',
    });
    setTicketTiers([{ name: '', price: '' }]);
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
      <div className="mb-4 sm:mb-6 flex items-center justify-end">
        <button
          onClick={() => {
            resetForm();
            setEditingEvent(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg text-white transition-all shadow-md hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
        >
          <FaPlus />
          <span>Add Event</span>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Price</th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="mt-1 sm:hidden text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()} • {event.category}
                      </div>
                      {event.featured && (
                        <span className="text-xs mt-1 inline-block" style={{ color: '#FF6F5E' }}>Featured</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ background: 'rgba(255, 212, 71, 0.2)', color: '#C73A26' }}>
                        {event.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                      {event.location}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                      {event.price} {event.currency}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                          to={`/admin/events/${event.id}`}
                          className="p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors"
                          style={{ color: '#6366f1' }}
                          title="View Registrations"
                        >
                          <FaEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors"
                          style={{ color: '#FF6F5E' }}
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors text-red-600"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* Sticky header */}
              <div className="flex items-center justify-between p-4 sm:p-6 pb-2 border-b border-gray-100 shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingEvent(null); resetForm(); }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onChange={(e) => {
                        const newCategory = e.target.value as any;
                        // Auto-set price to 0 for community events
                        const newPrice = newCategory === 'community' ? '0' : formData.price;
                        setFormData({ ...formData, category: newCategory, price: newPrice });
                      }}
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
                  {/* ── Ticket Tiers / Pricing ─────────────────────────────── */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Ticket Pricing *
                      </label>
                      {formData.category !== 'community' && (
                        <button
                          type="button"
                          onClick={addTier}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white transition-all"
                          style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
                        >
                          <FaPlus size={10} /> Add Ticket Type
                        </button>
                      )}
                    </div>

                    {formData.category === 'community' ? (
                      <p className="text-sm text-gray-500 italic bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                        Community events are free — no pricing required.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {ticketTiers.map((tier, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <div className="flex-1 relative">
                              <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                              <input
                                type="text"
                                value={tier.name}
                                onChange={(e) => updateTier(i, 'name', e.target.value)}
                                placeholder={ticketTiers.length === 1 ? 'Tier name (optional)' : `Tier name (e.g. VIP)`}
                                className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                              />
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={tier.price}
                              onChange={(e) => updateTier(i, 'price', e.target.value)}
                              placeholder="Price"
                              required={i === 0}
                              className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                            />
                            <span className="text-xs text-gray-500 w-8 shrink-0">{formData.currency}</span>
                            {ticketTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTier(i)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove tier"
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        {ticketTiers.length > 1 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Ticket types will appear as a dropdown on the event page.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* ─────────────────────────────────────────────────────────── */}
                  {(() => {
                    const isFreeEvent = formData.category === 'community' || (() => {
                      const p = serilaizeTiers(ticketTiers);
                      return p === '0' || p.toLowerCase() === 'free' || parseFloat(p.replace(/[^0-9.]/g, '') || '0') === 0;
                    })();
                    if (!isFreeEvent) return null;
                    return (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Telegram Group Link *</label>
                          <input
                            type="url"
                            required
                            value={formData.telegram_link}
                            onChange={(e) => setFormData({ ...formData, telegram_link: e.target.value })}
                            placeholder="https://t.me/yourgroupname"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                          <p className="mt-1 text-xs text-gray-500">Telegram group link where users will be redirected after registration</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Social Media Link (Optional)</label>
                          <input
                            type="url"
                            value={formData.social_media_link}
                            onChange={(e) => setFormData({ ...formData, social_media_link: e.target.value })}
                            placeholder="https://www.facebook.com/events/..."
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                          <p className="mt-1 text-xs text-gray-500">Additional social media link (Facebook, Instagram, etc.)</p>
                        </div>
                      </>
                    );
                  })()}
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

                </form>
              </div>

              {/* Sticky footer with action buttons */}
              <div className="shrink-0 border-t border-gray-100 px-4 sm:px-6 py-4 bg-white rounded-b-lg flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="event-form"
                  className="px-6 py-2 text-white rounded-md transition-all shadow-md hover:shadow-lg font-semibold"
                  style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default Events;

