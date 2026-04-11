import { useEffect } from "react";
import {
    FaArrowRight,
    FaBullhorn,
    FaCheckCircle,
    FaComments,
    FaSearch,
    FaTelegramPlane,
    FaUserFriends,
    FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
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

const Community = () => {
  useScrollReveal();

  useEffect(() => {
    document.title = "Community | YENEGE";
  }, []);

  const telegramLink = "https://t.me/yenegeevents"; // Updated to the correct public link

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

        .yg-feature-card {
           background: rgba(255,255,255,0.03);
           border: 1px solid rgba(255,255,255,0.08);
           border-radius: 32px;
           padding: 48px;
           transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
           height: 100%;
           backdrop-filter: blur(10px);
        }
        .yg-feature-card:hover {
           transform: translateY(-8px);
           box-shadow: 0 32px 80px -16px rgba(0, 0, 0, 0.3);
           border-color: ${BRAND.gold};
           background: rgba(255,255,255,0.06);
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
          transition: all 0.25s;
        }
        .yg-btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255,212,71,0.2);
        }

        .yg-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.2);
          color: BRAND.white;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.25s;
        }
        .yg-btn-outline:hover {
          background: rgba(255,255,255,0.05);
          border-color: #fff;
        }

        @media (max-width: 768px) {
          .yg-grid-mobile { grid-template-columns: 1fr !important; gap: 24px !important; }
          .sidebrand { display: none; }
        }
      `}</style>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "180px 0 100px",
          position: "relative",
          overflow: "hidden",
          background: BRAND.primary,
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
          COMMUNITY
        </div>
        <div className="noise-bk" />
        <div className="sidebrand">ZION ECOSYSTEM 2024</div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(251,111,94,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(228,232,33,0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />


        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: "900px", textAlign: "center", margin: "0 auto" }}>
            <SectionLabel>Collective Synergy</SectionLabel>
            <h1
              className="yg-font-serif"
              style={{
                fontSize: "clamp(52px, 8vw, 92px)",
                fontWeight: 900,
                color: BRAND.white,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                marginBottom: "32px",
              }}
            >
              The YENEGE <br />
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                Community.
              </span>
            </h1>
            <p
              className="yg-font-sans"
              style={{
                fontSize: "22px",
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.6,
                maxWidth: "720px",
                margin: "0 auto 48px",
              }}
            >
              Connect, Share, Grow. Your all-in-one hub for events, networking, and personal growth in Addis Ababa. Join a vibrant, supportive ecosystem.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="yg-btn-primary">
                Join Locally <FaTelegramPlane size={14} />
              </a>
              <Link to="/events" className="yg-btn-outline" style={{ color: '#fff' }}>
                Explore Events <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro Section ────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center", position: 'relative', zIndex: 2 }}>
          <p
            className="yg-font-serif"
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              color: BRAND.white,
              lineHeight: 1.4,
              maxWidth: "1000px",
              margin: "0 auto",
              fontWeight: 400,
            }}
          >
            "At Yenege, we are building <span style={{ fontWeight: 700, color: BRAND.gold }}>more than just a platform</span> — we’re creating a vibrant space where people can connect, collaborate, and thrive."
          </p>
          <div style={{ height: "3px", width: "60px", background: BRAND.gold, margin: "48px auto" }} />
          <p
            className="yg-font-sans"
            style={{
              fontSize: "18px",
              color: 'rgba(255,255,255,0.4)',
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Whether you’re an event organizer, a creative looking to promote your work, or someone seeking like-minded friends, Yenege is the place to be.
          </p>
        </div>
      </section>

      {/* ── Why YENEGE Grid ────────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <SectionLabel>Member Benefits</SectionLabel>
            <h2 className="yg-font-serif" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, color: BRAND.white }}>
              Why <span style={{ fontStyle: "italic", color: BRAND.gold }}>YENEGE?</span>
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
                icon: <FaUsers />,
                title: "Connect with Amazing People",
                desc: "Meet individuals who share your passions and values. Build meaningful relationships that last.",
              },
              {
                icon: <FaBullhorn />,
                title: "Promote Your Work",
                desc: "Showcase your events or personal achievements. Our community encourages visibility.",
              },
              {
                icon: <FaSearch />,
                title: "Discover Exciting Events",
                desc: "Never miss out on the experiences that matter. Explore a wide range of sessions.",
              },
              {
                icon: <FaComments />,
                title: "Share Stories & Inspire",
                desc: "Your voice matters. Share insights to inspire others and contribute to the ecosystem.",
              },
              {
                icon: <FaUserFriends />,
                title: "Build Lasting Friendships",
                desc: "Forge genuine connections in a safe, welcoming environment nurtured by joy.",
              },
            ].map((item, i) => (
              <div key={i} className="yg-feature-card">
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(255,212,71,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: BRAND.gold,
                    marginBottom: "32px",
                    fontSize: "24px",
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="yg-font-serif" style={{ fontSize: "24px", fontWeight: 800, color: BRAND.white, marginBottom: "16px", lineHeight: 1.2 }}>
                  {item.title}
                </h3>
                <p className="yg-font-sans" style={{ fontSize: "16px", color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Join ───────────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, color: BRAND.white, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />

        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div className="yg-grid-mobile" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "80px", alignItems: "center" }}>
            <div>
              <SectionLabel><span style={{ color: BRAND.gold }}>The Journey</span></SectionLabel>
              <h2 className="yg-font-serif" style={{ fontSize: "48px", fontWeight: 900, marginBottom: "32px" }}>How to Join</h2>
              <p className="yg-font-sans" style={{ fontSize: "20px", color: "rgba(255,255,255,0.7)", marginBottom: "48px" }}>
                Becoming part of Yenege is simple and open to everyone:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {[
                  "Sign up and create your profile.",
                  "Connect with people who share your interests.",
                  "Explore events and promote your own.",
                  "Engage in discussions and share your stories.",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "20px", alignItems: "start" }}>
                    <FaCheckCircle style={{ color: BRAND.gold, marginTop: "6px" }} />
                    <span className="yg-font-sans" style={{ fontSize: "18px", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "60px",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "40px",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              }}
            >
              <h3 className="yg-font-serif" style={{ fontSize: "32px", fontWeight: 800, color: BRAND.gold, marginBottom: "20px" }}>
                Start Connecting!
              </h3>
              <p className="yg-font-sans" style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", marginBottom: "40px" }}>
                Join today and begin your journey with Yenege Community.
              </p>
              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="yg-btn-primary">
                Join Local Community <FaTelegramPlane size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "140px 0", background: BRAND.primary, textAlign: "center", position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <h2 className="yg-font-serif" style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: BRAND.white, marginBottom: "48px" }}>
            Ready to Start Making <br />
            <span style={{ fontStyle: "italic", color: BRAND.gold }}>Meaningful Connections?</span>
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="yg-btn-primary">
              Join Locally Today <FaTelegramPlane size={14} />
            </a>
            <Link to="/contact" className="yg-btn-outline" style={{ color: '#fff' }}>
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Community;

