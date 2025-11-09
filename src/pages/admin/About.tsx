import { useEffect, useState } from 'react';
import { FaPlus, FaSave, FaTrash } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { ImageUpload } from '../../Components/admin/ImageUpload';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { AboutContent, api } from '../../services/api';

const About = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    story: { title: '', content: '' },
    mission: { title: '', content: '' },
    vision: { title: '', content: '' },
    values: [] as Array<{ number: string; title: string; description: string }>,
    milestones: [] as Array<{ year: string; title: string; description: string }>,
    ceo: {
      name: '',
      title: '',
      image: '',
      bio: '',
      quote: '',
      socialLinks: [] as Array<{ platform: string; url: string; icon?: string }>,
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/commission-sellers';
        return;
      }
      loadContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdminUser]);

  const loadContent = async () => {
    try {
      const data = await api.getAboutContent();
      setContent(data);
      setFormData({
        story: data.story,
        mission: data.mission,
        vision: data.vision,
        values: data.values,
        milestones: data.milestones,
        ceo: {
          name: data.ceo?.name || '',
          title: data.ceo?.title || '',
          image: data.ceo?.image || '',
          bio: data.ceo?.bio || '',
          quote: data.ceo?.quote || '',
          socialLinks: data.ceo?.socialLinks || [],
        },
      });
    } catch (error) {
      console.error('Error loading about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.aboutContent.update(formData);
      await adminApi.aboutContent.updateValues(formData.values);
      await adminApi.aboutContent.updateMilestones(formData.milestones);
      if (formData.ceo.name || formData.ceo.bio) {
        await adminApi.aboutContent.updateCEO(formData.ceo);
      }
      alert('About content updated successfully!');
      loadContent();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addValue = () => {
    setFormData({
      ...formData,
      values: [...formData.values, { number: '', title: '', description: '' }],
    });
  };

  const removeValue = (index: number) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index),
    });
  };

  const updateValue = (index: number, field: string, value: string) => {
    const updated = [...formData.values];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, values: updated });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { year: '', title: '', description: '' }],
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...formData.milestones];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, milestones: updated });
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      ceo: {
        ...formData.ceo,
        socialLinks: [...formData.ceo.socialLinks, { platform: '', url: '' }],
      },
    });
  };

  const removeSocialLink = (index: number) => {
    setFormData({
      ...formData,
      ceo: {
        ...formData.ceo,
        socialLinks: formData.ceo.socialLinks.filter((_, i) => i !== index),
      },
    });
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = [...formData.ceo.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      ceo: { ...formData.ceo, socialLinks: updated },
    });
  };

  return (
    <AdminLayout title="About Content Management">

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Story Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Story Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Story Title</label>
                <input
                  type="text"
                  value={formData.story.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    story: { ...formData.story, title: e.target.value },
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Story Content</label>
                <textarea
                  rows={6}
                  value={formData.story.content}
                  onChange={(e) => setFormData({
                    ...formData,
                    story: { ...formData.story, content: e.target.value },
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Mission</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.mission.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      mission: { ...formData.mission, title: e.target.value },
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    rows={4}
                    value={formData.mission.content}
                    onChange={(e) => setFormData({
                      ...formData,
                      mission: { ...formData.mission, content: e.target.value },
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Vision</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.vision.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      vision: { ...formData.vision, title: e.target.value },
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    rows={4}
                    value={formData.vision.content}
                    onChange={(e) => setFormData({
                      ...formData,
                      vision: { ...formData.vision, content: e.target.value },
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Values</h2>
              <button
                type="button"
                onClick={addValue}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                <FaPlus className="inline mr-1" />
                Add Value
              </button>
            </div>
            <div className="space-y-4">
              {formData.values.map((value, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Number</label>
                      <input
                        type="text"
                        value={value.number}
                        onChange={(e) => updateValue(index, 'number', e.target.value)}
                        placeholder="01"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={value.title}
                        onChange={(e) => updateValue(index, 'title', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={value.description}
                        onChange={(e) => updateValue(index, 'description', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeValue(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Milestones</h2>
              <button
                type="button"
                onClick={addMilestone}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                <FaPlus className="inline mr-1" />
                Add Milestone
              </button>
            </div>
            <div className="space-y-4">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input
                        type="text"
                        value={milestone.year}
                        onChange={(e) => updateMilestone(index, 'year', e.target.value)}
                        placeholder="2024"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CEO Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">CEO Section</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CEO Name</label>
                  <input
                    type="text"
                    value={formData.ceo.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      ceo: { ...formData.ceo, name: e.target.value },
                    })}
                    placeholder="John Doe"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CEO Title</label>
                  <input
                    type="text"
                    value={formData.ceo.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      ceo: { ...formData.ceo, title: e.target.value },
                    })}
                    placeholder="Chief Executive Officer"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <ImageUpload
                  value={formData.ceo.image}
                  onChange={(url) => setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, image: url },
                  })}
                  label="CEO Image"
                  folder="about"
                  previewClassName="w-32 h-32 object-cover rounded-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CEO Quote</label>
                <textarea
                  rows={2}
                  value={formData.ceo.quote}
                  onChange={(e) => setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, quote: e.target.value },
                  })}
                  placeholder="An inspiring quote from the CEO"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CEO Bio</label>
                <textarea
                  rows={6}
                  value={formData.ceo.bio}
                  onChange={(e) => setFormData({
                    ...formData,
                    ceo: { ...formData.ceo, bio: e.target.value },
                  })}
                  placeholder="A detailed biography of the CEO"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              {/* Social Links */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Social Links</label>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <FaPlus className="inline mr-1" />
                    Add Social Link
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.ceo.socialLinks.map((social, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                          <label className="block text-sm font-medium text-gray-700">Platform</label>
                          <input
                            type="text"
                            value={social.platform}
                            onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                            placeholder="LinkedIn, Twitter, etc."
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div className="col-span-7">
                          <label className="block text-sm font-medium text-gray-700">URL</label>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
        )}
    </AdminLayout>
  );
};

export default About;

