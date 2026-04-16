import { useEffect } from "react";
import {
    FaArrowRight,
    FaCheckCircle,
    FaGraduationCap,
    FaNetworkWired,
    FaRocket,
    FaUsers,
    FaWhatsapp
} from "react-icons/fa";
import { Link } from "react-router-dom";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useAboutContent, useContactInfo } from "../hooks/useApi";
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
  gray50: "#F8F9FA",
  gray100: "#F0F2F5",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray900: "#111827",
};

const GRADIENT = {
  brand: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
  navyVert: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
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



const About = () => {
  useScrollReveal();
  const { contactInfo } = useContactInfo();
  const { content } = useAboutContent();

  useEffect(() => {
    document.title = "About Us | YENEGE";
  }, []);



  const ceo = content?.ceo;

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

        .yg-pillar-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 32px;
          padding: 48px;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          height: 100%;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .yg-pillar-card:hover {
          transform: translateY(-8px);
          background: rgba(255,255,255,0.05);
          border-color: ${BRAND.gold};
          box-shadow: 0 32px 80px -16px rgba(0,0,0,0.3);
        }

        .yg-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          background: ${BRAND.gold};
          color: ${BRAND.primary};
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
        }
        .yg-btn-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 16px 40px rgba(255,212,71,0.2);
        }

        .yg-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
        }
        .yg-btn-whatsapp:hover {
          background: rgba(255,255,255,0.05);
          border-color: #fff;
        }

        .yg-philosophy-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          transition: all 0.3s;
        }
        .yg-philosophy-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: ${BRAND.gold}44;
          transform: translateX(10px);
        }

        @media (max-width: 768px) {
          .yg-grid-mobile { grid-template-columns: 1fr !important; gap: 32px !important; }
          .sidebrand { display: none; }
        }
      `}</style>

      {/* ── 1. Page Header ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "180px 0 100px",
          background: BRAND.primary,
          position: "relative",
          overflow: "hidden",
        }}
      >
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
          HISTORY
        </div>
        <div className="noise-bk" />
        <div className="sidebrand">YENEGE ARCHIVE 2024</div>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,111,94,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />


        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: "800px", textAlign: "center", margin: "0 auto" }}>
            <SectionLabel>Architecture of Experiences</SectionLabel>
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
              We Build <br />
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                Beyond Moments.
              </span>
            </h1>
            <p
              className="yg-font-sans"
              style={{
                fontSize: "22px",
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.6,
                maxWidth: "680px",
                margin: "0 auto",
                fontWeight: 400,
              }}
            >
              Yenege is a modern lifestyle and experience platform based in Addis Ababa, operating at the intersection of professional execution, education, and community.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. The Intersection ──────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div
            className="yg-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
          >
            {[
              {
                title: "Professional Execution",
                icon: <FaRocket />,
                desc: "High-level event production and logistics management.",
              },
              {
                title: "Expert Education",
                icon: <FaGraduationCap />,
                desc: "Professional training for the next generation of event designers.",
              },
              {
                title: "Vibrant Community",
                icon: <FaUsers />,
                desc: "A collaborative ecosystem of creatives and professionals.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "40px",
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: "28px",
                  border: `1px solid rgba(255,255,255,0.08)`,
                  textAlign: "center",
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(228,232,33,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: BRAND.coral,
                    margin: "0 auto 24px",
                    fontSize: "24px",
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="yg-font-serif" style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px", color: BRAND.white }}>
                  {item.title}
                </h3>
                <p className="yg-font-sans" style={{ fontSize: "14px", color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. The Dream / Origin ────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, position: "relative", overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div className="yg-grid-mobile" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "100px", alignItems: "center" }}>
            <div>
              <SectionLabel>Our Origin</SectionLabel>
              <h2
                className="yg-font-serif"
                style={{
                  fontSize: "clamp(40px, 5vw, 64px)",
                  fontWeight: 900,
                  color: BRAND.white,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  marginBottom: "32px",
                }}
              >
                The Yenege <br />
                <span style={{ fontStyle: "italic", color: BRAND.gold }}>Dream.</span>
              </h2>
              <div className="yg-font-sans" style={{ fontSize: "18px", color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                <p style={{ fontSize: "24px", fontWeight: 600, color: BRAND.white, marginBottom: "32px", lineHeight: 1.3 }}>
                  "People attend events. <br />Few understand how to build them."
                </p>
                <p style={{ marginBottom: "24px" }}>
                  Yenege was born from a simple yet powerful vision: to bring happiness to life through meaningful connections and unforgettable experiences.
                </p>
                <p>
                  Every event we organize, every trip we plan, and every gathering we host is designed with one goal in mind: to bring professional precision to the art of gathering.
                </p>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-20px",
                  border: `2px solid ${BRAND.gold}`,
                  borderRadius: "40px",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  aspectRatio: "1/1.2",
                  borderRadius: "32px",
                  overflow: "hidden",
                  boxShadow: "0 40px 100px -20px rgba(0,0,0,0.15)",
                }}
              >
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop"
                  alt="Events Architecture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Difference Section ────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, color: BRAND.white, position: "relative", overflow: "hidden" }}>
        <div className="noise-bk" />
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            fontSize: 'max(20vw, 300px)',
            fontWeight: 900,
            fontFamily: "'Playfair Display', serif",
            color: 'rgba(255, 212, 71, 0.01)', 
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none'
          }}
        >
          DISTINCTION
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
            background: "radial-gradient(circle, rgba(228,232,33,0.05) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <SectionLabel><span style={{ color: BRAND.gold }}>The Distinction</span></SectionLabel>
            <h2 className="yg-font-serif" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, marginBottom: "24px" }}>
              What Makes Us <span style={{ fontStyle: "italic", color: BRAND.coral }}>Different.</span>
            </h2>
            <p className="yg-font-sans" style={{ fontSize: "20px", color: "rgba(255,255,255,0.7)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
              We don’t just organize events; we design complete experience systems.
            </p>
          </div>

          <div className="yg-grid-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <h3 className="yg-font-serif" style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: BRAND.gold }}>The Backbone of Every Event</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  "Structured planning frameworks",
                  "Vendor coordination models",
                  "Financial strategy systems",
                  "Operations & Logistics excellence",
                  "Experience design principles",
                ].map((text, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <FaCheckCircle style={{ color: BRAND.coral }} />
                    <span className="yg-font-sans" style={{ fontSize: "18px", fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                padding: "48px",
                borderRadius: "32px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 className="yg-font-serif" style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px", color: BRAND.coral }}>The Academy</h3>
              <p className="yg-font-sans" style={{ fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.8)", marginBottom: "24px" }}>
                Our academy teaches these professional systems to empower students with real-world skills, ensuring they can operate within world-class event structures.
              </p>
              <p className="yg-font-sans" style={{ fontSize: "16px", fontStyle: "italic", color: BRAND.gold }}>
                "We professionalize the industry while keeping creativity at its heart."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Our Ecosystem ─────────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <SectionLabel>The Yenege Pillars</SectionLabel>
            <h2 className="yg-font-serif" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: BRAND.white }}>
              Our <span style={{ fontStyle: "italic", color: BRAND.gold }}>Ecosystem.</span>
            </h2>
          </div>

          <div
            className="yg-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "32px",
            }}
          >
            {[
              {
                num: "01",
                title: "Event Production",
                desc: "Full-scale planning and execution for private, corporate, and community events.",
                icon: <FaRocket />,
              },
              {
                num: "02",
                title: "Event Academy",
                desc: "Structured professional training in event management — from foundation to execution.",
                icon: <FaGraduationCap />,
              },
              {
                num: "03",
                title: "Community Hub",
                desc: "A growing network of creatives, planners, and vendors building together.",
                icon: <FaNetworkWired />,
              },
            ].map((pillar, i) => (
              <div key={i} className="yg-pillar-card group">
                <div
                  className="yg-font-sans"
                  style={{
                    position: "absolute",
                    top: "24px",
                    right: "32px",
                    fontSize: "80px",
                    fontWeight: 900,
                    color: "rgba(255,212,71,0.03)",
                    lineHeight: 1,
                  }}
                >
                  {pillar.num}
                </div>
                <div style={{ color: BRAND.gold, fontSize: "32px", marginBottom: "32px" }}>{pillar.icon}</div>
                <h3 className="yg-font-serif" style={{ fontSize: "28px", fontWeight: 800, color: BRAND.white, marginBottom: "16px" }}>{pillar.title}</h3>
                <p className="yg-font-sans" style={{ fontSize: "17px", color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="yg-font-sans"
            style={{
              marginTop: "80px",
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              flexWrap: "wrap",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: BRAND.gray400,
            }}
          >
            <span>Execution • Education</span>
            <span>Education • Innovation</span>
            <span>Community • Growth</span>
          </div>
        </div>
      </section>

      {/* ── 6. Mission & Vision ──────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div className="yg-grid-mobile" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            <div style={{ padding: "60px", background: 'rgba(255,255,255,0.03)', borderRadius: "40px", border: '1px solid rgba(255,255,255,0.08)' }}>
              <SectionLabel>Our Mission</SectionLabel>
              <h3 className="yg-font-serif" style={{ fontSize: "32px", fontWeight: 800, color: BRAND.white, marginBottom: "24px" }}>
                Creating Accessible <br /><span style={{ color: BRAND.gold }}>Happiness.</span>
              </h3>
              <p className="yg-font-sans" style={{ fontSize: "18px", color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                {content?.mission?.content || "To create a vibrant community platform that brings people together through engaging events, adventures, and connections."}
              </p>
            </div>

            <div style={{ padding: "60px", background: 'rgba(255,212,71,0.03)', border: `1px solid ${BRAND.gold}22`, borderRadius: "40px", color: BRAND.white }}>
              <SectionLabel><span style={{ color: BRAND.gold }}>Our Vision</span></SectionLabel>
              <h3 className="yg-font-serif" style={{ fontSize: "32px", fontWeight: 800, marginBottom: "24px" }}>
                The Hub of <br /><span style={{ color: BRAND.gold }}>Experiences.</span>
              </h3>
              <p className="yg-font-sans" style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                {content?.vision?.content || "To become the leading lifestyle and events platform in Ethiopia, known for building a community where every member feels valued."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Founder Section ───────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div className="yg-grid-mobile" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "80px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  borderRadius: "40px",
                  overflow: "hidden",
                  boxShadow: "0 60px 120px -30px rgba(0,0,0,0.5)",
                  background: 'rgba(255,255,255,0.05)',
                  aspectRatio: "4/5",
                }}
              >
                {ceo?.image ? (
                  <OptimizedImage
                    src={ceo.image}
                    alt="Bereket Yosef"
                    className="w-full h-full object-cover grayscale"
                  />
                ) : (
                  <div style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                    <FaUsers size={64} style={{ margin: "0 auto 24px", color: BRAND.gray400 }} />
                    <span className="yg-font-serif" style={{ fontSize: "24px", fontWeight: 700, color: BRAND.gray400 }}>Founder Image</span>
                  </div>
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "32px",
                  right: "-20px",
                  background: BRAND.gold,
                  padding: "24px 40px",
                  borderRadius: "20px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
              >
                <div className="yg-font-sans" style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: BRAND.primary, opacity: 0.6, marginBottom: "4px" }}>Founder & CEO</div>
                <div className="yg-font-serif" style={{ fontSize: "24px", fontWeight: 900, color: BRAND.primary }}>Bereket Yosef</div>
              </div>
            </div>

            <div>
              <SectionLabel>Founder's Vision</SectionLabel>
              <h2
                className="yg-font-serif"
                style={{
                  fontSize: "clamp(36px, 5vw, 56px)",
                  fontWeight: 900,
                  color: BRAND.white,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  marginBottom: "32px",
                }}
              >
                Crafting Ethiopia's <br />
                <span style={{ fontStyle: "italic", color: BRAND.gold }}>Creative Future.</span>
              </h2>
              <div className="yg-font-sans" style={{ fontSize: "18px", color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: "24px" }}>
                  Bereket Yosef is a visionary entrepreneur dedicated to redefining the experience economy in Ethiopia. With a focus on strategic management and community architecture.
                </p>
                <p>
                  He founded Yenege to bridge the gap between world-class execution and transformative education, ensuring every event foundations for the next generation.
                </p>
              </div>

              {ceo?.socialLinks && (
                <div style={{ marginTop: "40px", display: "flex", gap: "24px" }}>
                  {ceo.socialLinks.map((s, i) => (
                    <a key={i} href={s.url} style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.gold, textDecoration: "none" }}>
                      {s.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Final CTA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center", position: 'relative', zIndex: 2 }}>
          <SectionLabel>Connect With Us</SectionLabel>
          <h2
            className="yg-font-serif"
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 900,
              color: BRAND.white,
              lineHeight: 1.1,
              marginBottom: "32px",
            }}
          >
            Ready to Build <br />
            <span style={{ fontStyle: "italic", color: BRAND.gold }}>Something Together?</span>
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "48px" }}>
            <Link to="/apply" className="yg-btn-primary">
              Join The Academy <FaArrowRight size={12} />
            </Link>
            <a
              href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, "") || "251978639887"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="yg-btn-whatsapp"
            >
              <FaWhatsapp size={18} /> Contact via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

