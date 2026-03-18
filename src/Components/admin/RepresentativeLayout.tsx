import { ReactNode, useState } from 'react';
import { FaBars, FaHandshake, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

interface RepresentativeLayoutProps {
  children: ReactNode;
}

const RepresentativeLayout = ({ children }: RepresentativeLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: FaHandshake, label: 'Partners & Sponsorships', path: '/admin/representative-dashboard' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:w-72 bg-[#1C2951] transition-transform duration-500 ease-in-out border-r border-white/5 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1 pt-12 pb-8 overflow-y-auto px-6">
          <div className="mb-12 px-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                   <FaHandshake size={20} />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white tracking-tight">Yenege <span className="text-emerald-400">PARTNER</span></h1>
                </div>
             </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 ${
                    active
                      ? 'bg-white/10 text-emerald-400 border border-white/10 shadow-xl shadow-black/20'
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={active ? 'text-emerald-400' : 'text-white/20'} size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto px-4">
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-red-400/60 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all"
             >
                <FaSignOutAlt size={18} />
                <span>Abort Session</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:transition-all lg:duration-500 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        {/* Top Navigation / Mobile header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:justify-end">
           <button
             onClick={() => setMobileMenuOpen(true)}
             className="lg:hidden p-3 bg-gray-50 rounded-2xl text-[#1C2951] hover:bg-gray-100 transition-all"
           >
             <FaBars size={20} />
           </button>

           <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-3 bg-gray-50 rounded-2xl text-[#1C2951] hover:bg-gray-100 transition-all"
              >
                {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
           </div>
        </header>

        <div className="relative">
           {children}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
         <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-[#1C2951]/95 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-80 bg-[#1C2951] shadow-2xl flex flex-col p-8 border-r border-white/5">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                        <FaHandshake size={20} />
                     </div>
                     <span className="text-xl font-black text-white tracking-widest uppercase">Yenege</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-white/40 hover:text-white">
                     <FaTimes size={24} />
                  </button>
               </div>
               
               <nav className="space-y-4">
                  {navItems.map((item) => (
                     <button
                        key={item.path}
                        onClick={() => {
                           navigate(item.path);
                           setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all ${
                           isActive(item.path) ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-white/40 border border-white/5'
                        }`}
                     >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                     </button>
                  ))}
               </nav>

               <div className="mt-auto">
                  <button 
                     onClick={handleLogout}
                     className="w-full flex items-center gap-4 px-6 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-red-400 border border-red-400/20 rounded-2xl"
                  >
                     <FaSignOutAlt size={20} />
                     <span>Terminate</span>
                  </button>
               </div>
            </aside>
         </div>
      )}
    </div>
  );
};

export default RepresentativeLayout;
