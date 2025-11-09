import { FaArrowRight, FaEnvelope, FaInstagram, FaTelegram, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContactInfo, useSiteConfig } from "../../hooks/useApi";
import OptimizedImage from "../ui/OptimizedImage";

const Footer = () => {
  const { config } = useSiteConfig();
  const { contactInfo } = useContactInfo();
  const currentYear = new Date().getFullYear();

  // Icon mapping for social links
  const iconMap: { [key: string]: any } = {
    instagram: FaInstagram,
    telegram: FaTelegram,
    tiktok: FaTiktok,
    youtube: FaYoutube,
    whatsapp: FaWhatsapp,
  };

  const socialLinks = contactInfo?.socialLinks?.map(link => {
    const Icon = iconMap[link.platform.toLowerCase()] || FaInstagram;
    return {
      icon: Icon,
      href: link.url,
      label: link.platform,
    };
  }) || [];

  const quickLinks = config?.footer?.quickLinks || [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/about", label: "About" },
    { path: "/apply", label: "Apply" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <footer className="hidden md:block relative bg-gray-900 text-white overflow-hidden">
      {/* Decorative gradient overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #FFD447 50%, transparent 100%)",
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6 group">
              <OptimizedImage
                src="/logo.png"
                alt="YENEGE Logo"
                width={200}
                height={125}
                quality={55}
                priority="high"
                responsive={true}
                fallback="/logo.png"
                className="h-14 w-auto brightness-0 invert transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs">
              {config?.footer?.description || "Bringing happiness to life through events, adventures, and community connections."}
            </p>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-10 h-10 rounded-lg bg-white/5 hover:bg-gradient-to-br hover:from-[#25D366] hover:to-[#128C7E] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#25D366]/25"
                      aria-label={social.label}
                    >
                      <Icon size={17} className="relative z-10 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="h-0.5 w-8 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              />
              <h3 className="text-white font-bold text-sm tracking-wider uppercase">
                Quick Links
              </h3>
            </div>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all duration-300"
                  >
                    <span 
                      className="w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-3"
                      style={{
                        background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="h-0.5 w-8 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              />
              <h3 className="text-white font-bold text-sm tracking-wider uppercase">
                Contact
              </h3>
            </div>
            <ul className="space-y-5">
              <li>
                <a
                  href={`mailto:${contactInfo?.email || "bereketyosef49@gmail.com"}`}
                  className="group flex items-start gap-3 text-sm text-gray-400 hover:text-white transition-all duration-300"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-white/5 group-hover:bg-gradient-to-br group-hover:from-[#FFD447] group-hover:to-[#FF6F5E] transition-all duration-300 flex-shrink-0">
                    <FaEnvelope size={14} className="group-hover:text-white transition-colors" />
                  </div>
                  <span className="break-all pt-1.5">{contactInfo?.email || "bereketyosef49@gmail.com"}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-all duration-300"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-gradient-to-br group-hover:from-[#25D366] group-hover:to-[#128C7E] transition-all duration-300 flex-shrink-0">
                    <FaWhatsapp size={14} className="group-hover:text-white transition-colors" />
                  </div>
                  <span className="pt-1.5">WhatsApp: {contactInfo?.phoneFormatted || contactInfo?.phone || "+251 978 639 887"}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">
                  <span className="text-base">📍</span>
                </div>
                <span className="pt-1.5">{contactInfo?.location || "Addis Ababa, Ethiopia"}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="h-0.5 w-8 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              />
              <h3 className="text-white font-bold text-sm tracking-wider uppercase">
                Stay Updated
              </h3>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Subscribe to get notified about upcoming events and adventures.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#FFD447] focus:ring-2 focus:ring-[#FFD447]/20 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="group w-full px-6 py-3.5 text-sm font-semibold text-gray-900 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-[#FFD447]/25 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              >
                <span>Subscribe</span>
                <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} <span className="font-semibold text-gray-400">{config?.siteName || "YENEGE"}</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                to="/about" 
                className="text-gray-500 hover:text-white transition-colors duration-300 relative group"
              >
                Privacy Policy
                <span 
                  className="absolute -bottom-1 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300"
                  style={{
                    background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                />
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-500 hover:text-white transition-colors duration-300 relative group"
              >
                Terms of Service
                <span 
                  className="absolute -bottom-1 left-0 w-0 h-0.5 rounded-full group-hover:w-full transition-all duration-300"
                  style={{
                    background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

