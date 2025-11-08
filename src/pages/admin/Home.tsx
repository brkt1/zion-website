import { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { api, HomeContent } from '../../services/api';
import { supabase } from '../../services/supabase';

const Home = () => {
  const [, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    hero: {
      slogan: '',
      intro: '',
      categories: [] as Array<{ label: string; path: string }>,
    },
    categories: [] as Array<{ id: string; title: string; description: string; link: string; number: string }>,
    cta: {
      title: '',
      description: '',
      buttons: [] as Array<{ text: string; link: string; type: 'primary' | 'secondary' }>,
    },
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/admin/login');
  };

  const loadContent = async () => {
    try {
      const data = await api.getHomeContent();
      setContent(data);
      setFormData({
        hero: data.hero,
        categories: data.categories,
        cta: data.cta,
      });
    } catch (error) {
      console.error('Error loading home content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.homeContent.update(formData);
      await adminApi.homeContent.updateHeroCategories(formData.hero.categories);
      await adminApi.homeContent.updateHomeCategories(formData.categories);
      await adminApi.homeContent.updateCtaButtons(formData.cta.buttons);
      alert('Home content updated successfully!');
      loadContent();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addHeroCategory = () => {
    setFormData({
      ...formData,
      hero: {
        ...formData.hero,
        categories: [...formData.hero.categories, { label: '', path: '' }],
      },
    });
  };

  const removeHeroCategory = (index: number) => {
    setFormData({
      ...formData,
      hero: {
        ...formData.hero,
        categories: formData.hero.categories.filter((_, i) => i !== index),
      },
    });
  };

  const updateHeroCategory = (index: number, field: 'label' | 'path', value: string) => {
    const updated = [...formData.hero.categories];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      hero: { ...formData.hero, categories: updated },
    });
  };

  const addHomeCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { id: `temp-${Date.now()}`, title: '', description: '', link: '', number: '' }],
    });
  };

  const removeHomeCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index),
    });
  };

  const updateHomeCategory = (index: number, field: string, value: string) => {
    const updated = [...formData.categories];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, categories: updated });
  };

  const addCtaButton = () => {
    setFormData({
      ...formData,
      cta: {
        ...formData.cta,
        buttons: [...formData.cta.buttons, { text: '', link: '', type: 'primary' }],
      },
    });
  };

  const removeCtaButton = (index: number) => {
    setFormData({
      ...formData,
      cta: {
        ...formData.cta,
        buttons: formData.cta.buttons.filter((_, i) => i !== index),
      },
    });
  };

  const updateCtaButton = (index: number, field: string, value: string) => {
    const updated = [...formData.cta.buttons];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      cta: { ...formData.cta, buttons: updated },
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Home Content Management</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Slogan</label>
                <input
                  type="text"
                  value={formData.hero.slogan}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, slogan: e.target.value },
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Intro Text</label>
                <textarea
                  rows={4}
                  value={formData.hero.intro}
                  onChange={(e) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, intro: e.target.value },
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Hero Categories</label>
                  <button
                    type="button"
                    onClick={addHeroCategory}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <FaPlus className="inline mr-1" />
                    Add
                  </button>
                </div>
                {formData.hero.categories.map((cat, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={cat.label}
                      onChange={(e) => updateHeroCategory(index, 'label', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Path"
                      value={cat.path}
                      onChange={(e) => updateHeroCategory(index, 'path', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeHeroCategory(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Home Categories */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Home Categories</h2>
              <button
                type="button"
                onClick={addHomeCategory}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                <FaPlus className="inline mr-1" />
                Add Category
              </button>
            </div>
            <div className="space-y-4">
              {formData.categories.map((cat, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Number</label>
                      <input
                        type="text"
                        value={cat.number}
                        onChange={(e) => updateHomeCategory(index, 'number', e.target.value)}
                        placeholder="01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => updateHomeCategory(index, 'title', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700">Link</label>
                      <input
                        type="text"
                        value={cat.link}
                        onChange={(e) => updateHomeCategory(index, 'link', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeHomeCategory(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="col-span-12">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={2}
                        value={cat.description}
                        onChange={(e) => updateHomeCategory(index, 'description', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">CTA Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">CTA Title</label>
                <input
                  type="text"
                  value={formData.cta.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    cta: { ...formData.cta, title: e.target.value },
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CTA Description</label>
                <textarea
                  rows={3}
                  value={formData.cta.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    cta: { ...formData.cta, description: e.target.value },
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">CTA Buttons</label>
                  <button
                    type="button"
                    onClick={addCtaButton}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <FaPlus className="inline mr-1" />
                    Add Button
                  </button>
                </div>
                {formData.cta.buttons.map((btn, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Button Text"
                      value={btn.text}
                      onChange={(e) => updateCtaButton(index, 'text', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Link"
                      value={btn.link}
                      onChange={(e) => updateCtaButton(index, 'link', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    />
                    <select
                      value={btn.type}
                      onChange={(e) => updateCtaButton(index, 'type', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCtaButton(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
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

export default Home;

