import { useEffect, useState } from "react";
import { FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
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

  const navLinks = config?.navigation || [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/travel", label: "Travel & Adventures" },
    { path: "/community", label: "Community" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      
      // Hide header on mobile when scrolling down, show when scrolling up or at top
      if (window.innerWidth < 768 && isHomePage) {
        if (currentScrollY < 10) {
          // At the top - always show
          setIsScrolledDown(false);
        } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
          // Scrolling down - hide
          setIsScrolledDown(true);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show
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

  return (
    <header
      role="banner"
      aria-label="Site header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? isHomePage
            ? "bg-white/95 backdrop-blur-xl shadow-lg"
            : "bg-white/95 backdrop-blur-xl shadow-lg"
          : isHomePage
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-xl"
      } ${
        // Hide header on mobile except on home page
        !isHomePage ? "md:block hidden" : ""
      } ${
        // Hide header when scrolling down on mobile home page
        isHomePage && isScrolledDown ? "md:translate-y-0 -translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center h-20 md:h-24 ${
          // Center logo on mobile, justify-between on desktop
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
              className={`h-12 md:h-14 w-auto transition-all duration-500 ${
                isHomePage && !isScrolled ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          {/* Desktop Navigation - Hidden on mobile home page */}
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
                  isHomePage && !isScrolled
                    ? isActive(link.path)
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                    : isActive(link.path)
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive(link.path) && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full transition-all duration-300 ${
                      isHomePage && !isScrolled
                        ? "bg-white"
                        : "bg-gradient-to-r from-[#FFD447] to-[#FF6F5E]"
                    }`}
                  />
                )}
                {!isActive(link.path) && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 scale-x-0 rounded-full transition-transform duration-300 origin-left ${
                      isHomePage && !isScrolled
                        ? "bg-white"
                        : "bg-gradient-to-r from-[#FFD447] to-[#FF6F5E]"
                    }`}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side - Contact & Desktop Menu - Hidden on mobile home page */}
          <div className={`flex items-center gap-6 ${
            isHomePage ? "hidden md:flex" : ""
          }`}>
            {/* Contact Info - Desktop Only (mobile uses bottom nav) */}
            <div className="hidden md:flex items-center gap-5">
              <a
                href={`mailto:${contactInfo?.email || "bereketyosef49@gmail.com"}`}
                className={`flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? "text-white/70 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{ minHeight: '44px', minWidth: '44px', padding: '8px 12px' }}
                aria-label={`Send email to ${contactInfo?.email || "bereketyosef49@gmail.com"}`}
              >
                <FaEnvelope size={14} aria-hidden="true" />
                <span className="hidden xl:inline">{contactInfo?.email || "bereketyosef49@gmail.com"}</span>
              </a>
              <a
                href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? "text-white/70 hover:text-white"
                    : "text-gray-600 hover:text-[#25D366]"
                }`}
                style={{ minHeight: '44px', minWidth: '44px', padding: '8px 12px' }}
                aria-label="Contact via WhatsApp"
              >
                <FaWhatsapp size={14} aria-hidden="true" />
                <span className="hidden xl:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;

