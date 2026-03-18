import { FaChartLine, FaCheckCircle, FaGlobe, FaHandshake, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import RepresentativeLayout from '../../Components/admin/RepresentativeLayout';
import SellerHeader from '../../Components/admin/SellerHeader';
import { useRepresentativeData } from '../../hooks/useRepresentativeData';

const RepresentativeDashboard = () => {
  const { rep, user, partners, stats, loading, isAuthorized } = useRepresentativeData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <RepresentativeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your protocol...</p>
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
    <RepresentativeLayout>
      <SellerHeader 
        seller={{ name: rep.name, is_active: rep.is_active } as any} 
        user={user} 
        title="Sponsorship Protocol" 
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
                    <h2 className="text-2xl font-black text-[#1C2951] tracking-tight">Your Portfolio</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Managed Partner Network</p>
                 </div>
              </div>
              <div className="hidden sm:block">
                 <div className="px-6 py-2 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black text-[#1C2951] uppercase tracking-widest">
                    Authorized Protocols Only
                 </div>
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
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {partners.length === 0 ? (
                       <tr><td colSpan={5} className="px-10 py-24 text-center">
                          <FaChartLine className="mx-auto mb-4 text-gray-100" size={64} />
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Discovery Phase: No Partners Enlisted</p>
                       </td></tr>
                    ) : (
                       partners.map((partner) => (
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
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4">Protocol Briefing</p>
                 <h2 className="text-4xl font-black tracking-tight leading-tight mb-8">
                    Elevating the <span className="text-[#FFD447]">Sponsorship</span> Ecosystem
                 </h2>
                 <p className="text-white/60 text-sm leading-relaxed mb-8">
                    Your portal provides a secure window into your managed portfolio. Ensure all partner communications are finalized through the executive board. Sponsorship values are indexed against live performance metrics.
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
  );
};

export default RepresentativeDashboard;
