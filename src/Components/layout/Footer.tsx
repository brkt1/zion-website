import { FaArrowRight, FaBriefcase, FaEnvelope, FaExternalLinkAlt, FaInstagram, FaTelegram, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useContactInfo, useSiteConfig } from "../../hooks/useApi";
import { handleLinkHover } from "../../utils/prefetch";
import OptimizedImage from "../ui/OptimizedImage";

const Footer = () => {
  const { config } = useSiteConfig();
  const { t, language } = useLanguage();
  const { contactInfo } = useContactInfo();
  const currentYear = new Date().getFullYear();

  const fallbackContact = {
    email: "yenegeevents@gmail.com",
    phone: "+251978639887",
    phoneFormatted: "+251 978 639 887",
    location: "Amir Commercial Complex, 12th Floor, Office No. 12-003, Gabon St (Olympia), Bole Sub-city, Addis Ababa, Ethiopia",
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/yenege_event", icon: "instagram" },
      { platform: "Telegram", url: "https://t.me/yenegeevents", icon: "telegram" },
      { platform: "WhatsApp", url: "https://wa.me/251978639887", icon: "whatsapp" },
      { platform: "TikTok", url: "https://tiktok.com/@yenegeevents", icon: "tiktok" }
    ]
  };

  const finalContact = contactInfo || fallbackContact;

  const getTranslatedLabel = (label: string, path: string) => {
    switch (path) {
      case "/": return t.header.home;
      case "/events": return t.header.events;
      case "/expo-info": return language === 'am' ? "የሰርግ ኤክስፖ" : "Wedding Expo";
      case "/about": return t.header.about;
      case "/masterclass": return t.header.masterclass;
      case "/contact": return t.header.contact;
      default: return label;
    }
  };

  // Icon mapping for social links
  const iconMap: { [key: string]: any } = {
    instagram: FaInstagram,
    telegram: FaTelegram,
    tiktok: FaTiktok,
    youtube: FaYoutube,
    whatsapp: FaWhatsapp,
  };

  const socialLinks = finalContact?.socialLinks?.map(link => {
    const Icon = iconMap[link.platform.toLowerCase()] || FaInstagram;
    return {
      icon: Icon,
      href: link.url,
      label: link.platform,
    };
  }) || [];

  const quickLinks = (config?.footer?.quickLinks || [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/expo-info", label: "Wedding Expo" },
    { path: "/about", label: "About" },
    { path: "/masterclass", label: "Masterclass" },
    { path: "/contact", label: "Contact" },
  ]).map(link => ({
    ...link,
    label: getTranslatedLabel(link.label, link.path)
  })).filter(link => 
    !["community", "corporate", "game", "apply"].includes(link.label.toLowerCase()) &&
    !["/community", "/apply"].includes(link.path.toLowerCase())
  );

  return (
    <footer 
      role="contentinfo"
      aria-label="Site footer"
      className="relative bg-black text-white overflow-hidden border-t border-white/10 pb-28 md:pb-0"
    >
      {/* Red accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #FF0033 50%, transparent 100%)",
        }}
      />

      {/* ── Callout Banner: yenege.events & EventJobs ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
        <div className="grid md:grid-cols-2 gap-5 p-6 rounded-2xl bg-[#080808] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#FF0033]/10 to-transparent blur-[80px] pointer-events-none" />
          
          {/* Card 1: Discover on yenege.events */}
          <div className="flex flex-col justify-between p-6 rounded-xl bg-black border border-white/10 hover:border-[#FF0033]/60 transition-all duration-300 group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#FF0033] shadow-[0_0_8px_#FF0033]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF0033]">
                  Event Discovery Hub
                </span>
              </div>
              <h4 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-white">
                Discover Live Events on yenege.events
              </h4>
              <p className="text-xs text-white/60 leading-relaxed mb-5">
                Browse upcoming concerts, exhibitions, summits, and VIP experiences across Ethiopia and East Africa with instant RSVP & ticketing.
              </p>
            </div>
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-5 py-3 rounded-lg bg-[#FF0033] hover:bg-[#E5002D] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(255,0,51,0.3)] hover:shadow-[0_0_25px_rgba(255,0,51,0.5)]"
            >
              <span>Explore yenege.events</span>
              <FaExternalLinkAlt size={11} />
            </a>
          </div>

          {/* Card 2: EventJobs */}
          <div className="flex flex-col justify-between p-6 rounded-xl bg-black border border-white/10 hover:border-white/40 transition-all duration-300 group">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaBriefcase size={12} className="text-[#FF0033]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
                  Career & Production Crew
                </span>
              </div>
              <h4 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-white">
                EventJobs Portal
              </h4>
              <p className="text-xs text-white/60 leading-relaxed mb-5">
                Connect with leading event organizers. Find roles in stage management, lighting, audio engineering, event hosting, and logistics.
              </p>
            </div>
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between px-5 py-3 rounded-lg border border-white/20 hover:border-white text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-white/10"
            >
              <span>Find Event Jobs</span>
              <FaArrowRight size={11} />
            </a>
          </div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                className="h-12 w-auto brightness-0 invert transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-xs">
              {t.footer.description}
            </p>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-9 h-9 rounded-lg bg-white/5 hover:bg-[#FF0033] border border-white/10 hover:border-[#FF0033] flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,51,0.5)]"
                      aria-label={social.label}
                    >
                      <Icon size={14} className="relative z-10 text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-0.5 w-6 rounded-full bg-[#FF0033]" />
              <h3 className="text-white font-black text-xs tracking-[0.2em] uppercase">
                {t.footer.quickLinks}
              </h3>
            </div>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    onMouseEnter={() => handleLinkHover(link.path)}
                    className="group flex items-center gap-2 text-xs text-white/60 hover:text-white transition-all duration-300"
                  >
                    <span className="w-0 h-0.5 bg-[#FF0033] rounded-full transition-all duration-300 group-hover:w-2.5" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <a 
                  href="https://yenege.events" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-xs text-[#FF0033] hover:text-white font-bold transition-all duration-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF0033]" />
                  <span>yenege.events (Discovery)</span>
                  <FaExternalLinkAlt size={9} />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-0.5 w-6 rounded-full bg-[#FF0033]" />
              <h3 className="text-white font-black text-xs tracking-[0.2em] uppercase">
                {t.footer.contact}
              </h3>
            </div>
            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${finalContact?.email || "yenegeevents@gmail.com"}`}
                  className="group flex items-start gap-3 text-xs text-white/60 hover:text-white transition-all duration-300"
                >
                  <div className="mt-0.5 p-1.5 rounded bg-white/5 group-hover:bg-[#FF0033] transition-all duration-300 flex-shrink-0">
                    <FaEnvelope size={12} className="text-white" />
                  </div>
                  <span className="break-all pt-1">{finalContact?.email || "yenegeevents@gmail.com"}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${finalContact?.phone?.replace(/\D/g, '') || '251978639887'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-xs text-white/60 hover:text-white transition-all duration-300"
                >
                  <div className="p-1.5 rounded bg-white/5 group-hover:bg-[#FF0033] transition-all duration-300 flex-shrink-0">
                    <FaWhatsapp size={12} className="text-white" />
                  </div>
                  <span>WhatsApp: {finalContact?.phoneFormatted || finalContact?.phone || "+251 978 639 887"}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-xs text-white/50">
                <div className="p-1.5 rounded bg-white/5 flex-shrink-0">
                  <span className="text-xs">📍</span>
                </div>
                <span>
                  {(finalContact?.location === "Addis Ababa, Ethiopia" || !finalContact?.location) 
                    ? "Amir Commercial Complex, 12th Floor, Office No. 12-003, Gabon St (Olympia), Bole Sub-city, Addis Ababa, Ethiopia" 
                    : finalContact.location}
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-0.5 w-6 rounded-full bg-[#FF0033]" />
              <h3 className="text-white font-black text-xs tracking-[0.2em] uppercase">
                {t.footer.stayUpdated}
              </h3>
            </div>
            <p className="text-xs text-white/60 mb-5 leading-relaxed">
              {t.footer.subscribeText}
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder={t.footer.subscribePlaceholder}
                  className="w-full px-3.5 py-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#FF0033] focus:ring-1 focus:ring-[#FF0033]/50 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="group w-full px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#FF0033] hover:bg-[#E5002D] rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] flex items-center justify-center gap-2"
              >
                <span>{t.footer.subscribe}</span>
                <FaArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-14 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/40">
              © {currentYear} <span className="font-semibold text-white/70">{config?.siteName || "YENEGE"}</span>. {t.footer.allRights}
            </p>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <Link 
                to="/about" 
                className="hover:text-white transition-colors duration-300"
              >
                {t.footer.privacy}
              </Link>
              <Link 
                to="/contact" 
                className="hover:text-white transition-colors duration-300"
              >
                {t.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

