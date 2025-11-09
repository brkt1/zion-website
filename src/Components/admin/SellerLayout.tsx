import { ReactNode, useState } from 'react';
import { FaBars, FaChartLine, FaTicketAlt, FaTimes, FaTrophy, FaUser } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

interface SellerLayoutProps {
  children: ReactNode;
}

const SellerLayout = ({ children }: SellerLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: FaChartLine, label: 'Dashboard', path: '/admin/seller-dashboard' },
    { icon: FaTicketAlt, label: 'Sales', path: '/admin/seller-sales' },
    { icon: FaTrophy, label: 'Goals', path: '/admin/seller-goals' },
    { icon: FaUser, label: 'Profile', path: '/admin/seller-profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-amber-50 pb-20 md:pb-0">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1 pt-16 pb-4 overflow-y-auto">
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={active ? 'text-yellow-600' : 'text-gray-400'} size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Sidebar Toggle Button (Desktop only) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`hidden lg:fixed lg:z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300 ${
          sidebarOpen ? 'lg:top-4 lg:left-[17rem]' : 'lg:top-4 lg:left-4'
        }`}
      >
        {sidebarOpen ? <FaTimes size={20} className="text-gray-600" /> : <FaBars size={20} className="text-gray-600" />}
      </button>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {mobileMenuOpen ? <FaTimes size={20} className="text-gray-600" /> : <FaBars size={20} className="text-gray-600" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
            <div className="flex flex-col h-full pt-16 pb-4">
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={active ? 'text-yellow-600' : 'text-gray-400'} size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Main Content with Sidebar Offset (Desktop only) */}
      <div className={`lg:transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        {children}
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center flex-1 py-2 transition-colors"
              >
                <Icon className={active ? 'text-yellow-600 mb-1' : 'text-gray-400 mb-1'} size={20} />
                <span className={`text-xs ${active ? 'font-medium text-yellow-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default SellerLayout;

