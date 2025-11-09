import { useEffect, useState } from 'react';
import { FaSave } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, ContactInfo } from '../../services/api';

const Contact = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    phoneFormatted: '',
    location: '',
    socialLinks: [] as Array<{ platform: string; url: string }>,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/commission-sellers';
        return;
      }
      loadContactInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

  const loadContactInfo = async () => {
    try {
      const data = await api.getContactInfo();
      setContactInfo(data);
      setFormData({
        email: data.email,
        phone: data.phone,
        phoneFormatted: data.phoneFormatted,
        location: data.location,
        socialLinks: data.socialLinks.map(link => ({
          platform: link.platform,
          url: link.url,
        })),
      });
    } catch (error) {
      console.error('Error loading contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.contactInfo.update(formData);
      await adminApi.contactInfo.updateSocialLinks(formData.socialLinks);
      alert('Contact information updated successfully!');
      loadContactInfo();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { platform: '', url: '' }],
    });
  };

  const removeSocialLink = (index: number) => {
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter((_, i) => i !== index),
    });
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, socialLinks: updated });
  };

  return (
    <AdminLayout title="Contact Information">

        {loading ? (
          <div className="bg-white shadow rounded-lg p-6 space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone (Formatted)</label>
              <input
                type="text"
                value={formData.phoneFormatted}
                onChange={(e) => setFormData({ ...formData, phoneFormatted: e.target.value })}
                placeholder="+251 978 639 887"
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
                Enter location name (e.g., "Addis Ababa") or paste a Google Maps link.
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
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Social Links</label>
              <button
                type="button"
                onClick={addSocialLink}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add Link
              </button>
            </div>
            <div className="space-y-3">
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Platform (e.g., Instagram)"
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        )}
    </AdminLayout>
  );
};

export default Contact;

