import { useMemo } from "react";
import {
    FaArrowRight,
    FaCalendarAlt,
    FaGraduationCap,
    FaMapMarkerAlt,
    FaStar,
    FaUsers,
    FaWhatsapp
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import OptimizedImage from "../Components/ui/OptimizedImage";
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
  const { content: homeContent } = useHomeContent();
  const { events: initialFeatured } = useEvents({ featured: true, limit: 3 });
  const { events: recentEvents } = useEvents({ limit: 3 });
  const featuredEvents = initialFeatured.length > 0 ? initialFeatured : recentEvents;
  const { contactInfo } = useContactInfo();

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

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

      {/* ── 2. Social Proof ─────────────────────────────────────────────────── */}
      <section
        aria-label="Our community by the numbers"
        style={{
          background: BRAND.navy,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top gradient border */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, #FFD447, #FF6F5E, transparent)",
          }}
        />
        {/* Bottom gradient border */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />

        <div
          className="reveal-wrapper yg-stats-container"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "56px 24px",
          }}
        >
          <div className="yg-stats-row">
            <StatBadge value="99%" label="Happy Members" icon={<FaUsers />} />
            {/* Divider */}
            <div className="yg-stat-divider" />
            <StatBadge value="4.9★" label="Average Rating" icon={<FaStar />} />
            {/* Divider */}
            <div className="yg-stat-divider" />
            <StatBadge value="12+" label="Destinations" icon={<FaMapMarkerAlt />} />
          </div>
        </div>
      </section>

      {/* ── 3. What We Do ────────────────────────────────────────────────────── */}
      {/* ── 4. Event Categories (service category cards) ─────────────────────── */}
      <section
        aria-labelledby="services-heading"
        style={{
          padding: "100px 0",
          background: BRAND.white,
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "480px",
            height: "480px",
            background:
              "radial-gradient(circle, rgba(228,232,33,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="reveal-wrapper"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <SectionLabel>The Portfolio</SectionLabel>
            <h2
              id="services-heading"
              className="yg-font-serif"
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 900,
                color: BRAND.navy,
                margin: "0 0 16px",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Selected Destinations,{" "}
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                Exclusive Moments
              </span>
            </h2>
            <p
              className="yg-font-sans"
              style={{
                fontSize: "17px",
                color: BRAND.gray500,
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Bespoke travels and curated moments designed for the discerning explorer. 
              Discover the soul of Ethiopia through our exclusive collection.
            </p>
          </div>

          {/* Service cards */}
          <div
            className="yg-service-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "40px",
            }}
          >
            {homeContent?.categories && homeContent.categories.length > 0 ? (
              homeContent.categories
                .map((category, index) => (
                <Link
                  key={category.id || index}
                  to={category.link}
                  className="yg-service-card group"
                  onMouseEnter={() => handleLinkHover(category.link)}
                  style={{ 
                    textDecoration: "none",
                    position: "relative",
                    display: "block",
                    padding: "48px",
                    background: BRAND.cream,
                    borderRadius: "24px",
                    border: "1px solid rgba(15,23,42,0.05)",
                    overflow: "hidden",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  aria-label={`Learn more about ${category.title}`}
                >
                  <div
                    className="yg-font-sans"
                    style={{
                      position: "absolute",
                      top: "24px",
                      right: "32px",
                      fontSize: "80px",
                      fontWeight: 900,
                      color: "rgba(15,23,42,0.03)",
                      lineHeight: 1,
                      pointerEvents: "none",
                      transition: "color 0.5s ease"
                    }}
                  >
                    {category.number || `0${index + 1}`}
                  </div>
                  
                  <div
                    style={{
                      width: "48px",
                      height: "4px",
                      background: GRADIENT.brand,
                      borderRadius: "2px",
                      marginBottom: "32px",
                      transition: "width 0.4s ease"
                    }}
                    className="group-hover:w-16"
                  />

                  <h3
                    className="yg-font-serif"
                    style={{
                      fontSize: "32px",
                      fontWeight: 800,
                      color: BRAND.navy,
                      marginBottom: "16px",
                    }}
                  >
                    {category.title}
                  </h3>
                  <p
                    className="yg-font-sans"
                    style={{
                      fontSize: "17px",
                      color: BRAND.gray500,
                      lineHeight: 1.7,
                      marginBottom: "40px",
                      maxWidth: "85%",
                    }}
                  >
                    {category.description}
                  </p>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      color: BRAND.coral,
                      fontWeight: 700,
                      fontSize: "13px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      transition: "gap 0.3s ease"
                    }}
                    className="group-hover:gap-4"
                  >
                    Discover <FaArrowRight size={12} />
                  </div>
                </Link>
              ))
            ) : (
              /* Fallback: hardcoded services */
              <>
                {[
                  {
                    number: "01",
                    title: "Travel",
                    desc: "Explore breathtaking destinations across Ethiopia and beyond. From desert safaris to mountain escapes.",
                    link: "/events?category=travel",
                  },
                ].map((s, i) => (
                  <Link
                    key={i}
                    to={s.link}
                    className="yg-service-card group"
                    onMouseEnter={() => handleLinkHover(s.link)}
                    style={{ 
                      textDecoration: "none",
                      position: "relative",
                      display: "block",
                      padding: "48px",
                      background: BRAND.cream,
                      borderRadius: "24px",
                      border: "1px solid rgba(15,23,42,0.05)",
                      overflow: "hidden",
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                    aria-label={`Learn more about ${s.title}`}
                  >
                    <div
                      className="yg-font-sans"
                      style={{
                        position: "absolute",
                        top: "24px",
                        right: "32px",
                        fontSize: "80px",
                        fontWeight: 900,
                        color: "rgba(15,23,42,0.03)",
                        lineHeight: 1,
                        pointerEvents: "none",
                        transition: "color 0.5s ease"
                      }}
                    >
                      {s.number}
                    </div>

                    <div
                      style={{
                        width: "48px",
                        height: "4px",
                        background: GRADIENT.brand,
                        borderRadius: "2px",
                        marginBottom: "32px",
                        transition: "width 0.4s ease"
                      }}
                      className="group-hover:w-16"
                    />

                    <h3
                      className="yg-font-serif"
                      style={{
                        fontSize: "32px",
                        fontWeight: 800,
                        color: BRAND.navy,
                        marginBottom: "16px",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="yg-font-sans"
                      style={{
                        fontSize: "17px",
                        color: BRAND.gray500,
                        lineHeight: 1.7,
                        marginBottom: "40px",
                        maxWidth: "85%",
                      }}
                    >
                      {s.desc}
                    </p>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        color: BRAND.coral,
                        fontWeight: 700,
                        fontSize: "13px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        transition: "gap 0.3s ease"
                      }}
                      className="group-hover:gap-4"
                    >
                      Discover <FaArrowRight size={12} />
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. Featured Events ────────────────────────────────────────────────── */}
      <section
        aria-labelledby="experiences-heading"
        style={{ 
          padding: "160px 0", 
          background: BRAND.primary, 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        {/* Creative Layer 1: Massive Background Watermark */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            fontSize: 'max(20vw, 300px)',
            fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            color: 'rgba(255, 212, 71, 0.03)', // Extremely subtle gold
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none'
          }}
        >
          CURATED
        </div>

        {/* Creative Layer 2: Grain Overlay for Print Feel */}
        <div className="noise-bk" />

        {/* Vertical Sidebrand */}
        <div className="sidebrand">YENEGE CURATION Portfolio 2024</div>

        {/* Creative Layer 3: Dynamic Glows */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,111,94,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(228,232,33,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />

        <div className="reveal-wrapper" style={{ maxWidth: "1500px", margin: "0 auto", padding: "0 40px", position: 'relative', zIndex: 2 }}>
          {/* Creative Header: Asymmetrical & Bold */}
          <div
            className="yg-creative-header flex flex-col lg:flex-row lg:items-end justify-between w-full mb-16 md:mb-32"
          >
            <div className="max-w-2xl">
              <SectionLabel>Available Experiences</SectionLabel>
              <h2 className="yg-font-serif text-white text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mt-8">
                The <span className="italic" style={{ color: BRAND.gold }}>Curation</span> <br />
                <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.6em] text-white/30 block mt-6">Selected Portfolio 2024</span>
              </h2>
            </div>
            
            <div className="hidden lg:block pb-4 text-right border-r-2 border-[#FFD447]/20 pr-8">
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.3em] max-w-[250px] leading-relaxed">
                  Exclusive events and <br />
                  bespoke moments designed <br />
                  for the discerning soul.
                </p>
            </div>
          </div>


          {/* Event cards grid */}
          {featuredEvents.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 w-full"
            >
              {featuredEvents.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="yg-event-card yg-creative-card group"
                  style={{ 
                    textDecoration: "none", 
                    borderRadius: '48px', 
                    overflow: 'hidden', 
                    position: 'relative', 
                    display: 'block',
                    zIndex: index === 1 ? 10 : 1
                  }}
                  aria-label={`View details for ${event.title}`}
                >
                  {/* Floating Number Branding */}
                  <div className="absolute top-10 left-10 z-20 pointer-events-none">
                     <span className="text-[120px] font-black text-white/5 leading-none select-none">0{index + 1}</span>
                  </div>

                  <div className="relative aspect-[4/5] overflow-hidden">

                    {event.image ? (
                      <OptimizedImage
                        src={event.image}
                        alt={event.title}
                        width={800}
                        height={1000}
                        className="card-img w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.16,1,0.3,1)"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0F172A] flex items-center justify-center">
                        <FaCalendarAlt size={40} className="text-[#FFD447]/20" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-black/20" />
                    
                    {/* Vertical Date Branding */}
                    <div className="absolute right-6 top-10 flex flex-col items-center gap-6">
                       <div className="w-px h-12 bg-white/20" />
                       <span className="vertical-date text-[9px] font-black uppercase tracking-[0.4em] text-white/40" style={{ writingMode: 'vertical-rl' }}>
                         {formatDateShort(event.date)}
                       </span>
                    </div>

                    {/* Content Over the Image */}
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start">
                       <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/10 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest">{event.category}</span>
                          <span className="h-1 w-1 bg-[#FFD447] rounded-full" />
                          <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em]">{event.location}</span>
                       </div>
                       
                       <h3 className="yg-font-serif text-2xl font-black text-white leading-[1.1] mb-8 group-hover:text-[#FFD447] transition-colors">
                         {event.title}
                       </h3>

                       <div className="flex items-center justify-between w-full">
                         <div className="bg-[#0F172A] text-[#FFD447] py-2 px-4 rounded-xl text-sm font-serif italic font-black shadow-lg">
                           {event.price === "Free" ? "Gratis" : `${event.price} ${event.currency}`}
                         </div>
                         
                         <div className="arrow-circle w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white transition-all duration-500 group-hover:bg-[#0F172A] group-hover:text-[#FFD447] group-hover:rotate-[-45deg]">
                           <FaArrowRight size={12} />
                         </div>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div
               style={{
                 textAlign: "center",
                 padding: "100px 24px",
                 background: "rgba(255,255,255,0.03)",
                 borderRadius: "40px",
                 border: "1px dashed rgba(255,212,71,0.2)",
                 backdropFilter: 'blur(10px)'
               }}
             >
               <h3
                 className="yg-font-serif"
                 style={{
                   fontSize: "28px",
                   fontWeight: 900,
                   color: BRAND.white,
                   marginBottom: "16px",
                 }}
               >
                 No upcoming experiences right now
               </h3>
               <p
                 className="yg-font-sans"
                 style={{
                   color: "rgba(255,255,255,0.5)",
                   fontSize: "17px",
                   marginBottom: "40px",
                   maxWidth: "400px",
                   margin: "0 auto 40px"
                 }}
               >
                 We're curating something special. Check back later to discover our latest bespoke experiences.
               </p>
               <Link
                 to="/events"
                 className="yg-btn-primary yg-shine"
                 style={{ background: BRAND.gold, color: BRAND.primary }}
               >
                 Explore Portfolio <FaArrowRight size={12} />
               </Link>
             </div>
          )}
        </div>
      </section>

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
                Professional Academy
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
              Master Event{" "}
              <span
                style={{
                  fontStyle: "italic",
                  color: BRAND.coral,
                }}
              >
                Planning.
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
              Join our 8-week certification program. Get hands-on training and
              real-world skills to become a successful event professional.
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
                "8 weeks of hands-on, intensive training",
                "Real event planning from day one",
                "Certification recognised by industry leaders",
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
                Next cohort starting soon
              </span>
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
              Ready to Begin?
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
            {homeContent?.cta?.title || "Ready to Join the Fun?"}
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
            {homeContent?.cta?.description ||
              "Be part of a community that celebrates life, creates memories, and brings happiness to every moment."}
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
                  className="yg-btn-primary"
                  onMouseEnter={() => handleLinkHover("/events")}
                  aria-label="Explore upcoming events"
                >
                  Explore Events <FaArrowRight size={12} />
                </Link>
                <a
                  href={`https://wa.me/${
                    contactInfo?.phone?.replace(/\D/g, "") || "251978639887"
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yg-btn-whatsapp"
                  aria-label="Contact us on WhatsApp"
                >
                  <FaWhatsapp size={16} />
                  WhatsApp Us
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
