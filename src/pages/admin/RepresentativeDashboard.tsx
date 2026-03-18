import { useState } from 'react';
import { FaChartLine, FaCheckCircle, FaEdit, FaGlobe, FaHandshake, FaPlus, FaTimes, FaTrash, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import RepresentativeLayout from '../../Components/admin/RepresentativeLayout';
import SellerHeader from '../../Components/admin/SellerHeader';
import { useRepresentativeData } from '../../hooks/useRepresentativeData';
import { adminApi } from '../../services/adminApi';
import { Partner } from '../../types';

const RepresentativeDashboard = () => {
  const { rep, user, partners: initialPartners, stats: initialStats, loading, isAuthorized } = useRepresentativeData();
  const navigate = useNavigate();
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    sponsorship_amount: '',
    currency: 'ETB',
    status: 'potential' as 'potential' | 'active' | 'past',
    notes: '',
  });

  // Simple way to handle the sync after initial fetch
  const displayPartners = partners.length > 0 ? partners : initialPartners;

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      website: '',
      sponsorship_amount: '',
      currency: 'ETB',
      status: 'potential',
      notes: '',
    });
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;

    try {
      const data = {
        ...formData,
        sponsorship_amount: parseFloat(formData.sponsorship_amount),
        representative_id: rep.id,
        commission_rate: rep.default_commission_rate,
      };

      if (editingPartner) {
        await adminApi.partners.update(editingPartner.id, data);
        setPartners(prev => {
          const base = prev.length > 0 ? prev : initialPartners;
          return base.map(p => p.id === editingPartner.id ? { ...p, ...data } as Partner : p);
        });
      } else {
        const newPartner = await adminApi.partners.create(data as any);
        setPartners(prev => [newPartner, ...(prev.length > 0 ? prev : initialPartners)]);
      }
      
      setShowModal(false);
      setEditingPartner(null);
      resetForm();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to save partner'));
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      contact_person: partner.contact_person,
      email: partner.email,
      phone: partner.phone || '',
      website: partner.website || '',
      sponsorship_amount: partner.sponsorship_amount.toString(),
      currency: partner.currency,
      status: partner.status,
      notes: partner.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    try {
      await adminApi.partners.delete(id);
      setPartners(prev => (prev.length > 0 ? prev : initialPartners).filter(p => p.id !== id));
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to delete partner'));
    }
  };

  const stats = partners.length > 0 ? {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'active').length,
    totalSponsorship: partners.reduce((sum, p) => sum + p.sponsorship_amount, 0),
    totalCommission: partners.reduce((sum, p) => {
      const rate = p.commission_rate || rep?.default_commission_rate || 0;
      return sum + (p.sponsorship_amount * rate) / 100;
    }, 0),
  } : initialStats;

  if (loading) {
    return (
      <RepresentativeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Syncing with Network...</p>
          </div>
        </div>
      </RepresentativeLayout>
    );
  }

  if (!isAuthorized || !rep) {
    return (
      <RepresentativeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-[40px] shadow-2xl border border-gray-100">
            <FaHandshake className="mx-auto mb-6 text-red-500" size={64} />
            <h3 className="text-2xl font-black text-[#1C2951] mb-2 tracking-tight">Access Restricted</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">You are not registered as an active sponsorship representative in our network.</p>
            <button
              onClick={() => navigate('/admin/login')}
              className="px-8 py-4 bg-[#1C2951] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FF6F5E] transition-all shadow-xl shadow-[#1C2951]/20 hover:shadow-[#FF6F5E]/30"
            >
              Back to Login
            </button>
          </div>
        </div>
      </RepresentativeLayout>
    );
  }

  return (
    <>
      <RepresentativeLayout>
        <SellerHeader 
          seller={{ name: rep.name, is_active: rep.is_active } as any} 
          user={user} 
          title="Partners & Sponsorships" 
        />
        
        <main className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
          {/* Welcome Card - Mobile only */}
          <div className="md:hidden bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Representative Portal</p>
             <h2 className="text-2xl font-black tracking-tight">{rep.name}</h2>
             <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Operative</span>
             </div>
          </div>

          {/* Executive Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-4">Total Portfolio</p>
                 <h3 className="text-4xl font-black text-[#1C2951] tracking-tight">{stats.totalPartners}</h3>
                 <p className="text-xs font-bold text-gray-400 mt-2">Active Entities: {stats.activePartners}</p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-4">Gross Sponsorship</p>
                 <h3 className="text-4xl font-black text-[#1C2951] tracking-tight flex items-baseline gap-1">
                    {stats.totalSponsorship.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    <span className="text-xs font-bold text-gray-400 ml-1">ETB</span>
                 </h3>
                 <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Total Managed Capital</p>
              </div>
            </div>

            <div className="bg-[#1C2951] rounded-[32px] p-8 shadow-2xl shadow-[#1C2951]/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative z-10 text-white">
                  <div className="flex items-center gap-2 mb-4">
                     <FaWallet className="text-[#FFD447]" size={14} />
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none">Net Bounty</p>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight flex items-baseline gap-1">
                     {stats.totalCommission.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                     <span className="text-xs font-bold text-white/40 ml-1">ETB</span>
                  </h3>
                  <p className="text-[10px] font-black text-[#FFD447] mt-2 uppercase tracking-widest">Earned Commission</p>
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-4">Default Payout</p>
                 <h3 className="text-4xl font-black text-[#1C2951] tracking-tight">{rep.default_commission_rate}%</h3>
                 <p className="text-xs font-bold text-gray-400 mt-2">Base Multiplier</p>
              </div>
            </div>
          </div>

          {/* Assigned Partners Table */}
          <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
             <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FaHandshake size={24} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-[#1C2951] tracking-tight">Active Portfolio</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Managed Partner & Sponsor Network</p>
                   </div>
                </div>
                <div className="hidden sm:block">
                   <button
                     onClick={() => {
                        resetForm();
                        setEditingPartner(null);
                        setShowModal(true);
                     }}
                     className="flex items-center gap-2 px-6 py-3 bg-[#1C2951] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FF6F5E] transition-all shadow-xl shadow-[#1C2951]/20 hover:shadow-[#FF6F5E]/30"
                   >
                     <FaPlus size={12} /> Add New Partner
                   </button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="bg-gray-50/50">
                         <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Syndicate Entity</th>
                         <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Liaison Contact</th>
                         <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Resource Allocation</th>
                         <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Agreement Rate</th>
                         <th className="px-10 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                         <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {displayPartners.length === 0 ? (
                         <tr><td colSpan={6} className="px-10 py-24 text-center">
                            <FaChartLine className="mx-auto mb-4 text-gray-100" size={64} />
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Discovery Phase: No Partners Enlisted</p>
                         </td></tr>
                      ) : (
                         displayPartners.map((partner) => (
                            <tr key={partner.id} className="hover:bg-gray-50/50 transition-all duration-300">
                               <td className="px-10 py-10">
                                  <div className="flex items-center gap-6">
                                     <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-lg transform -rotate-3 hover:rotate-0 transition-transform">
                                        {partner.name.charAt(0)}
                                     </div>
                                     <div>
                                        <div className="text-sm font-black text-[#1C2951] mb-1">{partner.name}</div>
                                        {partner.website ? (
                                           <a href={partner.website} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-500 hover:text-[#FF6F5E] uppercase tracking-widest flex items-center gap-2 transition-colors">
                                              <FaGlobe size={10} /> Network Node
                                           </a>
                                        ) : (
                                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internal Contact</span>
                                        )}
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-10">
                                  <div className="text-xs font-black text-[#1C2951] mb-1">{partner.contact_person}</div>
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{partner.email}</div>
                               </td>
                               <td className="px-10 py-10">
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 tracking-tight">
                                     <span className="text-sm font-black text-[#1C2951]">
                                        {new Intl.NumberFormat('en-ET', { style: 'currency', currency: partner.currency }).format(partner.sponsorship_amount)}
                                     </span>
                                  </div>
                               </td>
                               <td className="px-10 py-10">
                                  <div className="inline-flex flex-col">
                                     <span className="text-lg font-black text-[#1C2951] tracking-tight">{partner.commission_rate || rep.default_commission_rate}%</span>
                                     <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest pt-1 leading-none">Net Yield</span>
                                  </div>
                               </td>
                               <td className="px-10 py-10">
                                  <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-300 ${
                                     partner.status === 'active' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                                     partner.status === 'potential' ? 'bg-blue-50 text-blue-500 border border-blue-100 shadow-blue-500/5' : 
                                     'bg-gray-50 text-gray-400 border border-gray-100'
                                  }`}>
                                     <FaCheckCircle size={12} className={partner.status === 'active' ? 'animate-pulse' : ''} />
                                     {partner.status}
                                  </div>
                               </td>
                               <td className="px-10 py-10 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                     <button onClick={() => handleEdit(partner)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-[#1C2951] hover:text-white transition-all active:scale-90"><FaEdit size={14} /></button>
                                     <button onClick={() => handleDelete(partner.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90"><FaTrash size={14} /></button>
                                  </div>
                               </td>
                            </tr>
                         ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Intelligence Notes Section */}
          <div className="bg-[#1C2951] rounded-[40px] p-12 text-white shadow-2xl shadow-[#1C2951]/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4">Executive Briefing</p>
                   <h2 className="text-4xl font-black tracking-tight leading-tight mb-8">
                      Managing the <span className="text-[#FFD447]">Sponsorship</span> Ecosystem
                   </h2>
                   <p className="text-white/60 text-sm leading-relaxed mb-8">
                      Your dashboard provides a secure environment to manage your assigned partners and sponsors. Ensure all entries are accurate and follow professional protocols.
                   </p>
                   <div className="flex gap-4">
                      <div className="flex flex-col">
                         <span className="text-2xl font-black text-[#FFD447]">{stats.totalPartners}</span>
                         <span className="text-[8px] font-black uppercase text-white/30 tracking-widest mt-1">Managed Nodes</span>
                      </div>
                      <div className="w-px h-10 bg-white/10 mx-2" />
                      <div className="flex flex-col">
                         <span className="text-2xl font-black text-emerald-400">{stats.activePartners}</span>
                         <span className="text-[8px] font-black uppercase text-white/30 tracking-widest mt-1">Live Synergies</span>
                      </div>
                   </div>
                </div>
                <div className="bg-white/5 rounded-[32px] p-8 backdrop-blur-sm border border-white/10">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                      <FaChartLine /> Performance Trajectory
                   </p>
                   <div className="space-y-6">
                      <div>
                         <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                            <span>Portfolio Activation</span>
                            <span>{Math.round((stats.activePartners / (stats.totalPartners || 1)) * 100)}%</span>
                         </div>
                         <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" style={{ width: `${(stats.activePartners / (stats.totalPartners || 1)) * 100}%` }} />
                         </div>
                      </div>
                      <div className="pt-4 p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                         <p className="text-[10px] font-black uppercase text-white/40 mb-2">Encrypted Operative Code</p>
                         <p className="text-xl font-mono text-[#FFD447] tracking-[0.5em]">{rep.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </main>
      </RepresentativeLayout>

      {/* Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[70] p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] max-w-2xl w-full p-10 shadow-2xl overflow-y-auto max-h-[90vh] relative border-8 border-emerald-50 transform animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1">Portfolio Entry</p>
                 <h2 className="text-3xl font-black text-[#1C2951] tracking-tight text-left">
                   {editingPartner ? 'Modify Syndicate Intel' : 'Enlist New Syndicate'}
                 </h2>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingPartner(null); resetForm(); }}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all text-gray-400 active:scale-90 border border-gray-100"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block text-left">Entity Name *</label>
                  <input
                    type="text" required
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-black text-[#1C2951] placeholder-gray-300"
                    placeholder="Enter partner name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block text-left">Deal Sequence</label>
                  <select
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-black text-[#1C2951] appearance-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="potential">Potential Prospect</option>
                    <option value="active">Active Synergy</option>
                    <option value="past">Legacy Archive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block text-left">Executive Liaison *</label>
                  <input
                    type="text" required
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-black text-[#1C2951]"
                    placeholder="Full identity"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block text-left">Intel Channel (Email) *</label>
                  <input
                    type="email" required
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-black text-[#1C2951]"
                    placeholder="email@syndicate.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block text-left">Capital Commitment *</label>
                  <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-colors group-focus-within/input:bg-emerald-500 group-focus-within/input:text-white">
                       <FaWallet size={12} />
                    </div>
                    <input
                      type="number" required step="0.01"
                      className="w-full bg-gray-50 border border-transparent rounded-[20px] pl-18 pr-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-black text-[#1C2951]"
                      value={formData.sponsorship_amount}
                      onChange={(e) => setFormData({...formData, sponsorship_amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block text-left">Currency Denomination</label>
                  <select
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-black text-[#1C2951] appearance-none"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="ETB">Birr (ETB)</option>
                    <option value="USD">Dollars (USD)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 block text-left">Additional Intel (Notes)</label>
                <textarea
                  className="w-full bg-gray-50 border border-transparent rounded-[32px] px-8 py-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-black text-[#1C2951] min-h-[120px] resize-none"
                  placeholder="Strategic notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-6 pt-6">
                <button type="submit" className="flex-1 bg-gradient-to-r from-[#1C2951] to-gray-900 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-[#1C2951]/30 hover:from-emerald-600 hover:to-teal-600 transform hover:scale-[1.02] active:scale-95 transition-all duration-500 uppercase tracking-widest text-sm">
                  {editingPartner ? 'Update Protocol' : 'Enlist Syndicate'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingPartner(null); resetForm(); }} className="px-10 border-2 border-gray-100 text-gray-400 font-black rounded-[24px] hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-widest text-[10px]">
                  Abort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RepresentativeDashboard;
