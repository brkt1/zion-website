import { useState } from 'react';
import {
  FaEdit,
  FaGlobe,
  FaHandshake,
  FaPlus,
  FaTimes,
  FaTrash,
  FaUsers,
  FaWallet
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { usePartners, useRepresentatives } from '../../hooks/useApi';
import { adminApi } from '../../services/adminApi';
import { Partner, SponsorshipRepresentative } from '../../types';

const Partners = () => {
  const [activeTab, setActiveTab] = useState<'partners' | 'representatives'>('partners');
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showRepModal, setShowRepModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingRep, setEditingRep] = useState<SponsorshipRepresentative | null>(null);

  const { partners = [], isLoading: partnersLoading, mutate: mutatePartners } = usePartners();
  const { representatives = [], isLoading: repsLoading, mutate: mutateReps } = useRepresentatives();

  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    sponsorship_amount: '',
    currency: 'ETB',
    status: 'potential' as 'potential' | 'active' | 'past',
    representative_id: '',
    commission_rate: '',
    notes: '',
  });

  const [repFormData, setRepFormData] = useState({
    name: '',
    email: '',
    phone: '',
    default_commission_rate: '',
    is_active: true,
    notes: '',
  });

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...partnerFormData,
        sponsorship_amount: parseFloat(partnerFormData.sponsorship_amount),
        commission_rate: partnerFormData.commission_rate ? parseFloat(partnerFormData.commission_rate) : undefined,
        representative_id: partnerFormData.representative_id || undefined,
      };

      if (editingPartner) {
        await adminApi.partners.update(editingPartner.id, data);
      } else {
        await adminApi.partners.create(data as any);
      }
      setShowPartnerModal(false);
      setEditingPartner(null);
      resetPartnerForm();
      mutatePartners();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to save partner'));
    }
  };

  const handleRepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...repFormData,
        default_commission_rate: parseFloat(repFormData.default_commission_rate),
      };

      if (editingRep) {
        await adminApi.representatives.update(editingRep.id, data);
      } else {
        await adminApi.representatives.create(data as any);
      }
      setShowRepModal(false);
      setEditingRep(null);
      resetRepForm();
      mutateReps();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to save representative'));
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setPartnerFormData({
      name: partner.name,
      contact_person: partner.contact_person,
      email: partner.email,
      phone: partner.phone || '',
      website: partner.website || '',
      sponsorship_amount: partner.sponsorship_amount.toString(),
      currency: partner.currency,
      status: partner.status,
      representative_id: partner.representative_id || '',
      commission_rate: partner.commission_rate?.toString() || '',
      notes: partner.notes || '',
    });
    setShowPartnerModal(true);
  };

  const handleEditRep = (rep: SponsorshipRepresentative) => {
    setEditingRep(rep);
    setRepFormData({
      name: rep.name,
      email: rep.email,
      phone: rep.phone || '',
      default_commission_rate: rep.default_commission_rate.toString(),
      is_active: rep.is_active,
      notes: rep.notes || '',
    });
    setShowRepModal(true);
  };

  const handleDeletePartner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    try {
      await adminApi.partners.delete(id);
      mutatePartners();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to delete partner'));
    }
  };

  const handleDeleteRep = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this representative? This may affect assigned partners.')) return;
    try {
      await adminApi.representatives.delete(id);
      mutateReps();
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to delete representative'));
    }
  };

  const resetPartnerForm = () => {
    setPartnerFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      website: '',
      sponsorship_amount: '',
      currency: 'ETB',
      status: 'potential',
      representative_id: '',
      commission_rate: '',
      notes: '',
    });
  };

  const resetRepForm = () => {
    setRepFormData({
      name: '',
      email: '',
      phone: '',
      default_commission_rate: '',
      is_active: true,
      notes: '',
    });
  };

  return (
    <AdminLayout title="Partners & Sponsorships">
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-100">
        <nav className="-mb-px flex space-x-12">
          <button
            onClick={() => setActiveTab('partners')}
            className={`${
              activeTab === 'partners'
                ? 'border-[#FF6F5E] text-[#1C2951] font-black'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            } whitespace-nowrap py-6 px-2 border-b-4 text-sm transition-all duration-300 transform active:scale-95`}
          >
            <div className="flex items-center gap-3">
              <FaHandshake size={18} /> Partners & Sponsors
            </div>
          </button>
          <button
            onClick={() => setActiveTab('representatives')}
            className={`${
              activeTab === 'representatives'
                ? 'border-[#FF6F5E] text-[#1C2951] font-black'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            } whitespace-nowrap py-6 px-2 border-b-4 text-sm transition-all duration-300 transform active:scale-95`}
          >
            <div className="flex items-center gap-3">
              <FaUsers size={18} /> Sponsorship Representatives
            </div>
          </button>
        </nav>
      </div>

      {/* Action Bar */}
      <div className="mb-10 flex justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
             {activeTab === 'partners' ? <FaHandshake size={20}/> : <FaUsers size={20}/>}
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Database</p>
            <p className="text-xl font-black text-[#1C2951]">
               {activeTab === 'partners' 
                ? `${partners.length} Total Partners` 
                : `${representatives.length} Active Agents`}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'partners') {
              resetPartnerForm();
              setEditingPartner(null);
              setShowPartnerModal(true);
            } else {
              resetRepForm();
              setEditingRep(null);
              setShowRepModal(true);
            }
          }}
          className="group flex items-center gap-3 px-8 py-4 bg-[#1C2951] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FF6F5E] hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-[#1C2951]/20 hover:shadow-[#FF6F5E]/30"
        >
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-[#FF6F5E] transition-colors">
            <FaPlus size={12} />
          </div>
          {activeTab === 'partners' ? 'Add New Partner' : 'Enlist Representative'}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-20 relative group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFD447] to-[#FF6F5E]" />
        
        {activeTab === 'partners' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Enterprise</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Point of Contact</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Commitment</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Agent</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {partnersLoading ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center">
                    <div className="w-12 h-12 border-4 border-[#FFD447] border-t-[#FF6F5E] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analyzing Partners...</p>
                  </td></tr>
                ) : partners.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center">
                    <FaHandshake size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Network Empty</p>
                  </td></tr>
                ) : (
                  partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50/50 transition-all duration-300">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 flex-shrink-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-emerald-200 transform rotate-3 hover:rotate-0 transition-transform">
                            <FaHandshake size={24} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-lg font-black text-[#1C2951] leading-tight mb-1">{partner.name}</div>
                            {partner.website ? (
                              <a href={partner.website} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-500 hover:text-[#FF6F5E] uppercase tracking-widest flex items-center gap-2 group/link transition-colors">
                                <FaGlobe size={10} /> Official Website
                                <div className="w-0 h-px bg-current group-hover/link:w-full transition-all duration-300" />
                              </a>
                            ) : (
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification Pending</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-[#1C2951] mb-1">{partner.contact_person}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {partner.email}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#1C2951] rounded-xl text-white shadow-lg shadow-indigo-900/10">
                          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                             <FaWallet size={12} className="text-[#FFD447]" />
                          </div>
                          <span className="text-sm font-black tracking-tight leading-none pt-0.5">
                            {new Intl.NumberFormat('en-ET', { style: 'currency', currency: partner.currency }).format(partner.sponsorship_amount)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        {partner.representative_name ? (
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-black text-xs transform -rotate-3 hover:rotate-0 transition-transform shadow-sm">
                               {partner.representative_name.charAt(0)}
                            </div>
                            <div>
                               <div className="text-xs font-black text-[#1C2951] leading-none mb-1.5">{partner.representative_name}</div>
                               <div className="inline-flex px-2 py-0.5 bg-orange-500 rounded-md text-[8px] font-black text-white uppercase tracking-widest shadow-sm shadow-orange-500/20">
                                  {partner.commission_rate}% Net
                               </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-300">
                             <div className="w-8 h-px bg-gray-100" />
                             <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Unassigned</span>
                             <div className="w-8 h-px bg-gray-100" />
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                          partner.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/5' : 
                          partner.status === 'potential' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-500/5' : 
                          'bg-gray-50 text-gray-400 border-gray-100 shadow-sm shadow-gray-500/5'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             partner.status === 'active' ? 'bg-emerald-500 animate-pulse' : 
                             partner.status === 'potential' ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          {partner.status}
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => handleEditPartner(partner)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-[#1C2951] hover:text-white transition-all duration-300 shadow-sm hover:shadow-indigo-500/20 active:scale-90"><FaEdit size={16} /></button>
                          <button onClick={() => handleDeletePartner(partner.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-500/20 active:scale-90"><FaTrash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Member</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Intel</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Payout</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Access</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {repsLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center">
                     <div className="w-12 h-12 border-4 border-[#FFD447] border-t-[#FF6F5E] rounded-full animate-spin mx-auto mb-4"></div>
                  </td></tr>
                ) : representatives.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                    <FaUsers size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Representatives</p>
                  </td></tr>
                ) : (
                  representatives.map((rep) => (
                    <tr key={rep.id} className="hover:bg-gray-50/50 transition-all duration-300">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 flex-shrink-0 bg-gradient-to-br from-[#1C2951] to-gray-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#1C2951]/20 font-black text-xl transform hover:scale-110 transition-transform border-4 border-white">
                            {rep.name.charAt(0)}
                          </div>
                          <div>
                             <div className="text-lg font-black text-[#1C2951] tracking-tight">{rep.name}</div>
                             <div className="text-[10px] font-black text-[#FF6F5E] uppercase tracking-widest mt-0.5">Sponsorship Agent</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-[#1C2951] mb-1">{rep.email}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" /> {rep.phone || 'NO PHONE LOADED'}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="inline-flex flex-col">
                           <span className="text-2xl font-black text-[#1C2951] tracking-tight mb-0.5">{rep.default_commission_rate}%</span>
                           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest pt-0.5 leading-none">Net Commission</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-300 ${
                          rep.is_active ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-50 text-red-400 border border-red-100 shadow-red-500/5'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${rep.is_active ? 'bg-white animate-pulse' : 'bg-red-300'}`} />
                          {rep.is_active ? 'ENABLED' : 'DISABLED'}
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                           <button onClick={() => handleEditRep(rep)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#1C2951] hover:text-white transition-all duration-300 active:scale-90"><FaEdit size={16} /></button>
                           <button onClick={() => handleDeleteRep(rep.id)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-90"><FaTrash size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[70] p-4 backdrop-blur-md transition-all duration-500">
          <div className="bg-white rounded-[40px] max-w-2xl w-full p-10 shadow-2xl overflow-y-auto max-h-[90vh] relative border-8 border-indigo-50 transform animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-10">
              <div>
                 <p className="text-[10px] font-black text-[#FF6F5E] uppercase tracking-[0.4em] mb-1">Vault Registry</p>
                 <h2 className="text-3xl font-black text-[#1C2951] tracking-tight">
                   {editingPartner ? 'Update Corporate Data' : 'Enlist New Power Partner'}
                 </h2>
              </div>
              <button 
                onClick={() => { setShowPartnerModal(false); setEditingPartner(null); }}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all duration-300 text-gray-400 active:scale-90 border border-gray-100"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Network Name *</label>
                  <input
                    type="text" required
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-black text-[#1C2951] placeholder-gray-300"
                    placeholder="Global Ent..."
                    value={partnerFormData.name}
                    onChange={(e) => setPartnerFormData({...partnerFormData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Deal Pipeline</label>
                  <select
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-black text-[#1C2951] appearance-none"
                    value={partnerFormData.status}
                    onChange={(e) => setPartnerFormData({...partnerFormData, status: e.target.value as any})}
                  >
                    <option value="potential">Potential Prospect</option>
                    <option value="active">Active Synergy</option>
                    <option value="past">Legacy Archive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Executive Contact *</label>
                  <input
                    type="text" required
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-black text-[#1C2951]"
                    placeholder="Full Name"
                    value={partnerFormData.contact_person}
                    onChange={(e) => setPartnerFormData({...partnerFormData, contact_person: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Direct Intelligence *</label>
                  <input
                    type="email" required
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-black text-[#1C2951]"
                    placeholder="partner@com..."
                    value={partnerFormData.email}
                    onChange={(e) => setPartnerFormData({...partnerFormData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Fund Allocation *</label>
                  <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 transition-colors group-focus-within/input:bg-indigo-500 group-focus-within/input:text-white">
                       <FaWallet size={12} />
                    </div>
                    <input
                      type="number" required step="0.01"
                      className="w-full bg-gray-50 border border-transparent rounded-[20px] pl-18 pr-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-black text-[#1C2951]"
                      value={partnerFormData.sponsorship_amount}
                      onChange={(e) => setPartnerFormData({...partnerFormData, sponsorship_amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Vault Currency</label>
                  <select
                    className="w-full bg-gray-50 border border-transparent rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-black text-[#1C2951] appearance-none"
                    value={partnerFormData.currency}
                    onChange={(e) => setPartnerFormData({...partnerFormData, currency: e.target.value})}
                  >
                    <option value="ETB">Birr (Locally Fuelled)</option>
                    <option value="USD">Global Dollars ($)</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[32px] p-8 space-y-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#FF6F5E]">
                       <FaUsers size={20} />
                   </div>
                   <h3 className="text-sm font-black text-[#1C2951] uppercase tracking-widest pt-1">Field Operation Assignment</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Lead Deploy Representative</label>
                    <select
                      className="w-full bg-white border border-gray-100 rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-[#1C2951] shadow-sm appearance-none"
                      value={partnerFormData.representative_id}
                      onChange={(e) => {
                        const repId = e.target.value;
                        const rep = representatives.find(r => r.id === repId);
                        setPartnerFormData({
                          ...partnerFormData, 
                          representative_id: repId,
                          commission_rate: rep ? rep.default_commission_rate.toString() : ''
                        });
                      }}
                    >
                      <option value="">AWAITING ASSIGNMENT</option>
                      {representatives.map(rep => (
                        <option key={rep.id} value={rep.id}>{rep.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Operation Bounty (%)</label>
                    <div className="relative group/input">
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-indigo-500 pt-0.5">%</span>
                      <input
                        type="number" step="0.1"
                        className="w-full bg-white border border-gray-100 rounded-[20px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-[#1C2951] shadow-sm"
                        value={partnerFormData.commission_rate}
                        onChange={(e) => setPartnerFormData({...partnerFormData, commission_rate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Strategic Intelligence Summary</label>
                <textarea
                  className="w-full bg-gray-50 border border-transparent rounded-[32px] px-8 py-6 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-black text-[#1C2951] min-h-[140px] resize-none"
                  placeholder="Intel notes, project context, specific requirements..."
                  value={partnerFormData.notes}
                  onChange={(e) => setPartnerFormData({...partnerFormData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-6 pt-6">
                <button type="submit" className="flex-1 bg-gradient-to-r from-[#1C2951] to-gray-900 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-[#1C2951]/30 hover:shadow-[#FF6F5E]/30 hover:from-[#FF6F5E] hover:to-[#FFD447] transform hover:scale-[1.02] active:scale-95 transition-all duration-500 uppercase tracking-widest text-sm">
                  {editingPartner ? 'Finalize Protocol' : 'Initiate Synergistic Link'}
                </button>
                <button type="button" onClick={() => { setShowPartnerModal(false); setEditingPartner(null); }} className="px-10 border-2 border-gray-100 text-gray-400 font-black rounded-[24px] hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 uppercase tracking-widest text-[10px]">
                  Abort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Representative Modal */}
      {showRepModal && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[70] p-4 backdrop-blur-md transition-all duration-500">
          <div className="bg-white rounded-[40px] max-w-md w-full p-10 shadow-2xl transform animate-in slide-in-from-bottom duration-500 border-b-8 border-[#FFD447]">
            <div className="flex items-center justify-between mb-10">
              <div>
                 <p className="text-[10px] font-black text-[#FF6F5E] uppercase tracking-[0.4em] mb-1">Human Capital</p>
                 <h2 className="text-3xl font-black text-[#1C2951] tracking-tight">
                    {editingRep ? 'Modifier Profile' : 'Enlist Operative'}
                 </h2>
              </div>
              <button 
                onClick={() => { setShowRepModal(false); setEditingRep(null); }}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleRepSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Full Identity *</label>
                <input
                  type="text" required
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black text-[#1C2951]"
                  value={repFormData.name}
                  onChange={(e) => setRepFormData({...repFormData, name: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Secure Channel (Email) *</label>
                <input
                  type="email" required
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black text-[#1C2951]"
                  value={repFormData.email}
                  onChange={(e) => setRepFormData({...repFormData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Base % *</label>
                  <input
                    type="number" required step="0.1"
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black text-[#1C2951] text-center"
                    value={repFormData.default_commission_rate}
                    onChange={(e) => setRepFormData({...repFormData, default_commission_rate: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-3 pt-10">
                  <input
                    type="checkbox"
                    id="rep_active"
                    checked={repFormData.is_active}
                    onChange={(e) => setRepFormData({...repFormData, is_active: e.target.checked})}
                    className="w-6 h-6 rounded-lg text-[#FF6F5E] focus:ring-[#FF6F5E] border-gray-200"
                  />
                  <label htmlFor="rep_active" className="text-[10px] font-black text-[#1C2951] uppercase tracking-widest cursor-pointer">Live Access</label>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#1C2951] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#1C2951]/20 hover:bg-[#FF6F5E] hover:shadow-[#FF6F5E]/30 transition-all duration-300 uppercase tracking-widest text-xs">
                  {editingRep ? 'Update Cipher' : 'Validate File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Partners;
