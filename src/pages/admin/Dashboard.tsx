import {
  FaBuilding, FaCalendarAlt, FaCog, FaEnvelope, FaGraduationCap,
  FaHome, FaImages, FaInfoCircle, FaLink, FaMapMarkerAlt,
  FaNewspaper, FaQrcode, FaTicketAlt, FaUsers, FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Components/admin/AdminLayout';

const navGroups = [
  {
    label: 'Masterclass',
    color: 'from-indigo-600 to-purple-700',
    glow: 'shadow-indigo-200',
    items: [
      { icon: FaGraduationCap, label: 'Analytics Dashboard', path: '/admin/masterclass-dashboard', desc: 'Registrations, payments & revenue' },
      { icon: FaUsers, label: 'Direct Reservations', path: '/admin/masterclass-reservations', desc: 'Manage direct student applications' },
      { icon: FaLink, label: 'Referral Students', path: '/admin/masterclass-referrals', desc: 'Students via marketing links' },
      { icon: FaUsers, label: 'Sales Team', path: '/admin/masterclass-sales-team', desc: 'Sales staff management' },
    ],
  },
  {
    label: 'Events & Tickets',
    color: 'from-blue-500 to-cyan-600',
    glow: 'shadow-blue-200',
    items: [
      { icon: FaCalendarAlt, label: 'Events', path: '/admin/events', desc: 'Create & manage events' },
      { icon: FaQrcode, label: 'Verify Tickets', path: '/admin/verify', desc: 'QR code ticket scanner' },
      { icon: FaTicketAlt, label: 'Commission Sellers', path: '/admin/commission-sellers', desc: 'Seller commissions' },
      { icon: FaBuilding, label: 'Expo Applications', path: '/admin/expo-applications', desc: 'Exhibitor applications' },
    ],
  },
  {
    label: 'Content',
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-200',
    items: [
      { icon: FaHome, label: 'Home Content', path: '/admin/home', desc: 'Edit homepage text' },
      { icon: FaInfoCircle, label: 'About Content', path: '/admin/about', desc: 'Edit about page' },
      { icon: FaEnvelope, label: 'Contact Info', path: '/admin/contact', desc: 'Contact details' },
      { icon: FaNewspaper, label: 'Categories', path: '/admin/categories', desc: 'Event categories' },
    ],
  },
  {
    label: 'Media & Settings',
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-200',
    items: [
      { icon: FaImages, label: 'Gallery', path: '/admin/gallery', desc: 'Photo gallery' },
      { icon: FaMapMarkerAlt, label: 'Destinations', path: '/admin/destinations', desc: 'Travel destinations' },
      { icon: FaUsers, label: 'Admins', path: '/admin/admins', desc: 'Admin user management' },
      { icon: FaCog, label: 'Site Settings', path: '/admin/settings', desc: 'Global site config' },
    ],
  },
];

export default function Dashboard() {
  return (
    <AdminLayout title="Admin Portal">
      <div className="space-y-10 pb-10">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px] pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-3">Yenege Admin Portal</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Admin.</span>
            </h1>
            <p className="text-white/50 text-sm max-w-xl">Navigate to any section below. For masterclass registration analytics, use the Masterclass dashboard.</p>
            <Link
              to="/admin/masterclass-dashboard"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-black uppercase tracking-widest"
            >
              <FaGraduationCap /> Masterclass Analytics <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* Nav Groups */}
        {navGroups.map(group => (
          <section key={group.label}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-0.5 w-6 rounded-full bg-gradient-to-r ${group.color}`} />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{group.label}</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {group.items.map(({ icon: Icon, label, path, desc }) => (
                <Link
                  key={path}
                  to={path}
                  className={`group bg-white rounded-2xl border border-slate-100 shadow-lg ${group.glow}/30 p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col gap-3`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-tight">{label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <FaArrowRight size={10} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all mt-auto" />
                </Link>
              ))}
            </div>
          </section>
        ))}

      </div>
    </AdminLayout>
  );
}
