import { useEffect, useState } from 'react';
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaEdit,
    FaEnvelope,
    FaPhoneAlt,
    FaPlus,
    FaQrcode,
    FaSearch,
    FaStickyNote,
    FaTimes,
    FaTimesCircle,
    FaTrash,
    FaUserShield
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminApi } from '../../services/adminApi';
import { TicketScanner } from '../../types';

const TicketScanners = () => {
  const { loading: authLoading, isAdminUser } = useAdminAuth();
  const [scanners, setScanners] = useState<TicketScanner[]>([]);
  const [filteredScanners, setFilteredScanners] = useState<TicketScanner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScanner, setEditingScanner] = useState<TicketScanner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    if (!authLoading && isAdminUser) {
      loadScanners();
    }
  }, [authLoading, isAdminUser]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = scanners.filter(scanner => 
      scanner.name.toLowerCase().includes(query) || 
      scanner.email.toLowerCase().includes(query) ||
      (scanner.phone && scanner.phone.includes(query))
    );
    setFilteredScanners(filtered);
  }, [searchQuery, scanners]);

  const loadScanners = async () => {
    try {
      const data = await adminApi.ticketScanners.getAll();
      setScanners(data || []);
      setFilteredScanners(data || []);
    } catch (error) {
      console.error('Error loading ticket scanners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scannerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        is_active: formData.is_active,
        notes: formData.notes || undefined,
      };

      if (editingScanner) {
        await adminApi.ticketScanners.update(editingScanner.id, scannerData);
      } else {
        await adminApi.ticketScanners.create(scannerData);
      }
      setShowModal(false);
      setEditingScanner(null);
      resetForm();
      loadScanners();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to save scanner'));
    }
  };

  const handleEdit = (scanner: TicketScanner) => {
    setEditingScanner(scanner);
    setFormData({
      name: scanner.name,
      email: scanner.email,
      phone: scanner.phone || '',
      is_active: scanner.is_active,
      notes: scanner.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket scanner?')) return;
    try {
      await adminApi.ticketScanners.delete(id);
      loadScanners();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to delete scanner'));
    }
  };

  const toggleActive = async (scanner: TicketScanner) => {
    try {
      await adminApi.ticketScanners.update(scanner.id, {
        is_active: !scanner.is_active,
      });
      loadScanners();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to update scanner status'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      is_active: true,
      notes: '',
    });
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#FFD447] border-t-[#FF6F5E] rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-[#FFD447]/20"></div>
            <p className="text-[#1C2951] font-bold tracking-tight">Loading Scanners Hub...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdminUser) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
          <div className="text-center bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 max-w-md mx-4">
            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <FaTimesCircle className="text-red-500" size={48} />
            </div>
            <h3 className="text-3xl font-black text-[#1C2951] mb-4 tracking-tight">Access Denied</h3>
            <p className="text-gray-500 font-medium leading-relaxed">You don't have the necessary administrative privileges to access this secure area.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Ticket Scanners">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header Stats / Action Bar */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C2951] to-[#2A3F75] flex items-center justify-center shadow-lg shadow-[#1C2951]/20">
                <FaUserShield className="text-[#FFD447]" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#1C2951] tracking-tight">Scanner Registry</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Authority Management System</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
             {/* Search Bar */}
             <div className="relative w-full sm:w-80 group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6F5E] transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="Search by name, email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#FFD447]/10 focus:border-[#FFD447] outline-none transition-all font-bold text-gray-700 shadow-sm"
                />
              </div>

            <button
              onClick={() => {
                resetForm();
                setEditingScanner(null);
                setShowModal(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-sm tracking-tight transition-all shadow-xl shadow-[#FF6F5E]/20 hover:shadow-2xl hover:shadow-[#FF6F5E]/30 hover:-translate-y-0.5 active:translate-y-0 scale-100 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
            >
              <FaPlus />
              <span>Register New Scanner</span>
            </button>
          </div>
        </div>

        {/* Scanners Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-[32px] shadow-sm border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : filteredScanners.length === 0 ? (
          <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 p-12 sm:p-20 text-center border border-gray-50 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 relative">
              <FaQrcode className="text-gray-300" size={48} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-50">
                <FaSearch className="text-[#FF6F5E]" size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-[#1C2951] mb-3 tracking-tight">No Scanners Found</h3>
            <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              {searchQuery ? `We couldn't find any scanners matching "${searchQuery}". Try broadening your search.` : "The registry is currently empty. Get started by registering your first authorized device scanner."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-sm transition-all shadow-xl shadow-[#FF6F5E]/20 hover:shadow-2xl hover:shadow-[#FF6F5E]/30 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
              >
                <FaPlus />
                <span>Initialize First Scanner</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredScanners.map((scanner) => (
              <div 
                key={scanner.id} 
                className="group bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/30 border border-gray-50 hover:border-[#FFD447]/50 hover:shadow-2xl hover:shadow-[#FFD447]/10 transition-all duration-500 relative flex flex-col"
              >
                {/* Active/Inactive Status Badge */}
                <div className="absolute top-6 right-6">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleActive(scanner);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      scanner.is_active
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${scanner.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {scanner.is_active ? 'Active' : 'Offline'}
                  </button>
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-4 mb-8">
                   <div className="relative">
                      <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-white text-2xl font-black">{scanner.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-[#FFD447] flex items-center justify-center shadow-md border-2 border-white">
                        <FaQrcode className="text-[#1C2951]" size={10} />
                      </div>
                   </div>
                   <div className="min-w-0 flex-1">
                      <h4 className="text-xl font-black text-[#1C2951] truncate pr-16">{scanner.name}</h4>
                      <p className="text-[10px] font-bold text-[#FF6F5E] uppercase tracking-widest mt-0.5">Authorized Scanner</p>
                   </div>
                </div>

                {/* Info List */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <FaEnvelope size={12} />
                    </div>
                    <span className="text-sm font-bold truncate">{scanner.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <FaPhoneAlt size={12} />
                    </div>
                    <span className="text-sm font-bold">{scanner.phone || 'No Phone Registered'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <FaCalendarAlt size={12} />
                    </div>
                    <span className="text-sm font-bold">Enrolled: {new Date(scanner.created_at).toLocaleDateString()}</span>
                  </div>
                  {scanner.notes && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#f8f9fa] border border-gray-100 border-dashed">
                       <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1C2951] mb-1">
                        <FaStickyNote className="text-[#FFD447]" size={10} /> Notes
                      </span>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2">{scanner.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleEdit(scanner)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1C2951] text-white text-xs font-black hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                  >
                    <FaEdit size={14} />
                    <span>Re-Configure</span>
                  </button>
                  <button
                    onClick={() => handleDelete(scanner.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100 hover:border-red-500"
                    title="Revoke Path"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal - Redesigned for Premium Look */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-[#1C2951]/40 backdrop-blur-md transition-opacity duration-500"
              onClick={() => {
                setShowModal(false);
                setEditingScanner(null);
                resetForm();
              }}
            />
            
            <div className="relative bg-white rounded-[48px] shadow-2xl shadow-black/20 w-full max-w-xl max-h-[90vh] overflow-hidden transform transition-all duration-500 scale-100 animate-in fade-in zoom-in-95">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD447] to-[#FF6F5E]" />
              
              <div className="p-8 sm:p-12 overflow-y-auto max-h-[calc(90vh-10px)] scrollbar-hide">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-[#1C2951] tracking-tight">
                      {editingScanner ? 'Modify Registry' : 'New Enrollment'}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Configure scanner credentials</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingScanner(null);
                      resetForm();
                    }}
                    className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
                        Full Identification Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Front Gate Scanner"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#FFD447] focus:ring-4 focus:ring-[#FFD447]/10 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
                        Secure Access Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="scanner@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#FFD447] focus:ring-4 focus:ring-[#FFD447]/10 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
                        Contact Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+251 9..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#FFD447] focus:ring-4 focus:ring-[#FFD447]/10 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
                      Administrative Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Permissions, locations, or special instructions..."
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#FFD447] focus:ring-4 focus:ring-[#FFD447]/10 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-[#f8f9fa] rounded-2xl group cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${formData.is_active ? 'bg-[#FF6F5E] border-[#FF6F5E]' : 'bg-white border-gray-200'}`}>
                        {formData.is_active && <FaCheckCircle className="text-white" size={14} />}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-[#1C2951] tracking-tight">Immediate Authorization</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Scanner will be able to verify tickets instantly</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      className="flex-1 py-5 rounded-[22px] text-white font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-[#FF6F5E]/20 hover:shadow-2xl hover:shadow-[#FF6F5E]/30 hover:-translate-y-1 active:translate-y-0"
                      style={{ background: 'linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)' }}
                    >
                      {editingScanner ? 'Commit Changes' : 'Complete Enrollment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingScanner(null);
                        resetForm();
                      }}
                      className="sm:w-32 py-5 rounded-[22px] bg-gray-100 text-gray-500 font-black text-sm tracking-widest uppercase hover:bg-gray-200 transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TicketScanners;

