import { useEffect, useState } from 'react';
import { FaArrowRight, FaCheckCircle, FaClock, FaEye, FaGraduationCap, FaMapMarkerAlt, FaTimesCircle, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { handleSupabaseError } from '../../services/supabase';
import { MasterclassReservation } from '../../types';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';


const MasterclassDashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
        byRegion: {} as Record<string, number>,
        recent: [] as MasterclassReservation[]
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await adminApi.masterclassReservations.getAll();
            
            const regions: Record<string, number> = {};
            data.forEach(res => {
                regions[res.place] = (regions[res.place] || 0) + 1;
            });

            setStats({
                total: data.length,
                pending: data.filter(r => r.status === 'pending').length,
                reviewed: data.filter(r => r.status === 'reviewed').length,
                accepted: data.filter(r => r.status === 'accepted').length,
                rejected: data.filter(r => r.status === 'rejected').length,
                byRegion: regions,
                recent: data.slice(0, 5) // Assuming they are sorted by date in API
            });
        } catch (error: any) {
            const handled = handleSupabaseError(error, 'loadData');
            setError(handled.message);
        } finally {

            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Masterclass Intelligence">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Masterclass Management Stage">
            <div className="space-y-6 sm:space-y-10 selection:bg-indigo-100 selection:text-indigo-900">
                {error && (
                    <NetworkErrorBanner 
                        message={error} 
                        onRetry={() => {
                            setError(null);
                            loadData();
                        }} 
                    />
                )}

                {/* Hero Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard 
                        icon={FaUsers} 
                        label="Total Registered" 
                        value={stats.total} 
                        color="from-indigo-500 to-purple-600" 
                    />
                    <StatCard 
                        icon={FaClock} 
                        label="Pending Review" 
                        value={stats.pending} 
                        color="from-amber-400 to-orange-500" 
                    />
                    <StatCard 
                        icon={FaCheckCircle} 
                        label="Accepted" 
                        value={stats.accepted} 
                        color="from-emerald-400 to-teal-500" 
                    />
                    <StatCard 
                        icon={FaTimesCircle} 
                        label="Rejected" 
                        value={stats.rejected} 
                        color="from-rose-400 to-red-500" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Regional Breakdown */}
                    <div className="lg:col-span-1 bg-white rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-50 p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Geographic Hubs</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regional Reach</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <FaMapMarkerAlt />
                            </div>
                        </div>
                        <div className="space-y-5 sm:space-y-6">
                            {Object.entries(stats.byRegion).sort((a, b) => b[1] - a[1]).map(([region, count]) => (
                                <div key={region} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs sm:text-sm font-bold text-slate-700">{region}</span>
                                        <span className="text-[10px] sm:text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{count}</span>
                                    </div>
                                    <div className="h-1.5 sm:h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${(count / stats.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Registrations Stage */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black tracking-tight">Management Stage</h3>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] mt-1">Incoming Stream</p>
                            </div>
                            <Link 
                                to="/admin/masterclass-reservations" 
                                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 w-full sm:w-auto text-center"
                            >
                                Enter Management Hub <FaArrowRight />
                            </Link>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {stats.recent.map((res) => (
                                <div key={res.id} className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex items-center justify-between hover:bg-white/10 transition-all gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-black flex-shrink-0 text-sm sm:text-base">
                                            {res.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-sm sm:text-base truncate">{res.name}</p>
                                            <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest truncate">
                                                {res.place} • {res.sex}
                                                <span className="sm:hidden ml-2 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[8px] font-black uppercase tracking-wider inline-block">
                                                    {res.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{res.status}</p>
                                            <p className="text-[9px] text-white/20">{new Date(res.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <Link 
                                            to="/admin/masterclass-reservations" 
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                        >
                                            <FaEye size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <Link
                    to="/admin/masterclass-reservations"
                    className="block group relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-r from-indigo-600 to-purple-700 p-0.5 sm:p-1 bg-white shadow-2xl shadow-indigo-500/30"
                >
                    <div className="bg-slate-900 rounded-[1.95rem] sm:rounded-[2.9rem] p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                        <div className="relative z-10 text-center md:text-left">
                            <div className="inline-block px-3 py-1.5 bg-indigo-500/20 rounded-full text-indigo-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-4 sm:mb-6 border border-indigo-500/20">Action Required</div>
                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-3 sm:mb-4">
                                Review & Select <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 italic">Your Elite Cohort.</span>
                            </h2>
                            <p className="text-white/40 text-xs sm:text-sm font-medium max-w-xl">
                                Access the full reservation control panel to update candidate statuses, filter by region, and finalize the program enrollment list.
                            </p>
                        </div>
                        <div className="relative z-10 flex-shrink-0">
                            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl sm:rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-2xl shadow-indigo-500/50 group-hover:scale-110 transition-transform duration-500 rotate-12 group-hover:rotate-0">
                                <FaGraduationCap className="w-10 h-10 sm:w-16 sm:h-16 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </AdminLayout>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 border border-slate-50 shadow-xl shadow-slate-100/50 group hover:-translate-y-1 transition-all">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl sm:text-4xl font-black text-slate-900">{value}</p>
    </div>
);

export default MasterclassDashboard;
