import { useEffect, useState } from 'react';
import {
  FaBuilding, FaCalendarAlt, FaCog, FaEnvelope, FaGraduationCap,
  FaHome, FaImages, FaInfoCircle, FaLink, FaMapMarkerAlt,
  FaNewspaper, FaQrcode, FaTicketAlt, FaUsers, FaArrowRight,
  FaChartLine, FaDollarSign, FaUserPlus
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminLayout from '../../Components/admin/AdminLayout';
import { supabase } from '../../services/supabase';

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

const mockRevenueData = [
  { name: 'Mon', revenue: 4000, registrations: 24 },
  { name: 'Tue', revenue: 3000, registrations: 13 },
  { name: 'Wed', revenue: 5000, registrations: 35 },
  { name: 'Thu', revenue: 2780, registrations: 18 },
  { name: 'Fri', revenue: 8890, registrations: 48 },
  { name: 'Sat', revenue: 12390, registrations: 65 },
  { name: 'Sun', revenue: 10490, registrations: 55 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ events: 0, masterclass: 0, tickets: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [eventsRes, masterclassRes, ticketsRes] = await Promise.all([
          supabase.from('events').select('*', { count: 'exact', head: true }),
          supabase.from('masterclass_reservations').select('*', { count: 'exact', head: true }),
          supabase.from('tickets').select('*', { count: 'exact', head: true })
        ]);
        
        setStats({
          events: eventsRes.count || 0,
          masterclass: masterclassRes.count || 0,
          tickets: ticketsRes.count || 0
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout title="Admin Portal">
      <div className="space-y-10 pb-10 font-sans">

        {/* Hero Analytics Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-3">Yenege Admin Portal</p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Analytics.</span>
                </h1>
                <p className="text-slate-400 text-sm mt-3 max-w-xl">
                  Real-time insights and administrative controls for the entire platform ecosystem.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/admin/masterclass-dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 shadow-lg shadow-white/10 hover:bg-slate-100 transition-all text-xs font-black uppercase tracking-widest hover:-translate-y-0.5"
                >
                  <FaChartLine /> View Full Report
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FaCalendarAlt size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Events</p>
                    <h3 className="text-3xl font-black">{stats.events}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <FaGraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Masterclass Apps</p>
                    <h3 className="text-3xl font-black">{stats.masterclass}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FaTicketAlt size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets Issued</p>
                    <h3 className="text-3xl font-black">{stats.tickets}</h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800">Revenue Overview</h3>
                <p className="text-xs text-slate-400 font-medium">Weekly generated income</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <FaDollarSign />
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800">User Registrations</h3>
                <p className="text-xs text-slate-400 font-medium">New platform signups</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <FaUserPlus />
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="registrations" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Administrative Modules */}
        <div className="pt-6">
          <h2 className="text-2xl font-black text-slate-800 mb-8">Administrative Modules</h2>
          
          <div className="space-y-12">
            {navGroups.map(group => (
              <section key={group.label}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${group.color}`} />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{group.label}</h3>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {group.items.map(({ icon: Icon, label, path, desc }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`group bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] ${group.glow}/20 p-6 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col gap-4 relative overflow-hidden`}
                    >
                      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${group.color} opacity-[0.03] group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />
                      
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={20} />
                      </div>
                      <div className="mt-2">
                        <p className="text-base font-black text-slate-800 leading-tight mb-1">{label}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
                      </div>
                      <div className="mt-auto pt-4 flex items-center justify-end">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                          <FaArrowRight size={12} className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

