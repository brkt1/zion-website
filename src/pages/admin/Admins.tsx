import { useEffect, useState } from 'react';
import { FaPlus, FaShieldAlt, FaTrash, FaUserShield, FaSearch, FaUserCheck, FaUsers } from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi, ExistingAccount } from '../../services/adminApi';
import { UserRole } from '../../services/auth';

const Admins = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [existingAccounts, setExistingAccounts] = useState<ExistingAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  
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

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const data = await adminApi.roles.getExistingAccounts();
      setExistingAccounts(data || []);
    } catch (err) {
      console.error('Error fetching existing accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setAccountSearch('');
    loadAccounts();
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
      case 'accountant':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAccounts = existingAccounts.filter(acc => {
    const q = accountSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.email.toLowerCase().includes(q) ||
      (acc.name && acc.name.toLowerCase().includes(q)) ||
      acc.source.toLowerCase().includes(q) ||
      (acc.role && acc.role.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout title="Team & Roles">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Administrators</h1>
            <p className="text-gray-500 text-sm">Manage dashboard access and role permissions</p>
          </div>
          <button
            onClick={openAddModal}
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
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User ID</th>
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
              Only <b>Super Admins</b> can modify these permissions. Ensure you use the correct User ID or registered Email address.
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Assign Admin Role</h2>
            <p className="text-gray-500 text-xs mb-5">Select a registered user account or enter their details manually.</p>

            {/* Quick Select Registered Account List */}
            <div className="mb-6 space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1.5">
                  <FaUsers size={12} />
                  <span>Select Registered Account ({existingAccounts.length})</span>
                </label>
                <span className="text-[10px] text-gray-400 font-bold">Click to auto-fill</span>
              </div>

              <div className="relative">
                <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search accounts by name, email, or role..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 border border-gray-200/60 rounded-xl p-2 bg-white">
                {loadingAccounts ? (
                  <p className="text-xs text-gray-400 text-center py-4 italic font-medium">Loading existing accounts...</p>
                ) : filteredAccounts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 font-medium">No matching registered user accounts found.</p>
                ) : (
                  filteredAccounts.map((acc) => {
                    const isSelected = newRole.input.toLowerCase() === acc.email.toLowerCase() || (acc.id && newRole.input === acc.id);
                    return (
                      <button
                        key={acc.email || acc.id}
                        type="button"
                        onClick={() => {
                          if (acc.email) {
                            setNewRole({ ...newRole, input: acc.email, type: 'email' });
                          } else if (acc.id) {
                            setNewRole({ ...newRole, input: acc.id, type: 'uuid' });
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20'
                            : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-xs font-black text-gray-800 truncate">
                              {acc.name || acc.email}
                            </p>
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                              {acc.source}
                            </span>
                          </div>
                          {acc.name && (
                            <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{acc.email}</p>
                          )}
                          {acc.role && (
                            <span className="inline-block text-[9px] font-extrabold text-indigo-600 bg-indigo-100/60 px-1.5 py-0.5 rounded mt-1">
                              Role: {acc.role.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        {isSelected ? (
                          <span className="text-xs font-black text-indigo-600 flex items-center gap-1 shrink-0 bg-indigo-100 px-2.5 py-1 rounded-lg">
                            <FaUserCheck size={12} /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 shrink-0">
                            Select →
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <form onSubmit={handleAddRole} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Identification Type</label>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-3 border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setNewRole({ ...newRole, type: 'email' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newRole.type === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole({ ...newRole, type: 'uuid' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newRole.type === 'uuid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    User UUID
                  </button>
                </div>

                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  {newRole.type === 'email' ? 'Registered Email Address' : 'User UUID (from Supabase)'}
                </label>
                <input
                  type={newRole.type === 'email' ? 'email' : 'text'}
                  required
                  placeholder={newRole.type === 'email' ? 'e.g. manager@yenege.com' : 'e.g. 550e8400-e29b-41d4-a716-...'}
                  value={newRole.input}
                  onChange={(e) => setNewRole({ ...newRole, input: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Role Type</label>
                <select
                  value={newRole.role}
                  onChange={(e) => setNewRole({ ...newRole, role: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="masterclass_manager">Masterclass Manager (Leads &amp; Sales)</option>
                  <option value="sponsorship_manager">Sponsorship Manager (Partners)</option>
                  <option value="accountant">Accountant (Financial Dashboard)</option>
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
