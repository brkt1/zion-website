import { useEffect, useState } from 'react';
import { FaCog, FaPlus, FaSave, FaSpinner, FaTrash } from 'react-icons/fa';
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
      alert('Site configuration updated successfully!');
      loadConfig();
    } catch (error: any) {
      alert('Error saving configuration: ' + error.message);
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
    <AdminLayout title="System Settings">
      <div className="space-y-6">

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#1C2951] via-[#2b3a67] to-[#1C2951] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-[#FFD447] text-[10px] font-black uppercase tracking-wider mb-2">
              <FaCog /> Configuration
            </div>
            <h2 className="text-2xl font-black tracking-tight">Global Platform <span className="text-[#FFD447]">Settings</span></h2>
            <p className="text-xs text-slate-300 font-medium mt-1">Configure brand assets, site names, footer information, and navigation routing.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD447] hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 self-start md:self-auto"
          >
            {saving ? <FaSpinner className="animate-spin" size={13} /> : <FaSave size={13} />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <FaSpinner className="animate-spin text-4xl text-[#1C2951] mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* General Information Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Brand Identity &amp; Meta</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Site Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                  />
                </div>

                <div>
                  <ImageUpload
                    value={formData.logo}
                    onChange={(url) => setFormData({ ...formData, logo: url })}
                    label="Site Logo Asset"
                    folder="site"
                    previewClassName="w-24 h-24 object-contain rounded-2xl border border-slate-200 p-2 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Footer Statement</label>
                <textarea
                  rows={3}
                  value={formData.footerDescription}
                  onChange={(e) => setFormData({ ...formData, footerDescription: e.target.value })}
                  placeholder="Enter the official footer statement displayed across public portal pages..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                />
              </div>
            </div>

            {/* Navigation Bar Management */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Header &amp; Footer Navigation</h3>
                  <p className="text-xs text-slate-400 font-medium">Manage top bar quick links and navigation endpoints.</p>
                </div>
                <button
                  type="button"
                  onClick={addNavigationLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#1C2951] text-slate-700 hover:text-white text-xs font-extrabold transition-all"
                >
                  <FaPlus size={11} /> Add Link Item
                </button>
              </div>

              <div className="space-y-3">
                {formData.navigation.map((link, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input
                      type="text"
                      placeholder="Route Path (e.g., /events)"
                      value={link.path}
                      onChange={(e) => updateNavigationLink(index, 'path', e.target.value)}
                      className="w-full sm:flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g., Events Hub)"
                      value={link.label}
                      onChange={(e) => updateNavigationLink(index, 'label', e.target.value)}
                      className="w-full sm:flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                    />
                    <button
                      type="button"
                      onClick={() => removeNavigationLink(index)}
                      className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all self-end sm:self-auto"
                      title="Remove Link"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Save CTA */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#1C2951] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" size={13} /> : <FaSave size={13} />}
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </AdminLayout>
  );
};

export default Settings;


