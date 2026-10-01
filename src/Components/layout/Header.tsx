import { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaEnvelope,
  FaExternalLinkAlt,
  FaInstagram,
  FaLinkedin,
  FaMoon,
  FaPhoneAlt,
  FaSun,
  FaTelegramPlane,
  FaTiktok,
  FaWhatsapp
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useContactInfo } from "../../hooks/useApi";
import { handleLinkHover } from "../../utils/prefetch";
import OptimizedImage from "../ui/OptimizedImage";

const Header = () => {
  const { contactInfo } = useContactInfo();
  const { theme, toggleTheme } = useTheme();
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
      case "/expo-info": return language === 'am' ? "የሰርግ ኤክስፖ" : language === 'om' ? "Eksipoo Cidhaa" : "Wedding Expo";
      default: return label;
    }
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/masterclass", label: "Masterclass" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ].map(link => ({
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
          ? "bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : isHomePage
          ? "bg-black/60 backdrop-blur-md md:bg-transparent"
          : "bg-black/95 backdrop-blur-xl border-b border-white/10"
      } ${
        isHomePage && isScrolledDown ? "md:translate-y-0 -translate-y-full" : "translate-y-0"
      }`}
    >
      {/* ── Top Bar (Contact Info & Socials) ── */}
      <div 
        className={`hidden md:block transition-colors duration-500 border-b ${
          isHomePage && !isScrolled
            ? "bg-black/40 border-white/10 text-white" 
            : "bg-[#050505] border-white/5 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-xs font-medium tracking-wide">
          <div className="flex items-center gap-6 opacity-80">
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-[#FF0033] transition-colors">
              <FaEnvelope size={11} className="text-[#FF0033]" />
              {contactEmail}
            </a>
            <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-[#FF0033] transition-colors">
              <FaPhoneAlt size={11} className="text-[#FF0033]" />
              {contactPhone}
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Direct Portal Highlights */}
            <a 
              href="https://yenege.events" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold text-white hover:text-[#FF0033] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0033] animate-pulse" />
              <span>yenege.events</span>
              <FaExternalLinkAlt size={9} className="opacity-70" />
            </a>

            <div className="w-px h-3 bg-white/15"></div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-6 h-6 rounded-full border border-white/15 hover:border-white/40 transition-all flex items-center justify-center text-white hover:text-[#FF0033]"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FaSun size={10} /> : <FaMoon size={10} />}
            </button>

            <div className="w-px h-3 bg-white/15"></div>

            {/* Language toggle */}
            <button 
              onClick={toggleLanguage}
              title="Switch Language (አማርኛ / English / Afaan Oromoo)"
              className="px-2.5 py-0.5 rounded-full border border-white/15 hover:border-white/40 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <span className={language === 'am' ? 'text-[#FF0033] font-black' : 'text-white/60'}>አማ</span>
              <div className="w-px h-2 bg-white/20"></div>
              <span className={language === 'en' ? 'text-[#FF0033] font-black' : 'text-white/60'}>EN</span>
              <div className="w-px h-2 bg-white/20"></div>
              <span className={language === 'om' ? 'text-[#FF0033] font-black' : 'text-white/60'}>OM</span>
            </button>
            <div className="w-px h-3 bg-white/15"></div>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0033] transition-colors flex items-center gap-1">
              <FaWhatsapp size={13} /> {t.header.wa}
            </a>
            <div className="w-px h-3 bg-white/15"></div>
            {/* Social Icons */}
            <a href="https://instagram.com/yenege_event" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0033] transition-colors" aria-label="Instagram">
              <FaInstagram size={13} />
            </a>
            <a href="https://t.me/yenegeevents" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0033] transition-colors" aria-label="Telegram">
              <FaTelegramPlane size={13} />
            </a>
            <a href="https://tiktok.com/@yenegeevents" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0033] transition-colors" aria-label="TikTok">
              <FaTiktok size={13} />
            </a>
            <a href="https://linkedin.com/company/yenegeevents" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0033] transition-colors" aria-label="LinkedIn">
              <FaLinkedin size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
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
              sizes="(max-width: 768px) 44px, 56px"
              fallback="/logo.png"
              className="h-9 md:h-12 w-auto transition-all duration-500 brightness-0 invert"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav 
            role="navigation"
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-7"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => handleLinkHover(link.path)}
                aria-current={isActive(link.path) ? "page" : undefined}
                className={`relative text-xs uppercase tracking-[0.18em] font-semibold transition-all duration-300 py-1 ${
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
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full transition-all duration-300 bg-[#FF0033] shadow-[0_0_10px_#FF0033]"
                  />
                )}
                {!isActive(link.path) && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 scale-x-0 rounded-full transition-transform duration-300 origin-left bg-[#FF0033]"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* CTAs: Discover Events on yenege.events & EventJobs & Theme */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="hidden md:flex w-8 h-8 rounded-full border border-white/20 hover:border-white/50 items-center justify-center text-white hover:text-[#FF0033] transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FaSun size={13} /> : <FaMoon size={13} />}
            </button>

            {/* EventJobs Link */}
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-white text-white text-[11px] font-bold tracking-wider uppercase transition-all duration-300 hover:bg-white/10"
              title="Find Event Jobs & Crews on yenege.events"
            >
              <FaBriefcase size={10} className="text-[#FF0033]" />
              <span>EventJobs</span>
            </a>

            {/* yenege.events Discover Button */}
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FF0033] hover:bg-[#E5002D] text-white text-[10px] sm:text-xs font-extrabold tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,0,51,0.35)] hover:shadow-[0_0_30px_rgba(255,0,51,0.6)] active:scale-95"
              title="Discover All Events on yenege.events"
            >
              <span>yenege.events</span>
              <FaExternalLinkAlt size={9} />
            </a>

            {/* Mobile Embedded Theme Toggle & Language Switcher */}
            <div className="flex md:hidden items-center gap-1.5 ml-0.5">
              <button 
                onClick={toggleTheme}
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <FaSun size={11} /> : <FaMoon size={11} />}
              </button>
              <button 
                onClick={toggleLanguage}
                title="Switch Language (አማርኛ / English / Afaan Oromoo)"
                className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 text-white active:scale-95 transition-all"
              >
                <span className={language === 'am' ? 'text-[#FF0033] font-black' : 'text-white/60'}>አማ</span>
                <div className="w-px h-2 bg-white/30"></div>
                <span className={language === 'en' ? 'text-[#FF0033] font-black' : 'text-white/60'}>EN</span>
                <div className="w-px h-2 bg-white/30"></div>
                <span className={language === 'om' ? 'text-[#FF0033] font-black' : 'text-white/60'}>OM</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

