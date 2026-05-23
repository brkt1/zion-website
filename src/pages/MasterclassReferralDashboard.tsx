import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaGraduationCap, FaLink, FaCopy, FaCheckCircle,
  FaUsers, FaClock, FaChartBar, FaSpinner,
  FaExclamationTriangle, FaShareAlt,
} from 'react-icons/fa';
import { adminApi } from '../services/adminApi';

// ── Status display helpers ────────────────────────────────────────────────────

type ReservationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; dot: string; bg: string }> = {
  pending: {
    label: 'Awaiting Review',
    color: 'text-amber-400',
    dot: 'bg-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
  },
  reviewed: {
    label: 'Under Consideration',
    color: 'text-blue-400',
    dot: 'bg-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
  accepted: {
    label: 'Enrolled ✓',
    color: 'text-emerald-400',
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  rejected: {
    label: 'Not Selected',
    color: 'text-red-400',
    dot: 'bg-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as ReservationStatus] ?? STATUS_CONFIG.pending;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

type Student = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  referral_code: string;
};

export default function MasterclassReferralDashboard() {
  const { refCode } = useParams<{ refCode: string }>();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/masterclass-registration?ref=${refCode}`;

  useEffect(() => {
    if (!refCode) return;
    (async () => {
      try {
        setLoading(true);
        const data = await adminApi.masterclassReservations.getByReferralCode(refCode);
        setStudents(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load referral data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [refCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total = students.length;
  const enrolled = students.filter(s => s.status === 'accepted').length;
  const inReview = students.filter(s => s.status === 'reviewed').length;
  const awaiting = students.filter(s => s.status === 'pending').length;

  // ── Shared styles ──────────────────────────────────────────────────────────
  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
    .font-serif  { font-family: 'Playfair Display', serif; }
    .font-outfit { font-family: 'Outfit', sans-serif; }

    .glass {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .glass-gold {
      background: rgba(255, 212, 71, 0.06);
      border: 1px solid rgba(255, 212, 71, 0.2);
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.5s ease both; }
    .fade-up-1 { animation-delay: 0.1s; }
    .fade-up-2 { animation-delay: 0.2s; }
    .fade-up-3 { animation-delay: 0.3s; }
    .fade-up-4 { animation-delay: 0.4s; }
  `;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] text-white font-outfit selection:bg-amber-400 selection:text-black overflow-x-hidden">
      <style>{sharedStyles}</style>

      {/* Background glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80 px-6 py-4 flex items-center justify-between">
        <Link to="/masterclass" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
            <FaGraduationCap />
          </div>
          <span className="font-black tracking-widest text-[11px] uppercase text-white/60 group-hover:text-white transition-colors">
            Yenege Academy
          </span>
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          Referral Dashboard
        </span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">

        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <div className="fade-up text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold text-amber-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <FaChartBar className="text-xs" />
            Partner Referral Dashboard
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight">
            Your Impact,{' '}
            <span className="italic text-amber-400">Measured.</span>
          </h1>
          <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light">
            Every student who registers through your link is tracked here in real time.
            Share your link and watch your community grow.
          </p>
          <div className="inline-block px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/40 tracking-widest uppercase">
            Code: <span className="text-amber-400 font-black">{refCode}</span>
          </div>
        </div>

        {/* ── Referral link card ───────────────────────────────────────────── */}
        <div className="fade-up fade-up-1 glass rounded-2xl sm:rounded-3xl p-5 sm:p-7">
          <div className="flex items-start gap-3 mb-4">
            <FaLink className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Your Unique Marketing Link</p>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                Share this link on TikTok, Instagram, or any platform. Every student who clicks it and registers will appear on this page.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white/60 font-mono truncate select-all">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-white border border-emerald-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-black border border-amber-300 hover:scale-105 active:scale-95'
              }`}
            >
              {copied ? <FaCheckCircle /> : <FaCopy />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Share hint */}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent('🎓 Register for the Yenege Academy Masterclass — Become a Licensed Event Pro!\n\n' + referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl text-[#25D366] text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 transition-colors"
            >
              <FaShareAlt /> WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🎓 Register for the Yenege Academy Masterclass — Become a Licensed Event Pro!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#2AABEE]/10 border border-[#2AABEE]/30 rounded-xl text-[#2AABEE] text-[10px] font-black uppercase tracking-widest hover:bg-[#2AABEE]/20 transition-colors"
            >
              <FaShareAlt /> Telegram
            </a>
          </div>
        </div>

        {/* ── Stats grid ───────────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="fade-up fade-up-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Registered', value: total, icon: FaUsers, color: 'text-amber-400', glow: 'bg-amber-500/10 border-amber-500/20' },
              { label: 'Awaiting Review', value: awaiting, icon: FaClock, color: 'text-amber-300', glow: 'bg-amber-500/5 border-amber-500/10' },
              { label: 'Under Consideration', value: inReview, icon: FaChartBar, color: 'text-blue-400', glow: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'Enrolled', value: enrolled, icon: FaCheckCircle, color: 'text-emerald-400', glow: 'bg-emerald-500/10 border-emerald-500/20' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`glass rounded-2xl p-5 sm:p-6 flex flex-col gap-3 border ${stat.glow}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.glow} ${stat.color}`}>
                    <Icon />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/30 mt-0.5">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Students table ───────────────────────────────────────────────── */}
        <div className="fade-up fade-up-3 glass rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black tracking-tight">Registered Students</h2>
              <p className="text-[11px] text-white/30 font-light mt-0.5">
                Students who signed up using your referral link
              </p>
            </div>
            {!loading && !error && total > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                {total} Total
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/30">
              <FaSpinner className="text-3xl animate-spin text-amber-500" />
              <p className="text-sm font-light">Loading registrations...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/40 text-center px-6">
              <FaExclamationTriangle className="text-3xl text-red-400" />
              <div>
                <p className="text-sm font-bold text-red-400 mb-1">Could not load data</p>
                <p className="text-xs font-light">{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && students.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-5 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl text-amber-400">
                <FaGraduationCap />
              </div>
              <div>
                <p className="text-base font-black text-white mb-1">No registrations yet</p>
                <p className="text-sm text-white/30 font-light max-w-xs">
                  Share your link and your first student will appear here instantly once they register.
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              >
                <FaCopy /> Copy Your Link
              </button>
            </div>
          )}

          {/* Students list */}
          {!loading && !error && students.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.25em] text-white/20">#</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Student Name</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Application Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Date Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, i) => {
                      const cfg = getStatusConfig(student.status);
                      return (
                        <tr
                          key={student.id}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="text-white/20 font-black text-sm font-serif italic">{String(i + 1).padStart(2, '0')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm flex-shrink-0">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-sm text-white">
                                {/* Partially mask name for privacy: show first name + first char of last */}
                                {student.name.split(' ').map((part, pi) =>
                                  pi === 0 ? part : part.charAt(0) + '.'
                                ).join(' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white/40 text-xs font-medium">{formatDate(student.created_at)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden divide-y divide-white/5">
                {students.map((student, i) => {
                  const cfg = getStatusConfig(student.status);
                  return (
                    <div key={student.id} className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black flex-shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">
                          {student.name.split(' ').map((part, pi) =>
                            pi === 0 ? part : part.charAt(0) + '.'
                          ).join(' ')}
                        </p>
                        <p className="text-white/30 text-[10px] font-medium mt-0.5">{formatDate(student.created_at)}</p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                        <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Footer info ──────────────────────────────────────────────────── */}
        <div className="fade-up fade-up-4 text-center space-y-3 pb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/15">
            Yenege Academy · Masterclass Referral Program
          </p>
          <p className="text-xs text-white/20 font-light max-w-sm mx-auto">
            Student names are partially masked to protect privacy. Statuses update in real time as our team reviews each application.
          </p>
          <Link
            to="/masterclass"
            className="inline-block mt-4 text-amber-500 hover:text-amber-400 text-xs font-black uppercase tracking-widest transition-colors"
          >
            ← View Masterclass Page
          </Link>
        </div>

      </div>
    </div>
  );
}
