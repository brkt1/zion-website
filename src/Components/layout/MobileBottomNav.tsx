import { useEffect, useState } from "react";
import { FaArrowUp, FaCalendarAlt, FaEnvelope, FaGraduationCap, FaHome, FaInfoCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

import { handleLinkHover } from "../../utils/prefetch";
import { BRAND, GRADIENT } from "../../styles/theme";

import { useLanguage } from "../../contexts/LanguageContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

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
    else if (item.rawKey === 'contact') icon = FaEnvelope;
    else if (item.rawKey === 'masterclass') icon = FaGraduationCap;
    else if (item.rawKey === 'about') icon = FaInfoCircle;
    
    return { ...item, icon };
  }).slice(0, 5);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
     

      {/* Scroll to Top Button - Floating Design */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-5 z-50 w-11 h-11 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90"
          style={{
            background: GRADIENT.brand,
            boxShadow: `0 8px 24px rgba(255, 111, 94, 0.4)`,
            animation: "yg-float 3s ease-in-out infinite",
          }}
          aria-label="Scroll to top"
        >
          <FaArrowUp size={15} className="text-white" />
        </button>
      )}

      {/* Floating Icon-Only Navigation Dock */}
      <nav 
        role="navigation"
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 w-[88%] max-w-sm"
      >
        <div 
          className="relative px-3 py-2.5 rounded-full border border-white/15 shadow-2xl overflow-hidden"
          style={{
            background: `${BRAND.navy}F0`, // 94% opacity navy
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Subtle accent glow */}
          <div 
            className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ background: BRAND.gold }}
          />
          <div 
            className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ background: BRAND.coral }}
          />

          <div className="relative flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => handleLinkHover(item.path)}
                  className="flex items-center justify-center relative p-2.5 rounded-full transition-all duration-300"
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  title={item.label}
                >
                  {/* Active background pill */}
                  {active && (
                    <div 
                      className="absolute inset-0 rounded-full opacity-20"
                      style={{ background: GRADIENT.brand }}
                    />
                  )}
                  
                  {/* Icon Only */}
                  <div 
                    className={`relative transition-all duration-300 ${
                      active ? 'transform scale-110' : 'opacity-50 hover:opacity-80'
                    }`}
                  >
                    <Icon 
                      size={22} 
                      style={{ 
                        color: active ? BRAND.gold : 'white',
                        filter: active ? `drop-shadow(0 0 10px ${BRAND.gold}60)` : 'none'
                      }}
                    />
                  </div>

                  {/* Active Indicator Dot */}
                  {active && (
                    <div 
                      className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ 
                        background: BRAND.gold,
                        boxShadow: `0 0 10px ${BRAND.gold}`
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind the floating nav */}
      <div className="md:hidden h-24" />

      {/* Custom Animations */}
      <style>{`
        @keyframes yg-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </>
  );
};

export default MobileBottomNav;
