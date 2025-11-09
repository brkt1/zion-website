import { useEffect, useState } from "react";
import { FaArrowUp, FaCalendarAlt, FaEnvelope, FaHome, FaInfoCircle, FaWhatsapp } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useContactInfo } from "../../hooks/useApi";

const MobileBottomNav = () => {
  const location = useLocation();
  const { contactInfo } = useContactInfo();
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
    { path: "/about", label: "About", icon: FaInfoCircle },
    { path: "/contact", label: "Contact", icon: FaEnvelope },
  ];

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
          className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
            boxShadow: "0 4px 20px rgba(255, 111, 94, 0.4)",
          }}
          aria-label="Scroll to top"
        >
          <FaArrowUp size={18} className="text-gray-900" />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
        style={{
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative group ${
                  active ? 'text-[#FF6F5E]' : 'text-gray-600'
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-b-full"
                    style={{
                      background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                    }}
                  />
                )}
                
                <Icon 
                  size={20} 
                  className={`transition-all duration-300 ${active ? 'scale-110' : 'group-active:scale-95'}`}
                />
                <span className={`text-xs mt-1 font-medium transition-all duration-300 ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* WhatsApp Quick Action */}
          <a
            href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center flex-1 h-full text-[#25D366] transition-all duration-300 group"
            aria-label="Contact via WhatsApp"
          >
            <div className="relative">
              <FaWhatsapp 
                size={22} 
                className="relative z-10 transition-all duration-300 group-active:scale-95"
              />
              {/* Pulse animation */}
              <span 
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{
                  background: "#25D366",
                }}
              />
            </div>
            <span className="text-xs mt-1 font-medium">Chat</span>
          </a>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="md:hidden h-16" />
    </>
  );
};

export default MobileBottomNav;

