import { useEffect, useState } from "react";
import { FaArrowUp, FaCalendarAlt, FaEnvelope, FaGraduationCap, FaHome, FaInfoCircle, FaUsers } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSiteConfig } from "../../hooks/useApi";
import { handleLinkHover } from "../../utils/prefetch";
import { BRAND, GRADIENT } from "../../styles/theme";

const MobileBottomNav = () => {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const { config } = useSiteConfig();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/masterclass", label: "Masterclass" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ].map(item => {
    let icon = FaHome;
    const label = item.label.toLowerCase();
    if (label.includes('home')) icon = FaHome;
    else if (label.includes('event')) icon = FaCalendarAlt;
    else if (label.includes('contact')) icon = FaEnvelope;
    else if (label.includes('community')) icon = FaUsers;
    else if (label.includes('masterclass')) icon = FaGraduationCap;
    else if (label.includes('about')) icon = FaInfoCircle;
    
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
          className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90"
          style={{
            background: GRADIENT.brand,
            boxShadow: `0 8px 24px rgba(255, 111, 94, 0.4)`,
            animation: "yg-float 3s ease-in-out infinite",
          }}
          aria-label="Scroll to top"
        >
          <FaArrowUp size={16} className="text-white" />
        </button>
      )}

      {/* Floating Premium Navigation Dock */}
      <nav 
        role="navigation"
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[92%] max-w-md"
      >
        <div 
          className="relative px-2 py-3 rounded-[32px] border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: `${BRAND.navy}E6`, // 90% opacity navy
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
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
                  className="flex flex-col items-center justify-center relative py-1 px-3 min-w-[64px] transition-all duration-300"
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                >
                  {/* Active background pill */}
                  {active && (
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-10"
                      style={{ background: GRADIENT.brand }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div 
                    className={`relative mb-1.5 transition-all duration-300 ${
                      active ? 'transform -translate-y-0.5 scale-110' : 'opacity-50'
                    }`}
                  >
                    <Icon 
                      size={20} 
                      style={{ 
                        color: active ? BRAND.gold : 'white',
                        filter: active ? `drop-shadow(0 0 8px ${BRAND.gold}40)` : 'none'
                      }}
                    />
                  </div>
                  
                  {/* Label */}
                  <span 
                    className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      active 
                        ? 'text-white opacity-100' 
                        : 'text-white/40 opacity-70'
                    }`}
                    style={{ fontSize: '9px' }}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  {active && (
                    <div 
                      className="absolute -bottom-1 w-1 h-1 rounded-full"
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
      <div className="md:hidden h-28" />

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

