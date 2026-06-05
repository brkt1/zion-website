import { useEffect, useState } from 'react';
import { FaArrowRight, FaCheckCircle, FaClock, FaGraduationCap, FaLink, FaMoneyBillWave, FaTimesCircle, FaUsers, FaExclamationTriangle, FaLock, FaGlobe, FaChartPie, FaLightbulb } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { handleSupabaseError } from '../../services/supabase';
import { isAdmin } from '../../services/auth';
import { MasterclassReservation } from '../../types';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';

const REFERRAL_PRICE = 10000;

const getPackagePrice = (pkgName?: string): number => {
  if (!pkgName) return 0;
  if (pkgName.includes('5,000') || pkgName.includes('5000')) return 5000;
  if (pkgName.includes('10,000') || pkgName.includes('10000')) return 10000;
  if (pkgName.includes('25,000') || pkgName.includes('25000')) return 25000;
  return 0;
};

const fmt = (n: number) => `ETB ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

interface Stats {
  total: number; accepted: number; pending: number; rejected: number; reviewed: number;
  directTotal: number; directAccepted: number;
  referralTotal: number; referralAccepted: number;
  referralPossible: number; referralCollected: number; referralOwed: number;
  directPossible: number; directCollected: number; directOwed: number;
  totalPossible: number; totalCollected: number; totalOwed: number;
  fullPaid: number; partialPaid: number; unpaid: number;
  partialStudents: Array<{ name: string; phone: string; isReferral: boolean; total: number; paid: number; owed: number; pkg?: string }>;
  packages: Record<string, { count: number; possible: number; collected: number }>;
  avgAge: number;
  ageGroups: {
    under18: number;
    youngAdults: number;
    adults: number;
    senior: number;
  };
  topLocations: Array<{ name: string; count: number; revenue: number }>;
  avgPaymentGapDays: number;
  weeklyTrend: Record<string, number>;
  insights: string[];
}

export default function MasterclassDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    isAdmin().then(ok => {
      setAuthorized(ok);
      if (!ok) return; // don't load data for non-admins
      load();
    });
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data: MasterclassReservation[] = await adminApi.masterclassReservations.getAll();
      const direct = data.filter(r => !r.referral_code);
      const referral = data.filter(r => !!r.referral_code);
      const accDirect = direct.filter(r => r.status === 'accepted');
      const accReferral = referral.filter(r => r.status === 'accepted');

      // Process direct accepted students, deriving values if missing in DB
      const processedDirect = accDirect.map(r => {
        const pkgPrice = getPackagePrice(r.selected_package);
        const total = r.total_amount || pkgPrice || 0;
        let paid = 0;
        if (r.payment_status === 'full') {
          paid = total;
        } else if (r.payment_status === 'partial') {
          paid = r.paid_amount || (total / 2);
        } else if (r.payment_status === 'unpaid') {
          paid = 0;
        } else {
          paid = r.paid_amount || 0;
        }
        return {
          ...r,
          derivedTotal: total,
          derivedPaid: paid,
          derivedOwed: total - paid,
        };
      });

      // Process referral accepted students (auto-collected on accepted)
      const processedReferral = accReferral.map(r => {
        return {
          ...r,
          derivedTotal: REFERRAL_PRICE,
          derivedPaid: REFERRAL_PRICE,
          derivedOwed: 0,
        };
      });

      const accAll = [...processedDirect, ...processedReferral];

      const refPossible = processedReferral.reduce((s, r) => s + r.derivedTotal, 0);
      const refCollected = processedReferral.reduce((s, r) => s + r.derivedPaid, 0);
      const dirPossible = processedDirect.reduce((s, r) => s + r.derivedTotal, 0);
      const dirCollected = processedDirect.reduce((s, r) => s + r.derivedPaid, 0);

      const pkgs: Record<string, { count: number; possible: number; collected: number }> = {};
      processedDirect.forEach(r => {
        const k = r.selected_package || 'Unassigned';
        if (!pkgs[k]) pkgs[k] = { count: 0, possible: 0, collected: 0 };
        pkgs[k].count++;
        pkgs[k].possible += r.derivedTotal;
        pkgs[k].collected += r.derivedPaid;
      });

      const partialStudents = accAll
        .filter(r => r.payment_status === 'partial')
        .map(r => {
          return {
            name: r.name,
            phone: r.phone,
            isReferral: !!r.referral_code,
            total: r.derivedTotal,
            paid: r.derivedPaid,
            owed: r.derivedOwed,
            pkg: r.selected_package
          };
        });
      // 1. Age Demographics
      const ages = data.map(r => r.age).filter(a => typeof a === 'number' && a > 0);
      const avgAge = ages.length > 0 ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;
      
      const ageGroups = { under18: 0, youngAdults: 0, adults: 0, senior: 0 };
      data.forEach(r => {
        if (!r.age) return;
        if (r.age < 18) ageGroups.under18++;
        else if (r.age <= 25) ageGroups.youngAdults++;
        else if (r.age <= 35) ageGroups.adults++;
        else ageGroups.senior++;
      });

      // 2. Top Locations Breakdown
      const locMap: Record<string, { count: number; revenue: number }> = {};
      data.forEach(r => {
        let loc = (r.place || 'Unknown').trim();
        loc = loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase();
        if (!locMap[loc]) locMap[loc] = { count: 0, revenue: 0 };
        locMap[loc].count++;
      });
      accAll.forEach(r => {
        let loc = (r.place || 'Unknown').trim();
        loc = loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase();
        if (locMap[loc]) {
          locMap[loc].revenue += r.derivedPaid;
        }
      });
      const topLocations = Object.entries(locMap)
        .map(([name, s]) => ({ name, count: s.count, revenue: s.revenue }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 3. Payment Gap
      let totalGapMs = 0;
      let gapCount = 0;
      accAll.forEach(r => {
        if (r.createdAt) {
          const regDate = new Date(r.createdAt);
          const payDate = r.payment_completion_date ? new Date(r.payment_completion_date) : (r.updatedAt ? new Date(r.updatedAt) : null);
          if (payDate && payDate.getTime() >= regDate.getTime()) {
            totalGapMs += (payDate.getTime() - regDate.getTime());
            gapCount++;
          }
        }
      });
      const avgPaymentGapDays = gapCount > 0 ? parseFloat((totalGapMs / (1000 * 60 * 60 * 24) / gapCount).toFixed(1)) : 0;

      // 4. Day of the Week Trend
      const weeklyTrend: Record<string, number> = {
        'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0
      };
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      data.forEach(r => {
        if (r.createdAt) {
          const d = new Date(r.createdAt).getDay();
          weeklyTrend[daysOfWeek[d]]++;
        }
      });

      // 5. Automated Data-driven Business Insights
      const insights: string[] = [];
      
      let topPkg = '';
      let topPkgCount = 0;
      Object.entries(pkgs).forEach(([name, s]) => {
        if (s.count > topPkgCount) {
          topPkgCount = s.count;
          topPkg = name;
        }
      });
      if (topPkg) {
        insights.push(`The <b>${topPkg}</b> is the most popular choice, representing ${Math.round((topPkgCount / (accDirect.length || 1)) * 100)}% of direct accepted reservations.`);
      }

      const totalAges = ageGroups.under18 + ageGroups.youngAdults + ageGroups.adults + ageGroups.senior;
      if (totalAges > 0) {
        const youthPct = Math.round(((ageGroups.youngAdults + ageGroups.under18) / totalAges) * 100);
        if (youthPct > 50) {
          insights.push(`Younger demographics under 25 represent the majority (<b>${youthPct}%</b>) of the applicant pool, showing high interest from students & early professionals.`);
        } else {
          insights.push(`Mature professionals/adults (26+) represent the majority (<b>${100 - youthPct}%</b>) of candidates, indicating strong demand for professional upskilling.`);
        }
      }

      if (topLocations.length > 0) {
        const topLoc = topLocations[0];
        insights.push(`<b>${topLoc.name}</b> is the primary recruitment hub, contributing <b>${Math.round((topLoc.count / (data.length || 1)) * 100)}%</b> of all registrations.`);
      }

      if (avgPaymentGapDays > 0) {
        if (avgPaymentGapDays <= 2) {
          insights.push(`Payment collection is highly efficient, averaging <b>${avgPaymentGapDays} days</b> from registration to confirmed payment.`);
        } else {
          insights.push(`Registration-to-payment conversion takes an average of <b>${avgPaymentGapDays} days</b>, suggesting opportunity for follow-up reminders.`);
        }
      }

      const males = data.filter(r => r.sex === 'male').length;
      const females = data.filter(r => r.sex === 'female').length;
      if (males + females > 0) {
        const femalePct = Math.round((females / (males + females)) * 100);
        insights.push(`Female participation stands at <b>${femalePct}%</b>, which can be monitored for diversity and targeted marketing campaigns.`);
      }

      setStats({
        total: data.length,
        accepted: data.filter(r => r.status === 'accepted').length,
        pending: data.filter(r => r.status === 'pending').length,
        rejected: data.filter(r => r.status === 'rejected').length,
        reviewed: data.filter(r => r.status === 'reviewed').length,
        directTotal: direct.length, directAccepted: accDirect.length,
        referralTotal: referral.length, referralAccepted: accReferral.length,
        referralPossible: refPossible, referralCollected: refCollected, referralOwed: refPossible - refCollected,
        directPossible: dirPossible, directCollected: dirCollected, directOwed: dirPossible - dirCollected,
        totalPossible: refPossible + dirPossible, totalCollected: refCollected + dirCollected, totalOwed: (refPossible - refCollected) + (dirPossible - dirCollected),
        fullPaid: accAll.filter(r => r.derivedTotal > 0 && r.derivedPaid === r.derivedTotal).length,
        partialPaid: accAll.filter(r => r.derivedPaid > 0 && r.derivedPaid < r.derivedTotal).length,
        unpaid: accAll.filter(r => r.derivedPaid === 0 && r.derivedTotal > 0).length,
        partialStudents, packages: pkgs,
        avgAge,
        ageGroups,
        topLocations,
        avgPaymentGapDays,
        weeklyTrend,
        insights,
      });
    } catch (e: any) {
      setError(handleSupabaseError(e, 'load').message);
    } finally { setLoading(false); }
  };

  if (authorized === null || (authorized && loading)) return (
    <AdminLayout title="Masterclass Analytics">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  if (!authorized) return (
    <AdminLayout title="Access Restricted">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 text-2xl">
          <FaLock />
        </div>
        <h2 className="text-xl font-black text-slate-800">Super Admin Only</h2>
        <p className="text-sm text-slate-400 max-w-sm">The analytics dashboard is restricted to super administrators. Contact your admin for access.</p>
        <button onClick={() => navigate(-1)} className="mt-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-700 transition-all">
          Go Back
        </button>
      </div>
    </AdminLayout>
  );

  if (!stats) return null;

  const acceptRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  return (
    <AdminLayout title="Masterclass Analytics">
      <div className="space-y-8 pb-10">
        {error && <NetworkErrorBanner message={error} onRetry={() => { setError(null); load(); }} />}

        {/* ── Section 1: Registration Overview ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Registration Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FaUsers, label: 'Total Registered', value: stats.total, sub: '100% of registrations', color: 'from-indigo-500 to-purple-600', glow: 'shadow-indigo-100' },
              { icon: FaCheckCircle, label: 'Accepted', value: stats.accepted, sub: `${acceptRate}% acceptance rate`, color: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-100' },
              { icon: FaClock, label: 'Pending / Reviewed', value: stats.pending + stats.reviewed, sub: `${Math.round(((stats.pending + stats.reviewed) / (stats.total || 1)) * 100)}% of total`, color: 'from-amber-400 to-orange-500', glow: 'shadow-amber-100' },
              { icon: FaTimesCircle, label: 'Rejected', value: stats.rejected, sub: `${Math.round((stats.rejected / (stats.total || 1)) * 100)}% rejection rate`, color: 'from-rose-400 to-red-500', glow: 'shadow-rose-100' },
            ].map(({ icon: Icon, label, value, sub, color, glow }) => (
              <div key={label} className={`bg-white rounded-2xl p-6 border border-slate-50 shadow-xl ${glow}/50 hover:-translate-y-1 transition-all`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg mb-4`}>
                  <Icon size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Direct vs Referral ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Registration Source</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Direct */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><FaGraduationCap /></div>
                <div>
                  <p className="font-black text-slate-800">Direct Reservation</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">No referral code</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Registered</p>
                  <p className="text-2xl font-black text-slate-800">{stats.directTotal}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Accepted</p>
                  <p className="text-2xl font-black text-emerald-700">{stats.directAccepted}</p>
                </div>
              </div>
            </div>
            {/* Referral */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600"><FaLink /></div>
                <div>
                  <p className="font-black text-slate-800">Referral Students</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Fixed price: {fmt(REFERRAL_PRICE)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Registered</p>
                  <p className="text-2xl font-black text-slate-800">{stats.referralTotal}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Accepted</p>
                  <p className="text-2xl font-black text-emerald-700">{stats.referralAccepted}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Revenue by Package (Direct) ── */}
        {Object.keys(stats.packages).length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Price List — Direct Accepted Students</h2>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Package', 'Students', 'Total Price', 'Collected', 'Outstanding'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Object.entries(stats.packages).map(([pkg, d]) => (
                    <tr key={pkg} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black">{pkg}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-700">{d.count}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">{fmt(d.possible)}</td>
                      <td className="px-6 py-4 text-sm font-black text-emerald-600">{fmt(d.collected)}</td>
                      <td className="px-6 py-4 text-sm font-black text-rose-500">{fmt(d.possible - d.collected)}</td>
                    </tr>
                  ))}
                  {/* Referral row */}
                  <tr className="hover:bg-slate-50 transition-colors bg-violet-50/40">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-black">Referral (Fixed {fmt(REFERRAL_PRICE)}/student)</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-700">{stats.referralAccepted}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">{fmt(stats.referralPossible)}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">{fmt(stats.referralCollected)}</td>
                    <td className="px-6 py-4 text-sm font-black text-rose-500">{fmt(stats.referralOwed)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Section 4: Financial Summary ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Financial Summary — Accepted Students</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4"><FaMoneyBillWave className="text-white/80" /></div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Expected</p>
              <p className="text-2xl font-black text-white">{fmt(stats.totalPossible)}</p>
              <p className="text-[10px] text-white/30 mt-2">If all accepted students pay in full</p>
            </div>
            <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4"><FaCheckCircle className="text-white" /></div>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Total Collected</p>
              <p className="text-2xl font-black text-white">{fmt(stats.totalCollected)}</p>
              <p className="text-[10px] text-white/50 mt-2">{stats.fullPaid + stats.partialPaid} students have paid (full or partial)</p>
            </div>
            <div className="bg-rose-500 rounded-3xl p-6 text-white shadow-2xl shadow-rose-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4"><FaExclamationTriangle className="text-white" /></div>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Still To Collect</p>
              <p className="text-2xl font-black text-white">{fmt(stats.totalOwed)}</p>
              <p className="text-[10px] text-white/50 mt-2">{stats.unpaid} unpaid + {stats.partialPaid} half-paid students</p>
            </div>
          </div>
        </section>

        {/* ── Section 5: Payment Status Breakdown ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Payment Status — Accepted Students</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3"><FaCheckCircle /></div>
              <p className="text-2xl font-black text-emerald-700">{stats.fullPaid}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Fully Paid</p>
            </div>
            <div className="bg-white rounded-2xl border border-amber-100 shadow-xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3"><FaMoneyBillWave /></div>
              <p className="text-2xl font-black text-amber-700">{stats.partialPaid}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Half Paid</p>
            </div>
            <div className="bg-white rounded-2xl border border-rose-100 shadow-xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3"><FaTimesCircle /></div>
              <p className="text-2xl font-black text-rose-700">{stats.unpaid}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Unpaid</p>
            </div>
          </div>
        </section>

        {/* ── Section 6: Half-paid students detail ── */}
        {stats.partialStudents.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Students With Half Payment ({stats.partialStudents.length})</h2>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Student', 'Type', 'Package', 'Total', 'Paid', 'Still Owed'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.partialStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${s.isReferral ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {s.isReferral ? 'Referral' : 'Direct'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{s.pkg || (s.isReferral ? 'Referral (Fixed)' : '—')}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-700">{fmt(s.total)}</td>
                      <td className="px-6 py-4 text-sm font-black text-emerald-600">{fmt(s.paid)}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black rounded-xl">{fmt(s.owed)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Totals</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">{fmt(stats.partialStudents.reduce((s, r) => s + r.total, 0))}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">{fmt(stats.partialStudents.reduce((s, r) => s + r.paid, 0))}</td>
                    <td className="px-6 py-4 text-sm font-black text-rose-600">{fmt(stats.partialStudents.reduce((s, r) => s + r.owed, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}

        {/* ── Section 7: Lead Intelligence & Demographics Analysis ── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Lead Intelligence & Analytics</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Age Demographics */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FaChartPie />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Age Distribution</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Average Age: {stats.avgAge} Years</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Under 18', count: stats.ageGroups.under18, color: 'bg-indigo-500' },
                  { label: '18 - 25 (Young Adults)', count: stats.ageGroups.youngAdults, color: 'bg-emerald-500' },
                  { label: '26 - 35 (Adults)', count: stats.ageGroups.adults, color: 'bg-amber-500' },
                  { label: '36+ (Seniors)', count: stats.ageGroups.senior, color: 'bg-rose-500' },
                ].map(group => {
                  const total = stats.ageGroups.under18 + stats.ageGroups.youngAdults + stats.ageGroups.adults + stats.ageGroups.senior || 1;
                  const pct = Math.round((group.count / total) * 100);
                  return (
                    <div key={group.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{group.label}</span>
                        <span>{group.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${group.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Geographical Distribution */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <FaGlobe />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Geographical Distribution</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Top Recruitment Hubs</p>
                </div>
              </div>

              <div className="space-y-4">
                {stats.topLocations.map((loc, idx) => {
                  const total = stats.total || 1;
                  const pct = Math.round((loc.count / total) * 100);
                  return (
                    <div key={loc.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-300 w-4">#{idx + 1}</span>
                        <div>
                          <p className="text-xs font-black text-slate-800">{loc.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{loc.count} registration{loc.count > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-indigo-600">{fmt(loc.revenue)}</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{pct}% of pool</p>
                      </div>
                    </div>
                  );
                })}
                {stats.topLocations.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No location data registered.</p>
                )}
              </div>
            </div>

            {/* Executive Observations */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <FaLightbulb />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Executive Insights</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Performance Diagnostics</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {stats.insights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed shadow-sm">
                    <span className="text-amber-500 font-bold flex-shrink-0">💡</span>
                    <p dangerouslySetInnerHTML={{ __html: insight }} />
                  </div>
                ))}
                {stats.insights.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Sufficient metrics needed to generate insights.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/masterclass-reservations" className="group flex items-center justify-between bg-slate-900 hover:bg-slate-800 transition-all rounded-2xl p-5 text-white shadow-xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Direct Students</p>
              <p className="font-black text-lg">Manage Reservations</p>
            </div>
            <FaArrowRight className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <Link to="/admin/masterclass-referrals" className="group flex items-center justify-between bg-violet-700 hover:bg-violet-600 transition-all rounded-2xl p-5 text-white shadow-xl shadow-violet-200">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Referral Students</p>
              <p className="font-black text-lg">Manage Referrals</p>
            </div>
            <FaArrowRight className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

      </div>
    </AdminLayout>
  );
}
