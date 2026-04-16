import { useEffect, useState } from "react";
import {
    FaEnvelope,
    FaInstagram,
    FaLinkedin,
    FaPhoneAlt,
    FaTelegramPlane,
    FaTiktok,
    FaWhatsapp
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useContactInfo, useSiteConfig } from "../../hooks/useApi";
import { handleLinkHover } from "../../utils/prefetch";
import OptimizedImage from "../ui/OptimizedImage";

const Header = () => {
  const { config } = useSiteConfig();
  const { contactInfo } = useContactInfo();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { t, language, toggleLanguage } = useLanguage();

  const getTranslatedLabel = (label: string, path: string) => {
    switch (path) {
      case "/": return t.header.home;
      case "/events": return t.header.events;
      case "/masterclass": return t.header.masterclass;
      case "/about": return t.header.about;
      case "/contact": return t.header.contact;
      case "/expo-info": return language === 'am' ? "የሰርግ ኤክስፖ" : "Wedding Expo";
      default: return label;
    }
  };

  const navLinks = (config?.navigation || [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/expo-info", label: "Wedding Expo" },
    { path: "/masterclass", label: "Masterclass" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ]).map(link => ({
    ...link,
    label: getTranslatedLabel(link.label, link.path)
  })).filter(link => 
    !["community", "corporate", "game", "apply", "travel"].includes(link.label.toLowerCase()) &&
    !["/community", "/apply", "/travel"].includes(link.path.toLowerCase())
  );

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      
      if (window.innerWidth < 768 && isHomePage) {
        if (currentScrollY < 10) {
          setIsScrolledDown(false);
        } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsScrolledDown(true);
        } else if (currentScrollY < lastScrollY) {
          setIsScrolledDown(false);
        }
      } else {
        setIsScrolledDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isHomePage]);

  // Derive phone & email from API or use fallbacks
  const contactPhone = contactInfo?.phone || "+251978639887";
  const waLink = `https://wa.me/${contactPhone.replace(/\D/g, '')}`;
  const contactEmail = contactInfo?.email || "yenegeevents@gmail.com";

  return (
    <header
      role="banner"
      aria-label="Site header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0F172A]/95 backdrop-blur-xl shadow-lg"
          : isHomePage
          ? "bg-transparent"
          : "bg-[#0F172A]/95 backdrop-blur-xl"
      } ${
        !isHomePage ? "md:block hidden" : ""
      } ${
        isHomePage && isScrolledDown ? "md:translate-y-0 -translate-y-full" : "translate-y-0"
      }`}
    >
      {/* ── Top Bar (Contact Info & Socials) ── */}
      <div 
        className={`hidden md:block transition-colors duration-500 border-b ${
          isHomePage && !isScrolled
            ? "bg-white/10 border-white/20 text-white" 
            : "bg-[#0F172A] border-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs font-semibold tracking-wide">
          <div className="flex items-center gap-6 opacity-90">
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-[#FFD447] transition-colors">
              <FaEnvelope size={12} />
              {contactEmail}
            </a>
            <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-[#FFD447] transition-colors">
              <FaPhoneAlt size={12} />
              {contactPhone}
            </a>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <span className={language === 'am' ? 'text-[#FFD447]' : 'text-white/60'}>አማ</span>
              <div className="w-px h-2 bg-white/20"></div>
              <span className={language === 'en' ? 'text-[#FFD447]' : 'text-white/60'}>EN</span>
            </button>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors flex items-center gap-1">
              <FaWhatsapp size={14} /> {t.header.wa}
            </a>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            {/* Social Icons */}
            <a href="https://instagram.com/yenege_event" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD447] transition-colors" aria-label="Instagram">
              <FaInstagram size={14} />
            </a>
            <a href="https://t.me/yenegeevents" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD447] transition-colors" aria-label="Telegram">
              <FaTelegramPlane size={14} />
            </a>
            <a href="https://tiktok.com/@yenegeevents" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD447] transition-colors" aria-label="TikTok">
              <FaTiktok size={14} />
            </a>
            <a href="https://linkedin.com/company/yenegeevents" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFD447] transition-colors" aria-label="LinkedIn">
              <FaLinkedin size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center h-20 md:h-24 ${
          isHomePage ? "justify-center md:justify-between" : "justify-between"
        }`}>
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center transition-transform duration-300 hover:scale-105"
            aria-label="YENEGE Home"
          >
            <OptimizedImage
              src="/logo.png"
              alt="YENEGE Logo"
              width={120}
              height={75}
              quality={55}
              priority="high"
              responsive={true}
              sizes="(max-width: 768px) 48px, 56px"
              fallback="/logo.png"
              className={`h-12 md:h-14 w-auto transition-all duration-500 brightness-0 invert`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav 
            role="navigation"
            aria-label="Main navigation"
            className={`hidden lg:flex items-center gap-8 ${
              isHomePage ? "md:flex" : ""
            }`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => handleLinkHover(link.path)}
                aria-current={isActive(link.path) ? "page" : undefined}
                className={`relative text-sm font-semibold tracking-wide transition-all duration-300 ${
                  (link as any).className || (
                    isActive(link.path)
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  )
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive(link.path) && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full transition-all duration-300 bg-[#FFD447]`}
                  />
                )}
                {!isActive(link.path) && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 scale-x-0 rounded-full transition-transform duration-300 origin-left bg-[#FFD447]`}
                  />
                )}
              </Link>
            ))}
          </nav>
          
          {/* Mobile spacing adjustment block when nav is centered */}
          {isHomePage && <div className="md:hidden w-12" />} 
        </div>
      </div>
    </header>
  );
};

export default Header;
