import { useEffect, useState } from 'react';
import { FaEdit, FaFolder, FaPlus, FaSpinner, FaTag, FaTrash } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { api, Category } from '../../services/api';

const Categories = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    icon: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdminUser) {
        window.location.href = '/admin/seller-dashboard';
        return;
      }
      loadCategories();
    }
  }, [authLoading, isAdminUser]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.categories.update(editingCategory.id, formData);
      } else {
        await adminApi.categories.create(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (error: any) {
      alert('Error saving category: ' + error.message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      icon: category.icon || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminApi.categories.delete(id);
      loadCategories();
    } catch (error: any) {
      alert('Error deleting category: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', slug: '', icon: '' });
  };

  return (
    <AdminLayout title="Category Management">
      <div className="space-y-6">

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#1C2951] via-[#2b3a67] to-[#1C2951] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-[#FFD447] text-[10px] font-black uppercase tracking-wider mb-2">
              <FaTag /> Taxonomy &amp; Tags
            </div>
            <h2 className="text-2xl font-black tracking-tight">Event <span className="text-[#FFD447]">Categories</span></h2>
            <p className="text-xs text-slate-300 font-medium mt-1">Organize portal events into structured categories for better discoverability.</p>
          </div>
          <button
            onClick={() => { resetForm(); setEditingCategory(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FFD447] hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5 self-start sm:self-auto"
          >
            <FaPlus size={12} /> Add Category
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <FaSpinner className="animate-spin text-4xl text-[#1C2951] mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Categories...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200">
                            <FaFolder size={14} />
                          </div>
                          <span className="text-sm font-black text-slate-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono font-bold">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600 max-w-xs truncate hidden md:table-cell">
                        {cat.description || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#1C2951] text-slate-600 hover:text-white transition-all shadow-sm"
                            title="Edit Category"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-400 hover:text-white transition-all shadow-sm"
                            title="Delete"
                          >
                            <FaTrash size={13} />
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

        {/* Category Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); setEditingCategory(null); resetForm(); }}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Icon Keyword</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. music, trophy, briefcase"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFD447]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingCategory(null); resetForm(); }}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-[#1C2951] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:bg-slate-800"
                  >
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Categories;


