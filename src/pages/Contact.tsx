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
import { useContactInfo } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";

/* ─── Shared design tokens ─────────────────────────────────────────────────── */
const BRAND = {
  navy: "#0F172A",
  navyLight: "#1E293B",
  gold: "#E4E821",
  coral: "#FF6F5E",
  cream: "#FAF9F6",
  white: "#FFFFFF",
  gray100: "#F0F2F5",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
};

const GRADIENT = {
  brand: "linear-gradient(135deg, #E4E821 0%, #FF6F5E 100%)",
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

  if (isLoading || !contactInfo) {
    return <ContactSkeleton />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const whatsappMessage = `Hello! I'm ${formData.name}.\n\n` +
        `Email: ${formData.email}\n` +
        (formData.phone ? `Phone: ${formData.phone}\n` : '') +
        `\nMessage:\n${formData.message}`;
      
      const phoneNumber = contactInfo?.phone?.replace(/\D/g, '') || "251978639887";
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

  const iconMap: { [key: string]: any } = {
    email: FaEnvelope,
    phone: FaPhone,
    location: FaMapMarkerAlt,
    instagram: FaInstagram,
    telegram: FaTelegram,
    tiktok: FaTiktok,
    youtube: FaYoutube,
  };

  const contactInfoItems = [
    {
      num: "01",
      icon: <FaMapMarkerAlt />,
      title: "Our Studio",
      content: contactInfo.location || "Addis Ababa, Ethiopia",
      link: null,
    },
    {
      num: "02",
      icon: <FaEnvelope />,
      title: "Email Us",
      content: contactInfo.email || "yenegeevents@gmail.com",
      link: `mailto:${contactInfo.email || "yenegeevents@gmail.com"}`,
    },
    {
      num: "03",
      icon: <FaPhone />,
      title: "Call Us",
      content: contactInfo.phoneFormatted || contactInfo.phone || "+251 978 639 887",
      link: `tel:${contactInfo.phone?.replace(/\D/g, '') || '251978639887'}`,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .yg-font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .yg-font-sans  { font-family: 'Manrope', system-ui, sans-serif; }

        .yg-contact-input {
          width: 100%;
          padding: 16px 24px;
          background: ${BRAND.cream};
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 16px;
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          color: ${BRAND.navy};
          transition: all 0.3s;
        }
        .yg-contact-input:focus {
          outline: none;
          background: #fff;
          border-color: ${BRAND.coral};
          box-shadow: 0 0 0 4px rgba(255,111,94,0.1);
        }

        .yg-btn-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 20px;
          border-radius: 16px;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 12px 30px rgba(37,211,102,0.25);
        }
        .yg-btn-submit:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow: 0 20px 40px rgba(37,211,102,0.35);
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
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
        }
        .yg-social-btn:hover {
          transform: translateY(-4px) scale(1.1);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .yg-grid-mobile { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section style={{ padding: "180px 0 80px", background: BRAND.white }}>
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: "800px" }}>
            <SectionLabel>Get in Touch</SectionLabel>
            <h1
              className="yg-font-serif"
              style={{
                fontSize: "clamp(52px, 8vw, 92px)",
                fontWeight: 900,
                color: BRAND.navy,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                marginBottom: "32px",
              }}
            >
              Let's Build Your <br />
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                Next Story.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── Contact Section ─────────────────────────────────────────────── */}
      <section style={{ padding: "40px 0 140px", background: BRAND.white }}>
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div className="yg-grid-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "100px", alignItems: "start" }}>
            
            {/* Left Column: Info */}
            <div>
              <p className="yg-font-sans" style={{ fontSize: "20px", color: BRAND.gray600, lineHeight: 1.6, marginBottom: "64px" }}>
                Ready to revolutionize your events? Whether you're an organizer, partner, or student, our team is here to help you scale and succeed.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                {contactInfoItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "24px", alignItems: "start" }}>
                    <div style={{ position: "relative" }}>
                       <span style={{ fontSize: "64px", fontWeight: 900, color: "rgba(15,23,42,0.04)", position: "absolute", top: "-24px", left: "-16px", zIndex: 0 }}>{item.num}</span>
                       <div style={{ position: "relative", zIndex: 1, color: BRAND.coral, fontSize: "24px", marginTop: "12px" }}>{item.icon}</div>
                    </div>
                    <div>
                       <h3 className="yg-font-serif" style={{ fontSize: "20px", fontWeight: 800, color: BRAND.navy, marginBottom: "8px" }}>{item.title}</h3>
                       {item.link ? (
                         <a href={item.link} className="yg-font-sans" style={{ fontSize: "17px", color: BRAND.gray500, textDecoration: "none" }}>{item.content}</a>
                       ) : (
                         <p className="yg-font-sans" style={{ fontSize: "17px", color: BRAND.gray500 }}>{item.content}</p>
                       )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "80px" }}>
                <h3 className="yg-font-serif" style={{ fontSize: "20px", fontWeight: 800, color: BRAND.navy, marginBottom: "24px" }}>Follow Our Journey</h3>
                <div style={{ display: "flex", gap: "16px" }}>
                  {[
                    { icon: <FaInstagram />, href: "https://instagram.com/yenege_event", bg: "linear-gradient(135deg, #E4405F 0%, #833AB4 100%)" },
                    { icon: <FaTelegram />, href: "https://t.me/yenegeevents", bg: "linear-gradient(135deg, #0088cc 0%, #006699 100%)" },
                    { icon: <FaTiktok />, href: "https://tiktok.com/@yenegeevents", bg: "linear-gradient(135deg, #000000 0%, #333333 100%)" },
                    { icon: <FaYoutube />, href: "https://youtube.com/@yenegeevents", bg: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)" },
                  ].map((social, i) => (
                    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="yg-social-btn" style={{ background: social.bg }}>
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div style={{ background: BRAND.white, borderRadius: "40px", border: "1px solid rgba(0,0,0,0.06)", padding: "60px", boxShadow: "0 40px 100px -20px rgba(15,23,42,0.1)" }}>
               <h2 className="yg-font-serif" style={{ fontSize: "32px", fontWeight: 900, marginBottom: "40px", color: BRAND.navy }}>Send a Message</h2>
               
               {submitStatus === "success" && (
                 <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(37,211,102,0.1)", color: "#128C7E", marginBottom: "32px", fontSize: "14px", fontWeight: 600 }}>
                   Opening WhatsApp... If it didn't open, please check your browser settings.
                 </div>
               )}

               <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="yg-grid-mobile">
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gray500, marginBottom: "10px" }}>Full Name *</label>
                      <input type="text" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} className="yg-contact-input" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gray500, marginBottom: "10px" }}>Email Address *</label>
                      <input type="email" name="email" required placeholder="john@example.com" value={formData.email} onChange={handleChange} className="yg-contact-input" />
                    </div>
                 </div>
                 
                 <div>
                   <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gray500, marginBottom: "10px" }}>Phone Number</label>
                   <input type="tel" name="phone" placeholder="+251 9XX XXX XXX" value={formData.phone} onChange={handleChange} className="yg-contact-input" />
                 </div>

                 <div>
                   <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gray500, marginBottom: "10px" }}>How can we help? *</label>
                   <textarea name="message" required rows={5} placeholder="Tell us about your next project or goal..." value={formData.message} onChange={handleChange} className="yg-contact-input" style={{ resize: "none" }} />
                 </div>

                 <button type="submit" disabled={isSubmitting} className="yg-btn-submit">
                   {isSubmitting ? "Processing..." : <><FaWhatsapp size={18} /> Send via WhatsApp</>}
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


