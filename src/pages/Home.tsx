import { useEffect, useMemo } from "react";
import {
    FaArrowRight,
    FaCalendarAlt,
    FaChartLine,
    FaCheckCircle,
    FaClipboardList,
    FaGraduationCap,
    FaRocket,
    FaStar,
    FaUsers,
    FaWhatsapp
} from "react-icons/fa";
import { Link } from "react-router-dom";
import EventSlider from "../Components/EventSlider";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useLanguage } from "../contexts/LanguageContext";
import { useContactInfo, useEvents, useHomeContent } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { BRAND, GRADIENT } from "../styles/theme";
import { optimizeImageUrl } from "../utils/imageOptimizer";
import { handleLinkHover } from "../utils/prefetch";

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/* ─── Shared design tokens ─────────────────────────────────────────────────── */

/* ─── Sub-components ────────────────────────────────────────────────────────── */

/** Decorative section label pill */
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
      style={{
        background: GRADIENT.brand,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      {children}
    </span>
  </div>
);



/** Modern stat item for trust section */
const StatBadge = ({
  value,
  label,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) => (
  <div className="yg-stat-badge">
    <span className="yg-stat-value">
      {value}
    </span>
    <span className="yg-stat-label">
      {label}
    </span>
  </div>
);

/* ─── Main Component ────────────────────────────────────────────────────────── */
const Home = () => {
  useScrollReveal();
  const { t, language } = useLanguage();
  const { content: homeContent } = useHomeContent();
  const { events: initialFeatured, isLoading: loadingFeatured } = useEvents({ featured: true, limit: 3 });
  const { events: recentEvents, isLoading: loadingRecent } = useEvents({ limit: 6 });
  const featuredEvents = initialFeatured.length > 0 ? initialFeatured : recentEvents;
  const isLoadingEvents = loadingFeatured && loadingRecent;
  const { contactInfo } = useContactInfo();

  useEffect(() => {
    document.title = "YENEGE | Professional Event Production & Academy Addis Ababa";
  }, []);

  const optimizedBgImages = useMemo(
    () => ({
      dubai: optimizeImageUrl(
        "https://cdn.pixabay.com/photo/2021/11/26/17/26/dubai-desert-safari-6826298_1280.jpg",
        { width: 1920, quality: 55, format: "auto" }
      ),
      maldives: optimizeImageUrl(
        "https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg",
        { width: 1920, quality: 55, format: "auto" }
      ),
      dolomites: optimizeImageUrl(
        "https://cdn.pixabay.com/photo/2020/03/29/09/24/pale-di-san-martino-4979964_1280.jpg",
        { width: 1920, quality: 55, format: "auto" }
      ),
    }),
    []
  );

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream }}>
      {/* ── Global Style Injections ────────────────────────────────────────── */}
      <style>{`
        .yg-font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .yg-font-sans  { font-family: 'Manrope', system-ui, sans-serif; }

        /* Creative Grain Filter */
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
          color: rgba(255, 212, 71, 0.2);
          text-transform: uppercase;
          pointer-events: none;
          z-index: 10;
          white-space: nowrap;
        }

        @media (min-width: 1025px) {
          .yg-creative-card { transform: none !important; }
        }

        @media (max-width: 1024px) {
          .sidebrand { display: none; }
        }

        @media (max-width: 768px) {
          .yg-creative-card { transform: none !important; }
          .yg-creative-header { flex-direction: column; margin-bottom: 60px !important; }
        }

        /* Service cards */
        .yg-service-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 24px;
          padding: 36px 32px;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.35s cubic-bezier(0.16,1,0.3,1),
                      border-color 0.35s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .yg-service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px -12px rgba(15,23,42,0.14);
          border-color: rgba(228,232,33,0.4);
        }
        .yg-service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(228,232,33,0.04) 0%, rgba(255,111,94,0.04) 100%);
          opacity: 0;
          transition: opacity 0.35s;
          border-radius: inherit;
        }
        .yg-service-card:hover::before { opacity: 1; }

        /* Event cards */
        .yg-event-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 28px;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.4s cubic-bezier(0.16,1,0.3,1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .yg-event-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 80px -16px rgba(15,23,42,0.16);
        }
        .yg-event-card .yg-img-wrap img {
          transition: transform 2s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .yg-event-card:hover .yg-img-wrap img {
          transform: scale(1.06);
        }

        /* Primary CTA button */
        .yg-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          background: linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%);
          color: #0F172A;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s, filter 0.25s;
          box-shadow: 0 8px 30px rgba(255,111,94,0.3);
        }
        .yg-btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          filter: brightness(1.05);
          box-shadow: 0 16px 40px rgba(255,111,94,0.4);
        }
        .yg-btn-primary:active { transform: scale(0.97); }

        /* Ghost/outline CTA */
        .yg-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          background: transparent;
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.3);
          cursor: pointer;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
        }
        .yg-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.6);
          transform: translateY(-2px);
        }

        /* WhatsApp button */
        .yg-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 8px 30px rgba(37,211,102,0.25);
        }
        .yg-btn-whatsapp:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 16px 40px rgba(37,211,102,0.35);
        }

        /* Section divider wave */
        @keyframes yg-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .yg-float { animation: yg-float 4s ease-in-out infinite; }

        /* CTA section rotate */
        @keyframes yg-cta-rotate {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Shine shimmer */
        @keyframes yg-shine {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        .yg-shine {
          position: relative;
          overflow: hidden;
        }
        .yg-shine::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: yg-shine 3.5s infinite;
          pointer-events: none;
        }

        /* Responsive grid helpers */
        @media (max-width: 1024px) {
          .yg-academy-grid { flex-direction: column !important; }
          .yg-academy-img  { max-width: 480px; margin: 0 auto; }
        }

        .yg-stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .yg-stat-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 48px;
        }
        .yg-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        .yg-stat-label {
          font-family: 'Manrope', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-top: 4px;
        }
        .yg-stat-divider {
          width: 1px;
          height: 56px;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .yg-stats-row { 
            flex-wrap: nowrap; 
            gap: 0 !important; 
            justify-content: space-evenly;
            width: 100%;
          }
          .yg-stat-badge {
            padding: 0 8px;
            min-width: 0;
            flex: 1;
            text-align: center;
          }
          .yg-stat-value {
            font-size: 28px !important;
          }
          .yg-stat-label {
            font-size: 8px !important;
            letter-spacing: 0.1em;
            white-space: nowrap;
          }
          .yg-stat-divider {
            display: block;
            height: 32px;
            align-self: center;
          }
          .yg-grid-mobile { grid-template-columns: 1fr !important; gap: 48px !important; }
          .yg-grid-mobile > div { align-items: center; text-align: center; }
          .yg-grid-mobile p { margin-left: auto; margin-right: auto; }
          .yg-grid-mobile > div > div:last-child[style*="display: flex"] { justify-content: center; }
          .yg-event-grid { grid-template-columns: 1fr !important; }
          .yg-service-grid { grid-template-columns: 1fr !important; }
          .yg-community-grid { grid-template-columns: 1fr !important; }
          .yg-community-images { display: none !important; }
        }

        @media (max-width: 480px) {
          .yg-stats-container {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          .yg-stat-badge {
            padding: 0 4px;
          }
        }
      `}</style>

      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. ልዩ ስልጠና — Academy Spotlight ─────────────────────────────────────── */}
      <section
        aria-label="ልዩ ስልጠና - Special Training Academy"
        style={{
          background: BRAND.navy,
          position: "relative",
          overflow: "hidden",
          padding: "0",
        }}
      >
        {/* Top gradient border */}
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FFD447, #FF6F5E, transparent)" }} />

        {/* Deep ambient glow */}
        <div aria-hidden="true" style={{ position: "absolute", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(255,212,71,0.06) 0%, transparent 65%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,111,94,0.05) 0%, transparent 65%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

        {/* Giant watermark */}
        <div aria-hidden="true" style={{ position: "absolute", top: "50%", right: "-5%", transform: "translateY(-50%)", fontSize: "clamp(120px, 20vw, 260px)", fontWeight: 900, fontFamily: "'Playfair Display', serif", color: "rgba(255,212,71,0.025)", lineHeight: 1, pointerEvents: "none", zIndex: 0, userSelect: "none", letterSpacing: "-0.05em" }}>
          ACADEMY
        </div>

        <div className="reveal-wrapper" style={{ maxWidth: "1300px", margin: "0 auto", padding: "100px 40px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="yg-grid-mobile">

            {/* LEFT: Editorial Text Block */}
            <div>
              {/* Label pill */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,212,71,0.08)", border: "1px solid rgba(255,212,71,0.25)", borderRadius: "999px", padding: "6px 16px", marginBottom: "28px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFD447", boxShadow: "0 0 8px #FFD447" }} />
                <span style={{ color: "#FFD447", fontFamily: "'Manrope', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "0.35em", textTransform: "uppercase" }}>ልዩ ስልጠና · Special Training</span>
              </div>

              <h2 className="yg-font-serif" style={{ fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: 900, color: "#fff", lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: "28px" }}>
                Learn the Art of<br />
                <span style={{ fontStyle: "italic", background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Event Architecture.</span>
              </h2>

              <p className="yg-font-sans" style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: "480px", marginBottom: "40px" }}>
                East Africa's most comprehensive event training program. From logistics to execution — we build the next generation of professional event architects.
              </p>

              {/* Feature pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "44px" }}>
                {["Professional Certification", "Hands-on Masterclasses", "Real-world Projects", "Industry Mentors"].map((feat) => (
                  <span key={feat} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", padding: "7px 16px", fontFamily: "'Manrope', sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>
                    <FaCheckCircle size={10} style={{ color: "#FFD447" }} /> {feat}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link to="/masterclass-registration" className="yg-btn-primary yg-shine" style={{ gap: "10px" }}>
                  Enroll Now <FaGraduationCap size={15} />
                </Link>
                <Link to="/events" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "999px", border: "1.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.25s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,212,71,0.5)"; (e.currentTarget as HTMLAnchorElement).style.color = "#FFD447"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)"; }}
                >
                  View Programs <FaArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* RIGHT: Stats + Info Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Top stat row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { val: "15k+", label: "Community Members", icon: <FaUsers size={18} /> },
                  { val: "4.9★", label: "Student Rating", icon: <FaStar size={18} /> },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "28px 24px", backdropFilter: "blur(12px)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "-10px", right: "-10px", fontSize: "60px", opacity: 0.03, color: "#FFD447", fontFamily: "'Playfair Display', serif", fontWeight: 900, lineHeight: 1 }}>{s.val.replace(/[^0-9k+★]/g, '')}</div>
                    <div style={{ color: "#FFD447", marginBottom: "12px" }}>{s.icon}</div>
                    <div className="yg-font-serif" style={{ fontSize: "36px", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "6px" }}>{s.val}</div>
                    <div className="yg-font-sans" style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.18em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Academy highlight card */}
              <div style={{ background: "linear-gradient(135deg, rgba(255,212,71,0.08) 0%, rgba(255,111,94,0.06) 100%)", border: "1px solid rgba(255,212,71,0.2)", borderRadius: "28px", padding: "36px 32px", backdropFilter: "blur(16px)", position: "relative", overflow: "hidden" }}>
                {/* Decorative corner accent */}
                <div style={{ position: "absolute", top: 0, right: 0, width: "120px", height: "120px", background: "radial-gradient(circle at top right, rgba(255,212,71,0.15) 0%, transparent 65%)", borderRadius: "0 28px 0 0" }} />
                <div style={{ color: "#FFD447", marginBottom: "16px" }}><FaGraduationCap size={28} /></div>
                <h3 className="yg-font-serif" style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>
                  Learn Event<br /><span style={{ color: "#FFD447", fontStyle: "italic" }}>Like a Pro.</span>
                </h3>
                <p className="yg-font-sans" style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "20px" }}>
                  Our structured curriculum covers event design, vendor coordination, financial strategy, and live execution — from day one.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex" }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #0F172A", background: `hsl(${i * 40}, 70%, 60%)`, marginLeft: i > 1 ? "-8px" : "0", zIndex: 6 - i }} />
                    ))}
                  </div>
                  <span className="yg-font-sans" style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>Join 15,000+ students learning events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Event Slider Display ──────────────────────────────────────────────── */}
      <EventSlider events={recentEvents} />

      {/* ── 2.5 The Yenege Distinction ───────────────────────────────────────── */}
      <section
        style={{
          padding: "120px 0",
          background: BRAND.navy,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <SectionLabel>The Yenege Distinction</SectionLabel>
            <h2 className="yg-font-serif" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, color: "#fff", marginBottom: "24px" }}>
              Why Leading Brands <span style={{ fontStyle: "italic", color: BRAND.gold }}>Trust Us.</span>
            </h2>
          </div>

          <div 
            className="yg-grid-mobile" 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "32px" 
            }}
          >
            {[
              {
                title: "Architectural Precision",
                desc: "We don't just organize; we design experience systems that ensure every detail is intentional and every moment is impactful.",
                icon: <FaRocket />
              },
              {
                title: "Educational Core",
                desc: "As home to East Africa's leading Event Academy, our team stays at the absolute forefront of industry innovation and trends.",
                icon: <FaGraduationCap />
              },
              {
                title: "Verified Footprint",
                desc: "With thousands of successful events and a community that spans the globe, our track record is our strongest seal of quality.",
                icon: <FaCheckCircle />
              }
            ].map((item, i) => (
              <div 
                key={i}
                style={{
                  padding: "48px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "32px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.4s ease"
                }}
              >
                <div style={{ color: BRAND.gold, fontSize: "32px", marginBottom: "24px" }}>{item.icon}</div>
                <h3 className="yg-font-serif" style={{ fontSize: "24px", color: "#fff", marginBottom: "16px", fontWeight: 700 }}>{item.title}</h3>
                <p className="yg-font-sans" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontSize: "16px" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. What We Do ────────────────────────────────────────────────────── */}


      {/* ── 6. Academy ───────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="academy-heading"
        style={{
          padding: "120px 0",
          backgroundImage: "url('/academy-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient Overlay for Readability */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 50%, rgba(15,23,42,0) 100%)",
          }}
        />

        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
          <div style={{ maxWidth: "600px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 18px",
                borderRadius: "999px",
                background: "rgba(228,232,33,0.15)",
                border: "1px solid rgba(228,232,33,0.3)",
                backdropFilter: "blur(4px)",
                marginBottom: "28px",
              }}
            >
              <FaGraduationCap
                style={{ color: BRAND.gold, fontSize: "14px" }}
              />
              <span
                className="yg-font-sans"
                style={{
                  color: BRAND.gold,
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {t.academy.title}
              </span>
            </div>

            <h2
              id="academy-heading"
              className="yg-font-serif"
              style={{
                fontSize: "clamp(44px, 6vw, 72px)",
                fontWeight: 900,
                color: BRAND.white,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                marginBottom: "24px",
                textShadow: "0 4px 24px rgba(0,0,0,0.4)"
              }}
            >
              {t.academy.masterPlanning.split(' ').slice(0, 2).join(' ')}{" "}
              <span
                style={{
                  fontStyle: "italic",
                  color: BRAND.coral,
                }}
              >
                {t.academy.masterPlanning.split(' ').slice(2).join(' ')}.
              </span>
            </h2>

            <p
              className="yg-font-sans"
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.75,
                marginBottom: "40px",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)"
              }}
            >
              {t.academy.joinProgram}
            </p>

            {/* Key features list */}
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 44px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {[
                t.academy.feature8weeks,
                t.academy.featureRealPlanning,
                t.academy.featureCert,
              ].map((item) => (
                <li
                  key={item}
                  className="yg-font-sans"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    color: BRAND.white,
                    fontSize: "16px",
                    fontWeight: 500,
                    textShadow: "0 2px 8px rgba(0,0,0,0.6)"
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: GRADIENT.brand,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(255,111,94,0.4)"
                    }}
                  >
                    <span
                      style={{
                        color: BRAND.navy,
                        fontSize: "12px",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <Link
                to="/masterclass"
                className="yg-btn-primary yg-shine"
                aria-label="Join the Masterclass program"
              >
                Join Masterclass <FaArrowRight size={12} />
              </Link>
              <span
                className="yg-font-sans"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
              >
                {t.academy.nextCohort}
              </span>
            </div>
          </div>
        </div>
      </section>



      {/* ── 7.5 Event Strategy & Feasibility Section ─────────── */}
      <section
        aria-labelledby="strategy-heading"
        style={{
          padding: "100px 0",
          background: BRAND.cream,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
           <div 
             style={{ 
               background: BRAND.white, 
               borderRadius: "48px", 
               padding: "64px 40px",
               boxShadow: "0 32px 80px -16px rgba(15,23,42,0.08)",
               border: "1px solid rgba(15,23,42,0.03)",
               position: "relative",
               overflow: "hidden"
             }}
             className="flex flex-col lg:flex-row items-center gap-16"
           >
             {/* Gradient Accent */}
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: GRADIENT.brand }} />
                          <div className="flex-1 text-center lg:text-left" style={{ position: 'relative', zIndex: 2 }}>
               <SectionLabel>{t.strategy.title}</SectionLabel>
               <h2 
                 id="strategy-heading"
                 className="yg-font-serif"
                 style={{ 
                   fontSize: "clamp(32px, 5vw, 48px)", 
                   fontWeight: 900, 
                   color: BRAND.navy, 
                   marginBottom: "24px", 
                   lineHeight: 1.1
                 }}
               >
                 {t.strategy.isFeasible.split(' ').slice(0, -1).join(' ')} <br/>
                 <span style={{ color: BRAND.coral }}>{t.strategy.isFeasible.split(' ').slice(-1)}</span>
               </h2>
               <p 
                 className="yg-font-sans"
                 style={{ 
                   fontSize: "17px", 
                   color: BRAND.gray500, 
                   marginBottom: "40px", 
                   maxWidth: "540px", 
                   lineHeight: 1.6 
                 }}
               >
                 {t.strategy.beforeInvest}
               </p>
               <Link 
                 to="/feasibility-form" 
                 className="yg-btn-primary yg-shine"
                 style={{ textDecoration: 'none' }}
               >
                 {t.strategy.consult} <FaArrowRight size={12} />
               </Link>
             </div>
             
             <div className="flex-1 w-full lg:w-auto" style={{ position: 'relative' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4">
                    <div style={{ height: "140px", background: "rgba(15,23,42,0.03)", borderRadius: "24px" }} />
                    <div style={{ height: "240px", background: BRAND.navy, borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       <FaChartLine className="text-[#FFD447]" size={48} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4" style={{ paddingTop: "48px" }}>
                    <div style={{ height: "240px", background: "#FFD447", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       <FaClipboardList className="text-[#0F172A]" size={48} />
                    </div>
                    <div style={{ height: "140px", background: "rgba(15,23,42,0.03)", borderRadius: "24px" }} />
                  </div>
                </div>
                
                {/* Decorative floating stats */}
                <div style={{ position: 'absolute', top: '10%', right: '-5%', background: '#fff', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #eee', fontWeight: 800, fontSize: '12px', color: BRAND.navy }} className="yg-float">
                  {t.strategy.roiFocus}
                </div>
                <div style={{ position: 'absolute', bottom: '15%', left: '-5%', background: BRAND.coral, padding: '12px 20px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(255,111,94,0.2)', fontWeight: 800, fontSize: '12px', color: '#fff' }} className="yg-float">
                  {t.strategy.marketAnalysis}
                </div>
             </div>
           </div>
        </div>
      </section>


      {/* ── 8. Gallery ───────────────────────────────────────────────────────── */}
      <Gallery />

      {/* ── 9. Final CTA ─────────────────────────────────────────────────────── */}
      <section
        aria-label="Call to action"
        style={{
          position: "relative",
          padding: "120px 0",
          overflow: "hidden",
          minHeight: "480px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Rotating photo backgrounds */}
        {[
          { url: optimizedBgImages.dubai, clip: "none", delay: "0s" },
          { url: optimizedBgImages.maldives, clip: "circle(28%)", delay: "0.15s" },
          { url: optimizedBgImages.dolomites, clip: "circle(14%)", delay: "0.3s" },
        ].map((bg, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "200vw",
              height: "200vw",
              backgroundImage: `url(${bg.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.55)",
              clipPath: bg.clip,
              animation: `yg-cta-rotate 22s linear infinite`,
              animationDelay: bg.delay,
              willChange: "transform",
            }}
          />
        ))}

        {/* Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(15,23,42,0.6) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "720px",
            margin: "0 auto",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          <SectionLabel>
            <span style={{ color: "rgba(228,232,33,0.9)" }}>
              {t.cta.readyBegin}
            </span>
          </SectionLabel>

          <h2
            className="yg-font-serif"
            style={{
              fontSize: "clamp(36px, 6vw, 60px)",
              fontWeight: 900,
              color: BRAND.white,
              margin: "0 0 20px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            {t.cta.readyJoin}
          </h2>

          <p
            className="yg-font-sans"
            style={{
              fontSize: "17px",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7,
              marginBottom: "48px",
              textShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            {t.cta.bePartOf}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            {homeContent?.cta?.buttons && homeContent.cta.buttons.length > 0 ? (
              homeContent.cta.buttons.map((button, index) =>
                button.type === "primary" ? (
                  <Link
                    key={index}
                    to={button.link}
                    className="yg-btn-primary"
                    onMouseEnter={() => handleLinkHover(button.link)}
                  >
                    {button.text} <FaArrowRight size={12} />
                  </Link>
                ) : (
                  <a
                    key={index}
                    href={button.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="yg-btn-whatsapp"
                  >
                    <FaWhatsapp size={16} />
                    {button.text}
                  </a>
                )
              )
            ) : (
              <>
                <Link
                  to="/events"
                  className="yg-btn-primary yg-shine"
                  onMouseEnter={() => handleLinkHover("/events")}
                  aria-label="Explore upcoming events"
                >
                  Explore Events <FaArrowRight size={12} />
                </Link>
                <Link
                  to="/apply"
                  aria-label="Enroll in Yenege Event Academy"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "16px 36px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, rgba(255,212,71,0.12) 0%, rgba(255,111,94,0.08) 100%)",
                    border: "1.5px solid rgba(255,212,71,0.35)",
                    color: "#FFD447",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 800,
                    fontSize: "13px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: "0 0 30px rgba(255,212,71,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    handleLinkHover("/apply");
                    (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(255,212,71,0.22) 0%, rgba(255,111,94,0.14) 100%)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,212,71,0.7)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 40px rgba(255,212,71,0.2)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "linear-gradient(135deg, rgba(255,212,71,0.12) 0%, rgba(255,111,94,0.08) 100%)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,212,71,0.35)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 30px rgba(255,212,71,0.08)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  <FaGraduationCap size={16} />
                  Learn Event
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
