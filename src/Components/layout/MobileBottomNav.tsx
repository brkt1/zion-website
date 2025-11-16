import { useEffect, useState } from "react";
import { FaArrowUp, FaCalendarAlt, FaEnvelope, FaHome, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

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

  const navItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/events", label: "Events", icon: FaCalendarAlt },
    { path: "/travel", label: "Travel", icon: FaMapMarkerAlt },
    { path: "/contact", label: "Contact", icon: FaEnvelope },
    { path: "/community", label: "Community", icon: FaUsers },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Scroll to Top Button - Floating Bubble Design */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90"
          style={{
            background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
            boxShadow: "0 8px 24px rgba(255, 111, 94, 0.5), 0 0 0 4px rgba(255, 111, 94, 0.1)",
            animation: "float 3s ease-in-out infinite",
          }}
          aria-label="Scroll to top"
        >
          <FaArrowUp size={16} className="text-white" />
        </button>
      )}

      {/* Unique Floating Curved Navigation Bar */}
      <nav 
        role="navigation"
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
      >
        {/* Curved background with gradient */}
        <div 
          className="relative h-24"
          style={{
            background: "linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 60%, transparent 100%)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
          }}
        >
          {/* Curved top edge using SVG */}
          <svg 
            className="absolute top-0 left-0 w-full h-8"
            viewBox="0 0 400 32"
            preserveAspectRatio="none"
            style={{ fill: 'rgba(255, 255, 255, 0.98)' }}
          >
            <path d="M0,32 Q200,0 400,32 L400,32 L0,32 Z" />
          </svg>
          
          {/* Gradient overlay on curve */}
          <div 
            className="absolute top-0 left-0 w-full h-8"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255, 212, 71, 0.3) 25%, rgba(255, 111, 94, 0.3) 50%, rgba(255, 212, 71, 0.3) 75%, transparent 100%)",
              maskImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 32\"><path d=\"M0,32 Q200,0 400,32 L400,32 L0,32 Z\"/></svg>')",
              WebkitMaskImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 32\"><path d=\"M0,32 Q200,0 400,32 L400,32 L0,32 Z\"/></svg>')",
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
            }}
          />
        </div>

        {/* Navigation Items Container */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-4 pb-2 pointer-events-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center relative group"
                style={{ flex: '0 0 auto' }}
                aria-current={isActive(item.path) ? "page" : undefined}
                aria-label={item.label}
              >
                {/* Floating active indicator */}
                {active && (
                  <>
                    {/* Glow effect */}
                    <div 
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full blur-xl opacity-30 transition-all duration-500"
                      style={{
                        background: "radial-gradient(circle, #FFD447 0%, #FF6F5E 100%)",
                        animation: "pulse-glow 2s ease-in-out infinite",
                      }}
                    />
                    {/* Active dot indicator */}
                    <div 
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                        boxShadow: "0 0 8px rgba(255, 111, 94, 0.6)",
                      }}
                    />
                  </>
                )}
                
                {/* Icon with unique floating animation */}
                <div 
                  className={`relative mb-1 transition-all duration-500 ${
                    active 
                      ? 'transform translate-y-[-4px]' 
                      : 'group-active:scale-90'
                  }`}
                  style={active ? {
                    animation: "float-icon 2s ease-in-out infinite",
                  } : {}}
                >
                  {/* Icon background circle */}
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      active 
                        ? 'shadow-lg' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}
                    style={active ? {
                      background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                      boxShadow: "0 6px 20px rgba(255, 111, 94, 0.4), 0 0 0 3px rgba(255, 111, 94, 0.1)",
                    } : {}}
                  >
                    <Icon 
                      size={22} 
                      className={`transition-all duration-300 ${
                        active 
                          ? 'text-white' 
                          : 'text-gray-600 group-hover:text-gray-800'
                      }`}
                    />
                  </div>
                </div>
                
                {/* Label with slide animation */}
                <span 
                  className={`text-[9px] font-bold transition-all duration-300 ${
                    active 
                      ? 'text-[#FF6F5E] translate-y-0 opacity-100' 
                      : 'text-gray-500 translate-y-1 opacity-70 group-hover:opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer */}
      <div className="md:hidden h-20" />

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes float-icon {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, 0) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, 0) scale(1.1);
          }
        }
      `}</style>
    </>
  );
};

export default MobileBottomNav;

