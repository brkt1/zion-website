import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaYoutube
} from "react-icons/fa";
import { ContactSkeleton } from "../Components/ui/ContactSkeleton";
import { useLanguage } from "../contexts/LanguageContext";
import { useContactInfo } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";

/* ─── Shared design tokens ─────────────────────────────────────────────────── */
const BRAND = {
  primary: "#0F172A",
  navy: "#0F172A",
  navyLight: "#1E293B",
  gold: "#FFD447",
  coral: "#FF6F5E",
  cream: "#FAF9F6",
  white: "#FFFFFF",
  gray100: "#F0F2F5",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
};

const GRADIENT = {
  brand: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
  textDark: "linear-gradient(135deg, #111827 0%, #374151 100%)",
};

/* ─── Sub-components ────────────────────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 18px",
      borderRadius: "999px",
      background: "rgba(228,232,33,0.1)",
      border: "1px solid rgba(228,232,33,0.3)",
      marginBottom: "20px",
    }}
  >
    <span
      className="yg-font-sans"
      style={{
        background: GRADIENT.brand,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  </div>
);

const Contact = () => {
  useScrollReveal();
  const { t } = useLanguage();
  const { contactInfo, isLoading } = useContactInfo();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  
  useEffect(() => {
    document.title = "Contact Us | YENEGE";
  }, []);

  // We no longer strictly block on contactInfo to make the page independent of database availability
  // isLoading is still used to show a brief skeleton for better UX, but we proceed if it takes too long or fails
  const showSkeleton = isLoading && !contactInfo;

  if (showSkeleton) {
    return <ContactSkeleton />;
  }

  // Define hardcoded fallbacks
  const fallbackContact = {
    email: "yenegeevents@gmail.com",
    phone: "+251978639887",
    phoneFormatted: "+251 978 639 887",
    location: "Addis Ababa, Ethiopia",
    socialLinks: []
  };

  const finalContact = contactInfo || fallbackContact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const whatsappMessage = `Hello! I'm ${formData.name}.\n\n` +
        `Email: ${formData.email}\n` +
        (formData.phone ? `Phone: ${formData.phone}\n` : '') +
        `\nMessage:\n${formData.message}`;
      
      const phoneNumber = finalContact?.phone?.replace(/\D/g, '') || "251978639887";
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
      
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus("error");
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };



  const contactInfoItems = [
    {
      num: "01",
      icon: <FaMapMarkerAlt />,
      title: "Our Studio",
      content: finalContact.location || "Addis Ababa, Ethiopia",
      link: null,
    },
    {
      num: "02",
      icon: <FaEnvelope />,
      title: "Email Us",
      content: finalContact.email || "yenegeevents@gmail.com",
      link: `mailto:${finalContact.email || "yenegeevents@gmail.com"}`,
    },
    {
      num: "03",
      icon: <FaPhone />,
      title: "Call Us",
      content: finalContact.phoneFormatted || finalContact.phone || "+251 978 639 887",
      link: `tel:${finalContact.phone?.replace(/\D/g, '') || '251978639887'}`,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.primary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .yg-font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .yg-font-sans  { font-family: 'Manrope', system-ui, sans-serif; }

        .noise-bk {
          position: absolute;
          inset: 0;
          opacity: 0.2;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent, #0F172A), 
                      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          z-index: 1;
        }

        .sidebrand {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%) rotate(90deg);
          transform-origin: right center;
          font-family: 'Manrope', sans-serif;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1em;
          color: rgba(255, 212, 71, 0.1);
          text-transform: uppercase;
          pointer-events: none;
          z-index: 10;
          white-space: nowrap;
        }

        .yg-contact-input {
          width: 100%;
          padding: 16px 24px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          color: #fff;
          transition: all 0.3s;
        }
        .yg-contact-input:focus {
          outline: none;
          background: rgba(255,255,255,0.07);
          border-color: ${BRAND.gold};
          box-shadow: 0 0 0 4px rgba(255,212,71,0.05);
        }

        .yg-btn-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 20px;
          border-radius: 16px;
          background: ${BRAND.gold};
          color: ${BRAND.primary};
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 12px 30px rgba(255,212,71,0.15);
        }
        .yg-btn-submit:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 20px 40px rgba(255,212,71,0.25);
        }

        .yg-social-btn {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 20px;
          transition: all 0.3s;
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .yg-social-btn:hover {
          transform: translateY(-4px) scale(1.1);
          background: ${BRAND.gold} !important;
          color: ${BRAND.primary} !important;
          border-color: ${BRAND.gold};
        }

        @media (max-width: 768px) {
          .yg-grid-mobile { grid-template-columns: 1fr !important; gap: 40px !important; }
          .sidebrand { display: none; }
        }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section style={{ padding: "180px 0 80px", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        {/* Creative Layers */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            fontSize: 'max(25vw, 400px)',
            fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            color: 'rgba(255, 212, 71, 0.02)', 
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none'
          }}
        >
          CONNECT
        </div>
        <div className="noise-bk" />
        <div className="sidebrand">YENEGE CONTACT 2024</div>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,111,94,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />

        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: "800px" }}>
            <SectionLabel>{t.contact.label}</SectionLabel>
            <h1
              className="yg-font-serif"
              style={{
                fontSize: "clamp(52px, 8vw, 92px)",
                fontWeight: 900,
                color: BRAND.white,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                marginBottom: "32px",
              }}
            >
              {t.contact.title?.split(' ')?.slice(0, 3)?.join(' ') || t.contact.title} <br />
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                {t.contact.title?.split(' ')?.slice(3)?.join(' ') || ''}
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── Contact Section ─────────────────────────────────────────────── */}
      <section style={{ padding: "40px 0 140px", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(228,232,33,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />
        
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div className="yg-grid-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "100px", alignItems: "start" }}>
            
            {/* Left Column: Info */}
            <div>
              <p className="yg-font-sans" style={{ fontSize: "20px", color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: "64px" }}>
                {t.contact.desc}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                {contactInfoItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "24px", alignItems: "start" }}>
                    <div style={{ position: "relative" }}>
                       <span style={{ fontSize: "64px", fontWeight: 900, color: "rgba(15,23,42,0.04)", position: "absolute", top: "-24px", left: "-16px", zIndex: 0 }}>{item.num}</span>
                       <div style={{ position: "relative", zIndex: 1, color: BRAND.coral, fontSize: "24px", marginTop: "12px" }}>{item.icon}</div>
                    </div>
                    <div>
                       <h3 className="yg-font-serif" style={{ fontSize: "20px", fontWeight: 800, color: BRAND.white, marginBottom: "8px" }}>{item.title}</h3>
                       {item.link ? (
                         <a href={item.link} className="yg-font-sans" style={{ fontSize: "17px", color: 'rgba(255,255,255,0.4)', textDecoration: "none" }}>{item.content}</a>
                       ) : (
                         <p className="yg-font-sans" style={{ fontSize: "17px", color: 'rgba(255,255,255,0.4)' }}>{item.content}</p>
                       )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "80px" }}>
                <h3 className="yg-font-serif" style={{ fontSize: "20px", fontWeight: 800, color: BRAND.white, marginBottom: "24px" }}>Follow Our Journey</h3>
                <div style={{ display: "flex", gap: "16px" }}>
                  {[
                    { icon: <FaInstagram />, href: "https://instagram.com/yenege_event", bg: "linear-gradient(135deg, #E4405F 0%, #833AB4 100%)" },
                    { icon: <FaTelegram />, href: "https://t.me/yenegeevents", bg: "linear-gradient(135deg, #0088cc 0%, #006699 100%)" },
                    { icon: <FaTiktok />, href: "https://tiktok.com/@yenegeevents", bg: "linear-gradient(135deg, #000000 0%, #333333 100%)" },
                    { icon: <FaYoutube />, href: "https://youtube.com/@yenegeevents", bg: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)" },
                  ].map((social, i) => (
                    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="yg-social-btn">
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: "40px", border: "1px solid rgba(255,255,255,0.1)", padding: "60px", backdropFilter: 'blur(20px)' }}>
               <h2 className="yg-font-serif" style={{ fontSize: "32px", fontWeight: 900, marginBottom: "40px", color: BRAND.white }}>{t.contact.formTitle}</h2>
               
               {submitStatus === "success" && (
                 <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(37,211,102,0.1)", color: "#128C7E", marginBottom: "32px", fontSize: "14px", fontWeight: 600 }}>
                   Opening WhatsApp... If it didn't open, please check your browser settings.
                 </div>
               )}

               <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="yg-grid-mobile">
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gray500, marginBottom: "10px" }}>{t.contact.name} *</label>
                      <input type="text" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} className="yg-contact-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gray500, marginBottom: "10px" }}>{t.contact.email} *</label>
                      <input type="email" name="email" required placeholder="john@example.com" value={formData.email} onChange={handleChange} className="yg-contact-input" />
                    </div>
                 </div>
                 
                 <div>
                   <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gray500, marginBottom: "10px" }}>{t.contact.phone}</label>
                   <input type="tel" name="phone" placeholder="+251 9XX XXX XXX" value={formData.phone} onChange={handleChange} className="yg-contact-input" />
                 </div>

                 <div>
                   <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gold, marginBottom: "10px" }}>{t.contact.message} *</label>
                   <textarea name="message" required rows={5} placeholder="Tell us about your next project or goal..." value={formData.message} onChange={handleChange} className="yg-contact-input" style={{ resize: "none" }} />
                 </div>

                 <button type="submit" disabled={isSubmitting} className="yg-btn-submit">
                   {isSubmitting ? "Processing..." : <><FaWhatsapp size={18} /> {t.contact.send}</>}
                 </button>
               </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;


