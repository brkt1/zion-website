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
    is_registration_open: true,
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

  // ── Event Collaborators ──────────────────────────────────────────────────
  const [eventCollaborators, setEventCollaborators] = useState<any[]>([]);
  const [newCollaborator, setNewCollaborator] = useState({ name: '', email: '', access_code: '', role: 'Collaborator', phone: '' });
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

  const loadCollaborators = async (eventId: string) => {
    setLoadingCollaborators(true);
    try {
      const data = await adminApi.eventCollaborators.getByEvent(eventId);
      setEventCollaborators(data || []);
    } catch (e) {
      console.error('Error loading collaborators:', e);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!editingEvent) return;
    if (!newCollaborator.name || !newCollaborator.email || !newCollaborator.access_code) {
      alert('Name, email, and access code are required');
      return;
    }
    try {
      await adminApi.eventCollaborators.create({
        event_id: editingEvent.id,
        ...newCollaborator
      });
      setNewCollaborator({ name: '', email: '', access_code: '', role: 'Collaborator', phone: '' });
      loadCollaborators(editingEvent.id);
    } catch (e: any) {
      alert('Error adding collaborator: ' + e.message);
    }
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) return;
    try {
      await adminApi.eventCollaborators.delete(id);
      if (editingEvent) loadCollaborators(editingEvent.id);
    } catch (e: any) {
      alert('Error deleting collaborator: ' + e.message);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

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
      is_registration_open: event.is_registration_open !== false,
    });
    setTicketTiers(parseTiers(event.price));
    setNewGalleryImage('');
    setUploading(false);
    setUploadProgress('');
    setEventCollaborators([]);
    loadCollaborators(event.id);
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
      is_registration_open: true,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <div key={event.id} className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col group bg-white" style={{ minHeight: '300px' }}>
                
                {/* Event Image Banner */}
                <div className="relative h-40 shrink-0 overflow-hidden">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {event.category}
                    </span>
                    {event.featured && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/90 text-white shadow-sm">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {/* Date Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md rounded-lg p-2 text-center border border-white/20 min-w-[50px]">
                    <p className="text-white text-xs uppercase font-bold leading-none mb-1">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-white text-lg font-black leading-none">
                      {new Date(event.date).getDate()}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 line-clamp-2">{event.title}</h3>
                  
                  <div className="space-y-1.5 mt-auto text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaTag className="text-gray-400 shrink-0" size={12} />
                      <span className="font-medium text-gray-700 truncate">{event.price} {event.currency}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-gray-400 font-bold shrink-0">@</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-3 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <Link
                    to={`/admin/events/${event.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 font-semibold text-xs transition-colors"
                  >
                    <FaEye size={12} /> View
                  </Link>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-orange-500 hover:bg-orange-50 font-semibold text-xs transition-colors"
                  >
                    <FaEdit size={12} /> Edit
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-red-500 hover:bg-red-50 font-semibold text-xs transition-colors"
                  >
                    <FaTrash size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Sticky header */}
              <div className="flex items-center justify-between p-5 sm:px-8 sm:py-6 border-b border-gray-100 shrink-0 bg-white z-10">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingEvent(null); resetForm(); }}
                  className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-5 sm:px-8 sm:py-6 bg-gray-50/30">
                <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Info Section */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Basic Details</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Event Title *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                          placeholder="e.g. Splash & Run Carnival 2026"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Time</label>
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          placeholder="6:00 PM"
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Location *</label>
                        <input
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Enter location name or paste Google Maps link"
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[11px] text-gray-500">Users can click to view on Google Maps.</p>
                          {formData.location && (
                            <a
                              href={
                                formData.location.includes('maps.google.com') || formData.location.includes('goo.gl/maps') || formData.location.includes('maps.app.goo.gl')
                                  ? formData.location
                                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Preview Map →
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category *</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => {
                            const newCategory = e.target.value as any;
                            const newPrice = newCategory === 'community' ? '0' : formData.price;
                            setFormData({ ...formData, category: newCategory, price: newPrice });
                          }}
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        >
                          <option value="game">Game</option>
                          <option value="travel">Travel</option>
                          <option value="corporate">Corporate</option>
                          <option value="community">Community</option>
                        </select>
                      </div>
                      
                      <div className="sm:col-span-2 pt-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description *</label>
                        <textarea
                          required
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none resize-none"
                          placeholder="Describe your event..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media Section */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Media & Cover</h3>
                    <div className="sm:col-span-2">
                      <ImageUpload
                        value={formData.image}
                        onChange={(url) => setFormData({ ...formData, image: url })}
                        label="Primary Event Cover"
                        folder="events"
                        required
                      />
                    </div>
                  </div>

                  {/* Ticketing & Pricing */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Ticketing & Capacity</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Ticket Pricing *
                          </label>
                          {formData.category !== 'community' && (
                            <button
                              type="button"
                              onClick={addTier}
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                              style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
                            >
                              <FaPlus size={10} /> Add Ticket Type
                            </button>
                          )}
                        </div>

                        {formData.category === 'community' ? (
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                            <p className="text-sm text-blue-800 font-medium text-center">
                              Community events are automatically free — no pricing required.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {ticketTiers.map((tier, i) => (
                              <div key={i} className="flex gap-3 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                <div className="flex-1 relative">
                                  <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                  <input
                                    type="text"
                                    value={tier.name}
                                    onChange={(e) => updateTier(i, 'name', e.target.value)}
                                    placeholder={ticketTiers.length === 1 ? 'Tier name (optional)' : `e.g. VIP or Early Bird`}
                                    className="w-full border border-gray-200 bg-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                  />
                                </div>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    value={tier.price}
                                    onChange={(e) => updateTier(i, 'price', e.target.value)}
                                    placeholder="Price"
                                    required={i === 0}
                                    className="w-32 border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-12"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">{formData.currency}</span>
                                </div>
                                {ticketTiers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeTier(i)}
                                    className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all shrink-0"
                                    title="Remove tier"
                                  >
                                    <FaTimes size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {(() => {
                        const isFreeEvent = formData.category === 'community' || (() => {
                          const p = serilaizeTiers(ticketTiers);
                          return p === '0' || p.toLowerCase() === 'free' || parseFloat(p.replace(/[^0-9.]/g, '') || '0') === 0;
                        })();
                        if (!isFreeEvent) return null;
                        return (
                          <>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Telegram Group Link *</label>
                              <input
                                type="url"
                                required
                                value={formData.telegram_link}
                                onChange={(e) => setFormData({ ...formData, telegram_link: e.target.value })}
                                placeholder="https://t.me/yourgroupname"
                                className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                              />
                              <p className="mt-1 text-[11px] text-gray-500">Users are redirected here after free registration.</p>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Social Media Link (Optional)</label>
                              <input
                                type="url"
                                value={formData.social_media_link}
                                onChange={(e) => setFormData({ ...formData, social_media_link: e.target.value })}
                                placeholder="https://www.facebook.com/events/..."
                                className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                              />
                            </div>
                          </>
                        );
                      })()}
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Current Attendees</label>
                        <input
                          type="number"
                          value={formData.attendees}
                          onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 0 })}
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Max Capacity</label>
                        <input
                          type="number"
                          value={formData.maxAttendees}
                          onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 50 })}
                          className="block w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                
                {/* Gallery & Extras */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Additional Media</h3>
                    
                    <div className="space-y-4">
                      <p className="text-[11px] text-gray-500 mb-2">Upload additional images to display in the event detail page gallery.</p>
                      
                      <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                          <div className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-colors ${
                            uploading
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'border-orange-200 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-300'
                          }`}>
                            {uploading ? (
                              <>
                                <FaSpinner className="animate-spin text-orange-500" />
                                <span className="text-sm text-gray-600 font-medium">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <FaUpload className="text-orange-500" />
                                <span className="text-sm text-orange-600 font-bold">Choose Images to Upload</span>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                      
                      {uploadProgress && (
                        <p className="text-[11px] font-bold text-orange-600">{uploadProgress}</p>
                      )}
                      
                      <div className="flex gap-3">
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
                          placeholder="Or paste an image URL directly"
                          className="flex-1 border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={addGalleryImage}
                          disabled={!newGalleryImage.trim()}
                          className="px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <FaPlus size={12} /> Add
                        </button>
                      </div>

                      {formData.gallery.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                          {formData.gallery.map((imageUrl, index) => (
                            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                              <img
                                src={imageUrl}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f9fafb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" font-weight="bold" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors transform scale-75 group-hover:scale-100 duration-200"
                                  title="Remove image"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Settings & Permissions</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Commission Sellers
                      </label>
                      <p className="text-[11px] text-gray-500 mb-3">
                        Select which commission sellers can sell tickets for this event. Leave empty to allow all active sellers.
                      </p>
                      
                      <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                        {commissionSellers.length === 0 ? (
                          <p className="text-[11px] text-gray-500 italic text-center py-4">No commission sellers available</p>
                        ) : (
                          commissionSellers.map((seller) => (
                            <label
                              key={seller.id}
                              className="flex items-center gap-3 cursor-pointer hover:bg-white p-2.5 rounded-lg border border-transparent hover:border-gray-200 transition-all shadow-sm hover:shadow"
                            >
                              <div className="relative flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={formData.allowed_commission_seller_ids.includes(seller.id)}
                                  onChange={() => toggleCommissionSeller(seller.id)}
                                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all checked:bg-orange-500 checked:border-orange-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{seller.name}</p>
                                {seller.email && <p className="text-[10px] text-gray-500 truncate">{seller.email}</p>}
                              </div>
                              {!seller.is_active && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-red-100 text-red-600">Inactive</span>}
                            </label>
                          ))
                        )}
                      </div>
                      {formData.allowed_commission_seller_ids.length > 0 && (
                        <p className="text-[10px] font-bold text-orange-600 mt-2 text-right">
                          {formData.allowed_commission_seller_ids.length} seller(s) explicitly allowed
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-50">
                      <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all checked:bg-orange-500 checked:border-orange-500"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Featured Event</span>
                          <p className="text-[10px] text-gray-500">Display this event prominently on the homepage.</p>
                        </div>
                      </label>
                    </div>

                    <div className="pt-2 border-t border-gray-50 mt-4">
                      <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={formData.is_registration_open !== false}
                            onChange={(e) => setFormData({ ...formData, is_registration_open: e.target.checked })}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all checked:bg-orange-500 checked:border-orange-500"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Registration Open</span>
                          <p className="text-[10px] text-gray-500">Allow users to register/buy tickets for this event.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {editingEvent && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-3">Event Collaborators</h3>
                      
                      <p className="text-[11px] text-gray-500">Add collaborators (like co-organizers) who can view this event's details and attendees.</p>
                      
                      {loadingCollaborators ? (
                        <div className="flex justify-center p-4"><FaSpinner className="animate-spin text-orange-500" /></div>
                      ) : (
                        <div className="space-y-4">
                          {eventCollaborators.length > 0 ? (
                            <div className="space-y-2">
                              {eventCollaborators.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">{c.name} <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-1">{c.role}</span></p>
                                    <p className="text-[11px] text-gray-500">{c.email} | Code: <span className="font-mono text-gray-800">{c.access_code}</span></p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCollaborator(c.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove Collaborator"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No collaborators added yet.</p>
                          )}
                          
                          <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100/50 space-y-3 mt-4">
                            <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider">Add New Collaborator</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Full Name *"
                                value={newCollaborator.name}
                                onChange={e => setNewCollaborator({...newCollaborator, name: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                              />
                              <input
                                type="email"
                                placeholder="Email Address *"
                                value={newCollaborator.email}
                                onChange={e => setNewCollaborator({...newCollaborator, email: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Role (e.g. Co-organizer)"
                                value={newCollaborator.role}
                                onChange={e => setNewCollaborator({...newCollaborator, role: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Access Code *"
                                  value={newCollaborator.access_code}
                                  onChange={e => setNewCollaborator({...newCollaborator, access_code: e.target.value})}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddCollaborator}
                                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center whitespace-nowrap"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </form>
              </div>

              {/* Sticky footer with action buttons */}
              <div className="shrink-0 border-t border-gray-100 px-5 sm:px-8 py-5 bg-white z-10 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 rounded-xl text-sm font-black text-gray-900 transition-all shadow-md hover:shadow-lg order-1 sm:order-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    editingEvent ? 'Save Changes' : 'Create Event'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default Events;

