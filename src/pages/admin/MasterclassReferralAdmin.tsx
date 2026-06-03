import { useEffect, useState } from 'react';
import {
  FaLink, FaUsers, FaChevronDown, FaChevronUp,
  FaSpinner, FaSearch, FaCheck, FaEye, FaTrash,
  FaExternalLinkAlt, FaCopy, FaPhoneAlt,
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { handleSupabaseError } from '../../services/supabase';
import { MasterclassReservation } from '../../types';
import { NetworkErrorBanner } from '../../Components/ui/NetworkStatus';

const REFERRAL_PRICE = 10000;

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-800 border-amber-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return iso; }
}

type GroupedReferral = {
  code: string;
  students: MasterclassReservation[];
  total: number;
  enrolled: number;
  inReview: number;
  pending: number;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MasterclassReferralAdmin() {
  const [reservations, setReservations] = useState<MasterclassReservation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [updatingIds, setUpdatingIds]   = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode]     = useState<string | null>(null);

  // Detail modal
  const [selectedStudent, setSelectedStudent] = useState<MasterclassReservation | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.masterclassReservations.getAll();
      // Only students that came via a referral link
      setReservations((data || []).filter(r => !!r.referral_code));
    } catch (err: any) {
      const handled = handleSupabaseError(err, 'loadReferralReservations');
      setError(handled.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'reviewed' | 'accepted' | 'rejected') => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      // Referral students accepted → auto-mark as fully paid at the fixed price
      const extras = status === 'accepted' ? {
        payment_status: 'full' as const,
        total_amount: REFERRAL_PRICE,
        paid_amount: REFERRAL_PRICE,
        remaining_amount: 0,
      } : undefined;
      const updated = await adminApi.masterclassReservations.updateStatus(id, status, extras);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      if (selectedStudent?.id === id) setSelectedStudent(updated);
    } catch (err: any) {
      alert('Failed to update status.');
    } finally {
      setUpdatingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      await adminApi.masterclassReservations.delete(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
    } catch { alert('Failed to delete.'); }
  };

  const copyLink = (code: string, type: 'reg' | 'dash') => {
    const url = type === 'reg'
      ? `${window.location.origin}/masterclass-registration?ref=${encodeURIComponent(code)}`
      : `${window.location.origin}/masterclass/ref/${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(`${type}_${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleGroup = (code: string) =>
    setExpandedGroups(prev => {
      const n = new Set(prev);
      n.has(code) ? n.delete(code) : n.add(code);
      return n;
    });

  // ── Group by referral_code ────────────────────────────────────────────────
  const groups: GroupedReferral[] = Object.values(
    reservations
      .filter(r =>
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        r.referral_code!.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .reduce<Record<string, GroupedReferral>>((acc, r) => {
        const code = r.referral_code!;
        if (!acc[code]) acc[code] = { code, students: [], total: 0, enrolled: 0, inReview: 0, pending: 0 };
        acc[code].students.push(r);
        acc[code].total++;
        if (r.status === 'accepted') acc[code].enrolled++;
        else if (r.status === 'reviewed') acc[code].inReview++;
        else if (r.status === 'pending') acc[code].pending++;
        return acc;
      }, {})
  ).sort((a, b) => b.total - a.total);

  const totalReferralStudents = reservations.length;
  const totalCodes = groups.length;
  const totalEnrolled = reservations.filter(r => r.status === 'accepted').length;

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-violet-500" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 space-y-6">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Referral Students</h1>
            <p className="text-sm text-gray-500 mt-1">Students who registered via a marketing / influencer link</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border border-violet-100 rounded-2xl text-sm font-black text-violet-700">
              <FaLink className="text-violet-500" /> {totalCodes} Referral Codes
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl text-sm font-black text-amber-800">
              <FaUsers className="text-amber-500 animate-pulse" /> {totalReferralStudents} Total Students
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-2xl text-sm font-black text-green-800">
              <FaCheck className="text-green-500" /> {totalEnrolled} Enrolled
            </div>
          </div>
        </div>

        {error && <NetworkErrorBanner message={error} onRetry={loadData} />}

        {/* ── Search ─────────────────────────────────────────────────── */}
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or referral code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
          />
        </div>

        {/* ── Referral Code Groups ────────────────────────────────────── */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-500 text-2xl mx-auto">
              <FaLink />
            </div>
            <p className="text-lg font-black text-gray-700">No referral students yet</p>
            <p className="text-sm text-gray-400">
              Use the Referral Link Generator on the MC Reservations page to create links for marketers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(group => (
              <div key={group.code} className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">

                {/* Group Header */}
                <div className="px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Left: code + stats */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg shadow-violet-200 flex-shrink-0">
                      <FaLink />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-lg text-gray-900 tracking-tight">{group.code}</p>
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-widest border border-violet-200">
                          Referral Code
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">{group.total} students</span>
                        {group.enrolled > 0 && <span className="text-xs font-black text-green-600">✓ {group.enrolled} enrolled</span>}
                        {group.inReview > 0 && <span className="text-xs font-black text-blue-500">◎ {group.inReview} in review</span>}
                        {group.pending > 0 && <span className="text-xs font-black text-amber-500">● {group.pending} pending</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Copy registration link */}
                    <button
                      onClick={() => copyLink(group.code, 'reg')}
                      title="Copy registration link for this code"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        copiedCode === `reg_${group.code}`
                          ? 'bg-green-100 border-green-200 text-green-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700'
                      }`}
                    >
                      <FaCopy size={9} />
                      {copiedCode === `reg_${group.code}` ? 'Copied!' : 'Reg Link'}
                    </button>

                    {/* Open marketer dashboard */}
                    <a
                      href={`/masterclass/ref/${encodeURIComponent(group.code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open marketer dashboard"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <FaExternalLinkAlt size={9} /> Dashboard
                    </a>

                    {/* Expand / Collapse */}
                    <button
                      onClick={() => toggleGroup(group.code)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      {expandedGroups.has(group.code)
                        ? <><FaChevronUp size={9} /> Collapse</>
                        : <><FaChevronDown size={9} /> View Students</>}
                    </button>
                  </div>
                </div>

                {/* Expanded student list */}
                {expandedGroups.has(group.code) && (
                  <div className="border-t border-slate-100">

                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Age / Sex</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Region</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Registered</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {group.students.map(student => (
                            <tr key={student.id} className="hover:bg-violet-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow flex-shrink-0">
                                    {student.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">{student.name}</p>
                                    <p className="text-xs text-gray-400">{student.phone}</p>
                                    {student.email && <p className="text-[10px] text-indigo-500">{student.email}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                <span className="font-bold">{student.age}</span>
                                <span className="text-gray-400 text-xs ml-1">yrs</span>
                                <div className="text-[10px] font-black text-gray-400 uppercase">{student.sex}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{student.place}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${STATUS_COLORS[student.status] || STATUS_COLORS.pending}`}>
                                  {student.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-400 font-medium">{formatDate(student.createdAt)}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setSelectedStudent(student)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="View details"><FaEye size={13} /></button>
                                  <a href={`tel:${student.phone}`} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Call"><FaPhoneAlt size={12} /></a>
                                  {student.status !== 'accepted' && (
                                    <button
                                      onClick={() => handleStatusUpdate(student.id, 'accepted')}
                                      disabled={updatingIds.has(student.id)}
                                      className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                                      title="Accept"
                                    >
                                      {updatingIds.has(student.id) ? <FaSpinner size={12} className="animate-spin" /> : <FaCheck size={12} />}
                                    </button>
                                  )}
                                  <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete"><FaTrash size={12} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-slate-50">
                      {group.students.map(student => (
                        <div key={student.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black flex-shrink-0">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
                                <p className="text-xs text-gray-400">{student.phone} · {student.place}</p>
                              </div>
                            </div>
                            <span className={`flex-shrink-0 px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${STATUS_COLORS[student.status] || STATUS_COLORS.pending}`}>
                              {student.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-[10px] font-black border border-green-100">
                              <FaPhoneAlt size={9} /> Call
                            </a>
                            <button onClick={() => setSelectedStudent(student)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-100">
                              <FaEye size={9} /> Details
                            </button>
                            {student.status !== 'accepted' && (
                              <button
                                onClick={() => handleStatusUpdate(student.id, 'accepted')}
                                disabled={updatingIds.has(student.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-[10px] font-black border border-green-100 disabled:opacity-40"
                              >
                                <FaCheck size={9} /> Enroll
                              </button>
                            )}
                            <button onClick={() => handleDelete(student.id)} className="p-2 rounded-xl bg-red-50 text-red-500 border border-red-100">
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Detail Modal ─────────────────────────────────────────────── */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Via:</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-100 border border-violet-200 text-[10px] font-black text-violet-700">{selectedStudent.referral_code}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
              </div>

              <div className="p-6 space-y-4">
                {/* Profile */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Profile</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-[9px] text-gray-400 font-black uppercase">Phone</p><p className="font-bold text-gray-900">{selectedStudent.phone}</p></div>
                    {selectedStudent.email && <div><p className="text-[9px] text-gray-400 font-black uppercase">Email</p><p className="font-bold text-indigo-600 text-xs">{selectedStudent.email}</p></div>}
                    <div><p className="text-[9px] text-gray-400 font-black uppercase">Age / Sex</p><p className="font-bold text-gray-900">{selectedStudent.age} yrs · {selectedStudent.sex}</p></div>
                    <div><p className="text-[9px] text-gray-400 font-black uppercase">Region</p><p className="font-bold text-gray-900">{selectedStudent.place}</p></div>
                    <div><p className="text-[9px] text-gray-400 font-black uppercase">Registered</p><p className="font-bold text-gray-900">{formatDate(selectedStudent.createdAt)}</p></div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Status</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${STATUS_COLORS[selectedStudent.status] || STATUS_COLORS.pending}`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                  {selectedStudent.status_updated_by && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-[9px] text-gray-400 font-black uppercase">Last Updated By</p>
                      <p className="font-bold text-gray-900 text-xs">{selectedStudent.status_updated_by}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(['reviewed', 'accepted', 'rejected'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusUpdate(selectedStudent.id, s)}
                        disabled={updatingIds.has(selectedStudent.id) || selectedStudent.status === s}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 ${
                          selectedStudent.status === s
                            ? STATUS_COLORS[s] + ' border'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {updatingIds.has(selectedStudent.id) ? <FaSpinner className="animate-spin inline" /> : s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${selectedStudent.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest transition-all">
                    <FaPhoneAlt /> Call Student
                  </a>
                  <button onClick={() => handleDelete(selectedStudent.id)} className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-colors">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
