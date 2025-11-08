import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { api, ContactInfo } from '../../services/api';
import { supabase } from '../../services/supabase';

const Contact = () => {
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
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadContactInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/admin/login');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Contact Information</h1>
        </div>

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
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
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
      </div>
    </div>
  );
};

export default Contact;

