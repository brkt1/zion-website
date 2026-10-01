import { useEffect, useState } from "react";
import { 
  FaArrowUp, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaGraduationCap, 
  FaHome, 
  FaInfoCircle, 
  FaMoon, 
  FaSun 
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { handleLinkHover } from "../../utils/prefetch";

const MobileBottomNav = () => {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Show scroll to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const navItems = [
    { path: "/", label: t.header.home || "Home", rawKey: 'home' },
    { path: "/events", label: t.header.events || "Events", rawKey: 'events' },
    { path: "/masterclass", label: t.header.masterclass || "Masterclass", rawKey: 'masterclass' },
    { path: "/about", label: t.header.about || "About", rawKey: 'about' },
    { path: "/contact", label: t.header.contact || "Contact", rawKey: 'contact' },
  ].map(item => {
    let icon = FaHome;
    if (item.rawKey === 'home') icon = FaHome;
    else if (item.rawKey === 'events') icon = FaCalendarAlt;
    else if (item.rawKey === 'masterclass') icon = FaGraduationCap;
    else if (item.rawKey === 'about') icon = FaInfoCircle;
    else if (item.rawKey === 'contact') icon = FaEnvelope;
    
    return { ...item, icon };
  });

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-50 w-10 h-10 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 bg-[#FF0033] hover:bg-[#D9002C] text-white shadow-[0_0_20px_rgba(255,0,51,0.5)]"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={14} className="text-white" />
        </button>
      )}

      {/* Floating Icon Navigation Dock */}
      <nav 
        role="navigation"
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[94%] max-w-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div 
          className="mobile-dock-container relative px-2 py-2 rounded-full border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden bg-black/95 backdrop-blur-2xl transition-colors duration-300"
        >
          {/* Subtle electric red accent glow */}
          <div 
            className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-[40px] opacity-20 pointer-events-none bg-[#FF0033]"
          />
          <div 
            className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-15 pointer-events-none bg-[#FF0033]"
          />

          <div className="relative flex items-center justify-between px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => handleLinkHover(item.path)}
                  className={`flex items-center justify-center relative p-2.5 rounded-full transition-all duration-300 ${
                    active ? 'active-dock-pill' : ''
                  }`}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  title={item.label}
                >
                  {/* Active background pill */}
                  {active && (
                    <div 
                      className="absolute inset-0 rounded-full bg-[#FF0033]/15 scale-95"
                    />
                  )}
                  
                  {/* Icon */}
                  <div 
                    className={`relative transition-all duration-300 ${
                      active ? 'transform scale-110' : 'opacity-40 hover:opacity-80'
                    }`}
                  >
                    <Icon 
                      size={18} 
                      style={{ 
                        color: active ? '#FF0033' : (theme === 'light' ? '#000000' : '#FFFFFF'),
                        filter: active ? 'drop-shadow(0 0 6px rgba(255, 0, 51, 0.6))' : 'none'
                      }}
                    />
                  </div>

                  {/* Active Indicator Dot */}
                  {active && (
                    <div 
                      className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#FF0033] shadow-[0_0_6px_#FF0033]"
                    />
                  )}
                </Link>
              );
            })}

            {/* Quick Theme Toggle Icon inside Dock */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center relative p-2.5 rounded-full opacity-60 hover:opacity-100 transition-all active:scale-90"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <FaSun size={17} className="text-white hover:text-[#FF0033]" />
              ) : (
                <FaMoon size={17} className="text-black hover:text-[#FF0033]" />
              )}
            </button>

            {/* External link to yenege.events */}
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center relative px-2 py-1 rounded-full transition-all active:scale-95"
              title="Discover Live Events on yenege.events"
              aria-label="yenege.events"
            >
              <span className="text-[9px] font-black tracking-tighter text-white bg-[#FF0033] px-1.5 py-0.5 rounded-full shadow-sm shadow-[#FF0033]/30">
                .EVENTS
              </span>
            </a>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind the floating nav */}
      <div className="md:hidden h-24" />
    </>
  );
};

export default MobileBottomNav;
