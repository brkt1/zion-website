import { useEffect, useState } from 'react';
import { FaPlus, FaShieldAlt, FaTrash, FaUserShield } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { UserRole } from '../../services/auth';

const Admins = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState({
    input: '',
    type: 'email' as 'email' | 'uuid',
    role: 'masterclass_manager' as any
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await adminApi.roles.getAll();
      setRoles(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
      if (err.code === '42501') {
        setError('Permission Denied (403). Please run the fix-role-management.sql script in Supabase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.input) return;

    setSaving(true);
    try {
      if (newRole.type === 'email') {
        const result = await adminApi.roles.assignByEmail(newRole.input, newRole.role);
        if (result.success) {
          alert(result.message);
        } else {
          throw new Error(result.message);
        }
      } else {
        await adminApi.roles.update(newRole.input, newRole.role);
        alert('Role assigned successfully!');
      }
      
      await loadRoles();
      setShowAddModal(false);
      setNewRole({ input: '', type: 'email', role: 'masterclass_manager' });
    } catch (err: any) {
      console.error('Error assigning role:', err);
      if (err.code === '42501') {
        alert('Error 403 Forbidden: You do not have permission to modify roles. Please run the fix-role-management.sql script in your Supabase SQL Editor.');
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this admin role?')) return;

    try {
      await adminApi.roles.delete(userId);
      setRoles(roles.filter(r => r.user_id !== userId));
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'masterclass_manager':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'sponsorship_manager':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout title="Team & Roles">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Administrators</h1>
            <p className="text-gray-500 text-sm">Manage dashboard access and role permissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <FaPlus size={12} />
            <span>Assign New Role</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User ID / Email</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">System Role</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Granted On</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No administrators found
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <FaUserShield size={14} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 font-mono">{role.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRoleBadge(role.role)}`}>
                        {role.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-400">
                      {new Date(role.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteRole(role.user_id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-start gap-4">
          <FaShieldAlt className="text-indigo-600 mt-1" size={18} />
          <div>
            <h3 className="text-sm font-bold text-indigo-900 mb-1">Security Note</h3>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Assigning a <b>Masterclass Manager</b> role allows the user to manage e-learning leads and analytics. 
              Only <b>Super Admins</b> can modify these permissions. Ensure you use the correct User ID from the Supabase Authentication dashboard.
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Assign Admin Role</h2>
            <p className="text-gray-500 text-sm mb-6">Assign system permissions to a registered user.</p>

            <form onSubmit={handleAddRole} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">User UUID (from Supabase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={newRole.userId}
                  onChange={(e) => setNewRole({ ...newRole, userId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Role Type</label>
                <select
                  value={newRole.role}
                  onChange={(e) => setNewRole({ ...newRole, role: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="masterclass_manager">Masterclass Manager (Leads & Sales)</option>
                  <option value="sponsorship_manager">Sponsorship Manager (Partners)</option>
                  <option value="admin">Super Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {saving ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Admins;
