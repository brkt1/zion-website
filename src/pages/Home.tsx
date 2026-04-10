import { useMemo } from "react";
import {
  FaArrowRight,
  FaBriefcase,
  FaCalendarAlt,
  FaGraduationCap,
  FaHandsHelping,
  FaMapMarkerAlt,
  FaStar,
  FaUsers,
  FaWhatsapp,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import { LocationButton } from "../Components/ui/LocationButton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useContactInfo, useEvents, useHomeContent } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";
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
const BRAND = {
  navy: "#0F172A",
  navyLight: "#1E293B",
  gold: "#E4E821",
  coral: "#FF6F5E",
  cream: "#FAF9F6",
  white: "#FFFFFF",
  gray50: "#F8F9FA",
  gray100: "#F0F2F5",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray900: "#111827",
};

const GRADIENT = {
  brand: "linear-gradient(135deg, #E4E821 0%, #FF6F5E 100%)",
  navyVert: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
  textDark: "linear-gradient(135deg, #111827 0%, #374151 100%)",
};

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

/** Gold accent rule */
const AccentRule = () => (
  <div
    style={{
      height: "3px",
      width: "48px",
      borderRadius: "99px",
      background: GRADIENT.brand,
      marginBottom: "16px",
    }}
  />
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
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      padding: "0 48px",
    }}
  >
    <span
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(36px, 5vw, 52px)",
        fontWeight: 900,
        lineHeight: 1,
        background: "linear-gradient(135deg, #E4E821 0%, #FF6F5E 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        letterSpacing: "-0.02em",
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        color: "rgba(255,255,255,0.45)",
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        marginTop: "4px",
      }}
    >
      {label}
    </span>
  </div>
);

/* ─── Main Component ────────────────────────────────────────────────────────── */
const Home = () => {
  useScrollReveal();
  const { content: homeContent } = useHomeContent();
  const { events: featuredEvents } = useEvents({ featured: true, limit: 3 });
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
          background: linear-gradient(135deg, #E4E821 0%, #FF6F5E 100%);
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
        @media (max-width: 768px) {
          .yg-stats-row { flex-wrap: wrap; gap: 12px !important; justify-content: center; }
          .yg-event-grid { grid-template-columns: 1fr !important; }
          .yg-service-grid { grid-template-columns: 1fr !important; }
          .yg-community-grid { grid-template-columns: 1fr !important; }
          .yg-community-images { display: none !important; }
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
            background: "linear-gradient(90deg, transparent, #E4E821, #FF6F5E, transparent)",
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
          className="reveal-wrapper"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "56px 24px",
          }}
        >
          <div
            className="yg-stats-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StatBadge value="99%" label="Happy Members" icon={<FaUsers />} />
            {/* Divider */}
            <div style={{ width: "1px", height: "56px", background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
            <StatBadge value="4.9★" label="Average Rating" icon={<FaStar />} />
            {/* Divider */}
            <div style={{ width: "1px", height: "56px", background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
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
            <SectionLabel>What We Do</SectionLabel>
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
              Curated Experiences,{" "}
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                Endless Joy
              </span>
            </h2>
            <p
              className="yg-font-sans"
              style={{
                fontSize: "17px",
                color: BRAND.gray500,
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              From game nights to world-class travel, every offering is
              designed to bring people together.
            </p>
          </div>

          {/* Service cards */}
          <div
            className="yg-service-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
              gap: "32px",
            }}
          >
            {homeContent?.categories && homeContent.categories.length > 0 ? (
              homeContent.categories.map((category, index) => (
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
                    title: "Events",
                    desc: "Fun-filled evenings with board games, trivia, and interactive challenges. Perfect for making new friends!",
                    link: "/events",
                  },
                  {
                    number: "02",
                    title: "Community",
                    desc: "Join a vibrant community of happy people. Share stories, connect, and build lasting friendships.",
                    link: "/community",
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
        style={{ padding: "100px 0", background: BRAND.cream }}
      >
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              marginBottom: "80px",
            }}
          >
            <SectionLabel>Upcoming Curations</SectionLabel>
            <h2
              id="experiences-heading"
              className="yg-font-serif"
              style={{
                fontSize: "clamp(40px, 6vw, 64px)",
                fontWeight: 900,
                color: BRAND.navy,
                margin: "0 0 24px",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Featured{" "}
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                Experiences
              </span>
            </h2>
            <Link
              to="/events"
              onMouseEnter={() => handleLinkHover("/events")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: BRAND.coral,
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "gap 0.3s ease"
              }}
              className="group-hover:gap-3"
            >
              View All Events <FaArrowRight size={12} />
            </Link>
          </div>

          {/* Event cards grid */}
          {featuredEvents.length > 0 ? (
            <div
              className="yg-event-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "28px",
              }}
            >
              {featuredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="yg-event-card"
                  style={{ textDecoration: "none" }}
                  aria-label={`View details for ${event.title}`}
                >
                  {/* Image area */}
                  <div
                    className="yg-img-wrap"
                    style={{
                      height: "240px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {event.image ? (
                      <OptimizedImage
                        src={event.image}
                        alt={event.title}
                        width={600}
                        height={400}
                        quality={70}
                        priority="low"
                        responsive={true}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FaCalendarAlt
                          size={36}
                          style={{ color: "rgba(228,232,33,0.4)" }}
                        />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(15,23,42,0.5) 0%, transparent 60%)",
                      }}
                    />

                    {/* Date badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "10px",
                        padding: "6px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FaCalendarAlt
                        size={10}
                        style={{ color: BRAND.coral }}
                      />
                      <span
                        className="yg-font-sans"
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: BRAND.navy,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {formatDateShort(event.date)}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div
                    style={{
                      padding: "28px 28px 24px",
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    {/* Location */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "12px",
                      }}
                    >
                      <FaMapMarkerAlt
                        size={11}
                        style={{ color: BRAND.gold, flexShrink: 0 }}
                      />
                      <LocationButton
                        location={event.location}
                        className="yg-font-sans"
                        showIcon={false}
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: BRAND.gray400,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      />
                    </div>

                    <h3
                      className="yg-font-serif"
                      style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: BRAND.navy,
                        marginBottom: "10px",
                        lineHeight: 1.3,
                      }}
                    >
                      {event.title}
                    </h3>

                    <p
                      className="yg-font-sans"
                      style={{
                        fontSize: "14px",
                        color: BRAND.gray500,
                        lineHeight: 1.65,
                        marginBottom: "24px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {event.description}
                    </p>

                    {/* Footer CTA */}
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "20px",
                        borderTop: `1px solid ${BRAND.gray100}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        className="yg-font-sans"
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: BRAND.navy,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        View Details
                      </span>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: GRADIENT.brand,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FaArrowRight
                          size={12}
                          style={{ color: BRAND.navy }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div
              style={{
                textAlign: "center",
                padding: "100px 24px",
                background: "rgba(15,23,42,0.02)",
                borderRadius: "32px",
                border: `1px dashed ${BRAND.gray100}`,
              }}
            >
              <h3
                className="yg-font-serif"
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: BRAND.navy,
                  marginBottom: "12px",
                }}
              >
                No featured events right now
              </h3>
              <p
                className="yg-font-sans"
                style={{
                  color: BRAND.gray500,
                  fontSize: "16px",
                  marginBottom: "32px",
                }}
              >
                Check back soon—we're curating something special.
              </p>
              <Link
                to="/events"
                className="yg-btn-primary yg-shine"
              >
                Browse All Events <FaArrowRight size={12} />
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

      {/* ── 7. Community ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="community-heading"
        style={{
          padding: "100px 0",
          background: BRAND.white,
        }}
      >
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              background: BRAND.cream,
              border: `1px solid ${BRAND.gray100}`,
              borderRadius: "32px",
              overflow: "hidden",
            }}
          >
            <div
              className="yg-community-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              {/* Image panel */}
              <div
                className="yg-community-images"
                style={{
                  background: GRADIENT.navyVert,
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  padding: "48px 40px",
                  justifyContent: "center",
                  minHeight: "460px",
                }}
              >
                {/* Intern card */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    padding: "24px",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: GRADIENT.brand,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaBriefcase size={20} style={{ color: BRAND.navy }} />
                  </div>
                  <div>
                    <p
                      className="yg-font-sans"
                      style={{
                        color: BRAND.gold,
                        fontSize: "10px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        marginBottom: "4px",
                      }}
                    >
                      Internship
                    </p>
                    <p
                      className="yg-font-serif"
                      style={{
                        color: BRAND.white,
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      Gain Real Experience
                    </p>
                    <p
                      className="yg-font-sans"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                        lineHeight: 1.4,
                      }}
                    >
                      Work alongside our team on live events.
                    </p>
                  </div>
                </div>

                {/* Volunteer card */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: "rgba(255,111,94,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaHandsHelping
                      size={20}
                      style={{ color: BRAND.coral }}
                    />
                  </div>
                  <div>
                    <p
                      className="yg-font-sans"
                      style={{
                        color: BRAND.coral,
                        fontSize: "10px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        marginBottom: "4px",
                      }}
                    >
                      Volunteer
                    </p>
                    <p
                      className="yg-font-serif"
                      style={{
                        color: BRAND.white,
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      Give Back & Grow
                    </p>
                    <p
                      className="yg-font-sans"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "13px",
                        lineHeight: 1.4,
                      }}
                    >
                      Be the heartbeat of our community events.
                    </p>
                  </div>
                </div>
              </div>

              {/* Text panel */}
              <div
                style={{
                  padding: "64px 56px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "0",
                }}
              >
                <SectionLabel>Community</SectionLabel>

                <h2
                  id="community-heading"
                  className="yg-font-serif"
                  style={{
                    fontSize: "clamp(32px, 4vw, 48px)",
                    fontWeight: 900,
                    color: BRAND.navy,
                    lineHeight: 1.15,
                    marginBottom: "20px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Be Part of{" "}
                  <span
                    style={{
                      background: GRADIENT.brand,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontStyle: "italic",
                    }}
                  >
                    The Journey.
                  </span>
                </h2>

                <p
                  className="yg-font-sans"
                  style={{
                    fontSize: "16px",
                    color: BRAND.gray500,
                    lineHeight: 1.75,
                    marginBottom: "40px",
                    maxWidth: "380px",
                  }}
                >
                  We're always looking for passionate people to join us as
                  interns or volunteers. Your energy drives us forward.
                </p>

                <Link
                  to="/apply"
                  className="yg-btn-primary"
                  style={{ alignSelf: "flex-start" }}
                  aria-label="Apply to join the Yenege community team"
                >
                  Apply Now <FaArrowRight size={12} />
                </Link>

                <p
                  className="yg-font-sans"
                  style={{
                    marginTop: "16px",
                    fontSize: "13px",
                    color: BRAND.gray400,
                  }}
                >
                  Open to internships & volunteers — no experience required.
                </p>
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
