import { useEffect, useState } from "react";
import { FaBars, FaEnvelope, FaTimes, FaWhatsapp } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useContactInfo, useSiteConfig } from "../../hooks/useApi";
import { handleLinkHover } from "../../utils/prefetch";

const Header = () => {
  const { config } = useSiteConfig();
  const { contactInfo } = useContactInfo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navLinks = config?.navigation || [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
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
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? isHomePage
            ? "bg-white/95 backdrop-blur-xl shadow-lg"
            : "bg-white/95 backdrop-blur-xl shadow-lg"
          : isHomePage
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center transition-transform duration-300 hover:scale-105"
          >
            <img
              src="/logo.png"
              alt="YENEGE Logo"
              className={`h-12 md:h-14 w-auto transition-all duration-500 ${
                isHomePage && !isScrolled ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => handleLinkHover(link.path)}
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

          {/* Right Side - Contact & Mobile Menu */}
          <div className="flex items-center gap-6">
            {/* Contact Info - Desktop */}
            <div className="hidden md:flex items-center gap-5">
              <a
                href={`mailto:${contactInfo?.email || "bereketyosef49@gmail.com"}`}
                className={`flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? "text-white/70 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaEnvelope size={14} />
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
              >
                <FaWhatsapp size={14} />
                <span className="hidden xl:inline">WhatsApp</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                isHomePage && !isScrolled
                  ? "text-white hover:bg-white/10"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-[500px] opacity-100 pb-6" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="space-y-2 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => handleLinkHover(link.path)}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 text-base font-semibold rounded-lg transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? isActive(link.path)
                      ? "text-white bg-white/10"
                      : "text-white/80 hover:bg-white/5"
                    : isActive(link.path)
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile Contact Info */}
            <div className="pt-4 mt-4 space-y-3 border-t border-gray-200">
              <a
                href={`mailto:${contactInfo?.email || "bereketyosef49@gmail.com"}`}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? "text-white/80 hover:bg-white/5"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaEnvelope size={16} />
                <span>{contactInfo?.email || "bereketyosef49@gmail.com"}</span>
              </a>
              <a
                href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? "text-white/80 hover:bg-white/5"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#25D366]"
                }`}
              >
                <FaWhatsapp size={16} />
                <span>WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

