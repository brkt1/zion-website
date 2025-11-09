import { useEffect, useState } from 'react';
import { FaSave } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { ImageUpload } from '../../Components/admin/ImageUpload';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, SiteConfig } from '../../services/api';

const Settings = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    logo: '',
    footerDescription: '',
    navigation: [] as Array<{ path: string; label: string }>,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/seller-dashboard';
        return;
      }
      loadConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

  const loadConfig = async () => {
    try {
      const data = await api.getSiteConfig();
      setConfig(data);
      setFormData({
        siteName: data.siteName,
        logo: data.logo,
        footerDescription: data.footer.description,
        navigation: data.navigation,
      });
    } catch (error) {
      console.error('Error loading site config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.siteConfig.update({
        siteName: formData.siteName,
        logo: formData.logo,
        footer: {
          description: formData.footerDescription,
          quickLinks: formData.navigation,
        },
      });
      await adminApi.siteConfig.updateNavigation(formData.navigation);
      alert('Site settings updated successfully!');
      loadConfig();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addNavigationLink = () => {
    setFormData({
      ...formData,
      navigation: [...formData.navigation, { path: '', label: '' }],
    });
  };

  const removeNavigationLink = (index: number) => {
    setFormData({
      ...formData,
      navigation: formData.navigation.filter((_, i) => i !== index),
    });
  };

  const updateNavigationLink = (index: number, field: 'path' | 'label', value: string) => {
    const updated = [...formData.navigation];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, navigation: updated });
  };

  return (
    <AdminLayout title="Site Settings">

        {loading ? (
          <div className="bg-white shadow rounded-lg p-6 space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site Name *</label>
            <input
              type="text"
              required
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <ImageUpload
              value={formData.logo}
              onChange={(url) => setFormData({ ...formData, logo: url })}
              label="Site Logo"
              folder="site"
              previewClassName="w-32 h-32 object-contain rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Footer Description</label>
            <textarea
              rows={3}
              value={formData.footerDescription}
              onChange={(e) => setFormData({ ...formData, footerDescription: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Navigation Links</label>
              <button
                type="button"
                onClick={addNavigationLink}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add Link
              </button>
            </div>
            <div className="space-y-3">
              {formData.navigation.map((link, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Path (e.g., /events)"
                    value={link.path}
                    onChange={(e) => updateNavigationLink(index, 'path', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g., Events)"
                    value={link.label}
                    onChange={(e) => updateNavigationLink(index, 'label', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeNavigationLink(index)}
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

export default Settings;

