import { useEffect, useMemo, useState } from 'react';
import {
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaCompass,
  FaDownload,
  FaMapMarkerAlt,
  FaPhone,
  FaSpinner,
  FaTrash,
  FaTv,
  FaTimes,
  FaUsers,
} from 'react-icons/fa';
import AdminLayout from '../../Components/admin/AdminLayout';
import { supabase, handleSupabaseError } from '../../services/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type BroadcastPackage = 'abbay' | 'nahoo';
type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

interface TreasureHuntRegistration {
  id: string;
  company_name: string;
  participant_1: string;
  participant_2: string;
  phone: string;
  broadcast_package: BroadcastPackage;
  status: RegistrationStatus;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const packageLabel = (pkg: BroadcastPackage) =>
  pkg === 'abbay' ? 'Abbay TV' : 'Nahoo TV';

const packageAmount = (pkg: BroadcastPackage) =>
  pkg === 'abbay' ? 25000 : 20000;

const STATUS_META: Record<RegistrationStatus, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: 'Confirmed',  color: '#0F7B4D', bg: '#E6F5EF', border: '#A3D9BF' },
  pending:   { label: 'Pending',    color: '#B8860B', bg: '#FEF9EC', border: '#F5D87F' },
  cancelled: { label: 'Cancelled',  color: '#A32020', bg: '#FBE9E9', border: '#F5B0B0' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TreasureHuntRegistrations() {
  const [registrations, setRegistrations] = useState<TreasureHuntRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Load registrations from Supabase ──
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('treasure_hunt_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setRegistrations(data ?? []);
    } catch (err) {
      setError(handleSupabaseError(err, 'load registrations').message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Update status ──
  const updateStatus = async (id: string, status: RegistrationStatus) => {
    setUpdatingId(id);
    try {
      const { error: err } = await supabase
        .from('treasure_hunt_registrations')
        .update({ status })
        .eq('id', id);

      if (err) throw err;
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert('Failed to update status: ' + handleSupabaseError(err, 'update status').message);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete registration ──
  const deleteRegistration = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('treasure_hunt_registrations')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setRegistrations(prev => prev.filter(r => r.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert('Failed to delete: ' + handleSupabaseError(err, 'delete registration').message);
    }
  };

  // ── CSV Export ──
  const exportCsv = () => {
    const headers = ['Company', 'Executive 1', 'Executive 2', 'Phone', 'Package', 'Amount (ETB)', 'Status', 'Registered'];
    const rows = registrations.map(r => [
      r.company_name, r.participant_1, r.participant_2, r.phone,
      packageLabel(r.broadcast_package), packageAmount(r.broadcast_package),
      r.status, new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.map(String).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'treasure_hunt_registrations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Summary Stats ──
  const stats = useMemo(() => {
    const confirmed  = registrations.filter(r => r.status === 'confirmed').length;
    const pending    = registrations.filter(r => r.status === 'pending').length;
    const revenue    = registrations
      .filter(r => r.status !== 'cancelled')
      .reduce((sum, r) => sum + packageAmount(r.broadcast_package), 0);
    return { total: registrations.length, confirmed, pending, revenue };
  }, [registrations]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <style>{`
        @keyframes riseIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .rise { animation: riseIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .shimmer { background: linear-gradient(90deg, #ECE9E1 0px, #F5F3ED 60px, #ECE9E1 120px); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }
        .row-hover { transition: background 0.15s ease; }
        .row-hover:hover { background: #FAFAF7 !important; }
        .th-select:focus { outline: 2px solid #B8860B; outline-offset: 2px; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Page Header ── */}
        <div className="rise" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#B8860B', marginBottom: '8px' }}>
                <FaCompass size={12} /> Treasure Hunt Ethiopia · Registration Ledger
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1C1B18', margin: 0 }}>
                Corporate Registrations
              </h1>
              <p style={{ fontSize: '13px', color: '#8A8578', marginTop: '6px' }}>
                All teams entered for the championship — <span style={{ fontFamily: 'monospace' }}>30 Aug 2026</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={load}
                style={{ background: 'transparent', border: '1px solid #E9E5DA', color: '#5B5647', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                Refresh
              </button>
              <button
                onClick={exportCsv}
                disabled={registrations.length === 0}
                style={{ background: '#1C1B18', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', opacity: registrations.length === 0 ? 0.5 : 1 }}
              >
                <FaDownload size={12} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{ background: '#FBE9E9', border: '1px solid #F5B0B0', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', color: '#A32020', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A32020' }}><FaTimes /></button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Teams Entered',    value: stats.total,     icon: <FaUsers size={14} />,      accent: '#1C1B18' },
            { label: 'Confirmed',         value: stats.confirmed,  icon: <FaCheckCircle size={14} />, accent: '#0F7B4D' },
            { label: 'Awaiting Review',   value: stats.pending,    icon: <FaClock size={14} />,       accent: '#B8860B' },
            { label: 'Revenue Secured',   value: `ETB ${stats.revenue.toLocaleString()}`, icon: <FaTv size={14} />, accent: '#A32020' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="rise"
              style={{ background: 'white', border: '1px solid #E9E5DA', borderTop: `3px solid ${s.accent}`, borderRadius: '12px', padding: '16px', animationDelay: `${i * 60}ms` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9C9788' }}>{s.label}</span>
                <span style={{ color: s.accent }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1C1B18', fontFamily: 'monospace' }}>
                {loading ? <span className="shimmer" style={{ display: 'inline-block', height: '22px', width: '50px', borderRadius: '4px' }} /> : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Registrations Table ── */}
        <div className="rise" style={{ background: 'white', border: '1px solid #E9E5DA', borderRadius: '16px', overflow: 'hidden', animationDelay: '180ms' }}>
          <table style={{ width: '100%', fontSize: '13.5px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAF9F5', borderBottom: '1px solid #E9E5DA' }}>
                {['Company', 'Executives', 'Contact', 'Package', 'Status', 'Registered', ''].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9C9788' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1EFE8' }}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} style={{ padding: '16px 20px' }}>
                        <div className="shimmer" style={{ height: '13px', borderRadius: '4px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: '#9C9788' }}>
                    <FaMapMarkerAlt size={22} style={{ marginBottom: '10px', color: '#D8D3C4', display: 'block', margin: '0 auto 10px' }} />
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>No expeditions logged yet</p>
                    <p style={{ fontSize: '12px', color: '#B5B1A3' }}>Teams will appear here the moment they submit the proposal form.</p>
                  </td>
                </tr>
              ) : (
                registrations.map(r => {
                  const meta = STATUS_META[r.status];
                  return (
                    <tr key={r.id} className="row-hover" style={{ borderBottom: '1px solid #F1EFE8' }}>

                      {/* Company */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FAF3E4', color: '#B8860B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FaBuilding size={13} />
                          </div>
                          <span style={{ fontWeight: 600, color: '#1C1B18' }}>{r.company_name}</span>
                        </div>
                      </td>

                      {/* Executives */}
                      <td style={{ padding: '14px 20px', color: '#5B5647' }}>
                        <div style={{ fontWeight: 500 }}>{r.participant_1}</div>
                        <div style={{ fontSize: '12px', color: '#A5A092' }}>{r.participant_2}</div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '14px 20px' }}>
                        <a href={`tel:${r.phone}`} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6B6656', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                          <FaPhone size={10} /> {r.phone}
                        </a>
                      </td>

                      {/* Package */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, color: '#5B5647' }}>
                          <FaTv size={11} style={{ color: r.broadcast_package === 'abbay' ? '#A32020' : '#0F7B4D' }} />
                          {packageLabel(r.broadcast_package)}
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#B5B1A3' }}>
                            · ETB {packageAmount(r.broadcast_package).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {updatingId === r.id && <FaSpinner size={10} style={{ color: '#B8860B', animation: 'spin 1s linear infinite' }} />}
                          <select
                            className="th-select"
                            value={r.status}
                            onChange={e => updateStatus(r.id, e.target.value as RegistrationStatus)}
                            disabled={updatingId === r.id}
                            style={{
                              appearance: 'none', padding: '4px 12px', borderRadius: '20px', fontSize: '10.5px', fontWeight: 700,
                              textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', border: `1px solid ${meta.border}`,
                              background: meta.bg, color: meta.color
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '11.5px', color: '#A5A092' }}>
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Delete */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {confirmDeleteId === r.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => deleteRegistration(r.id)}
                              style={{ background: '#A32020', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ background: 'transparent', border: 'none', color: '#9C9788', cursor: 'pointer', padding: '4px' }}
                            >
                              <FaTimes size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(r.id)}
                            style={{ background: 'transparent', border: 'none', color: '#D8D3C4', cursor: 'pointer', padding: '6px', borderRadius: '6px', transition: 'all 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#A32020')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#D8D3C4')}
                          >
                            <FaTrash size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '11.5px', marginTop: '14px', textAlign: 'center', color: '#B5B1A3' }}>
          {stats.total} team{stats.total === 1 ? '' : 's'} on the ledger · {stats.confirmed} confirmed · ETB {stats.revenue.toLocaleString()} revenue
        </p>
      </div>
    </AdminLayout>
  );
}
