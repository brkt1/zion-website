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
import { useLanguage } from "../contexts/LanguageContext";
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
  const { language } = useLanguage();

  useEffect(() => {
    document.title = "Community | YENEGE";
  }, []);

  const telegramLink = "https://t.me/yenegeevents";

  const benefits = [
    {
      icon: <FaUsers />,
      title: language === 'am' ? "ከድንቅ ሰዎች ጋር ይገናኙ" : language === 'om' ? "Namoota Gaarii Waliin Quunnamaa" : "Connect with Amazing People",
      desc: language === 'am' ? "ተመሳሳይ ፍላጎት እና እሴት ካላቸው ሰዎች ጋር ይገናኙ። ዘላቂ ግንኙነቶችን ይገንቡ።" : language === 'om' ? "Namoota fedhii fi ilaalcha walfakkataa qaban waliin walquunnamaa." : "Meet individuals who share your passions and values. Build meaningful relationships that last.",
    },
    {
      icon: <FaBullhorn />,
      title: language === 'am' ? "ስራዎን ያስተዋውቁ" : language === 'om' ? "Hojii Keessan Beeksisaa" : "Promote Your Work",
      desc: language === 'am' ? "የእርስዎን ኢቨንቶች ወይም የግል ስኬቶች ያሳይ። ማህበረሰባችን ታይነትን ያበረታታል።" : language === 'om' ? "Hojii fi qophii keessan hawaasa keenyaaf dhiheessaa." : "Showcase your events or personal achievements. Our community encourages visibility.",
    },
    {
      icon: <FaSearch />,
      title: language === 'am' ? "አዳዲስ ኢቨንቶችን ያግኙ" : language === 'om' ? "Qophii Haaraa Barbaadaa" : "Discover Exciting Events",
      desc: language === 'am' ? "ጠቃሚ አጋጣሚዎች አያመልጥዎ። ሰፊ የኢቨንት አማራጮችን ያግኙ።" : language === 'om' ? "Qophiiwwan babbareedoo add addaa daawwadhaa." : "Never miss out on the experiences that matter. Explore a wide range of sessions.",
    },
    {
      icon: <FaComments />,
      title: language === 'am' ? "ታሪኮችን ያካፍሉ" : language === 'om' ? "Seenaa Qooddhadhaa" : "Share Stories & Inspire",
      desc: language === 'am' ? "ድምፅዎ ዋጋ አለው። ሌሎችን ለማነሳሳት እና ለማበርከት ተሞክሮዎን ያካፍሉ።" : language === 'om' ? "Yaada fi seenaa keessan qoodachuun warra kaan kakaasaa." : "Your voice matters. Share insights to inspire others and contribute to the ecosystem.",
    },
    {
      icon: <FaUserFriends />,
      title: language === 'am' ? "ዘላቂ ወዳጅነት ይፍጠሩ" : language === 'om' ? "Michummaa Cimaa Ijaaraa" : "Build Lasting Friendships",
      desc: language === 'am' ? "በተጠበቀ እና ወዳጃዊ አካባቢ ውስጥ እውነተኛ ግንኙነቶችን ያጠናክሩ።" : language === 'om' ? "Bakka nagaa fi gammachuu qabu irratti jaalala ijaaraa." : "Forge genuine connections in a safe, welcoming environment nurtured by joy.",
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
          padding: "140px 0 80px",
          position: "relative",
          overflow: "hidden",
          background: BRAND.primary,
        }}
      >
        <div className="noise-bk" />
        <div className="sidebrand">YENEGE ECOSYSTEM 2026</div>

        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: "900px", textAlign: "center", margin: "0 auto" }}>
            <SectionLabel>Collective Synergy</SectionLabel>
            <h1
              className="yg-font-serif"
              style={{
                fontSize: "clamp(42px, 7vw, 84px)",
                fontWeight: 900,
                color: BRAND.white,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                marginBottom: "24px",
              }}
            >
              {language === 'am' ? 'የየነገ' : language === 'om' ? 'Hawaasa' : 'The YENEGE'} <br />
              <span
                style={{
                  background: GRADIENT.brand,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontStyle: "italic",
                }}
              >
                {language === 'am' ? 'ማህበረሰብ' : language === 'om' ? 'Yenege.' : 'Community.'}
              </span>
            </h1>
            <p
              className="yg-font-sans"
              style={{
                fontSize: "18px",
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.6,
                maxWidth: "720px",
                margin: "0 auto 36px",
              }}
            >
              {language === 'am'
                ? 'ይገናኙ፣ ያካፍሉ፣ ያድጉ። በአዲስ አበባ ውስጥ የኢቨንቶች፣ የመረብ ዝርጋታ እና የግል እድገት ማዕከልዎ።'
                : language === 'om'
                ? 'Walquunnamaa, qooddhadhaa, guddadhaa. Finfinnee keessatti waltajjii qophii fi guddina dhuunfaa keenya.'
                : 'Connect, Share, Grow. Your all-in-one hub for events, networking, and personal growth in Addis Ababa.'}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="yg-btn-primary">
                {language === 'am' ? 'ቴሌግራም ይቀላቀሉ' : language === 'om' ? 'Telegram-iin Makamaa' : 'Join Locally'} <FaTelegramPlane size={14} />
              </a>
              <Link to="/events" className="yg-btn-outline" style={{ color: '#fff' }}>
                {language === 'am' ? 'ኢቨንቶችን ይመልከቱ' : language === 'om' ? 'Qophiiwwan Daawwadhaa' : 'Explore Events'} <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro Section ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center", position: 'relative', zIndex: 2 }}>
          <p
            className="yg-font-serif"
            style={{
              fontSize: "clamp(20px, 3.5vw, 32px)",
              color: BRAND.white,
              lineHeight: 1.4,
              maxWidth: "1000px",
              margin: "0 auto",
              fontWeight: 400,
            }}
          >
            "At Yenege, we are building <span style={{ fontWeight: 700, color: BRAND.gold }}>more than just a platform</span> — we’re creating a vibrant space where people can connect, collaborate, and thrive."
          </p>
          <div style={{ height: "3px", width: "60px", background: BRAND.gold, margin: "36px auto" }} />
        </div>
      </section>

      {/* ── Benefits Grid ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
        <div className="noise-bk" />
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <SectionLabel>Member Benefits</SectionLabel>
            <h2 className="yg-font-serif" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", fontWeight: 900, color: BRAND.white }}>
              Why <span style={{ fontStyle: "italic", color: BRAND.gold }}>YENEGE?</span>
            </h2>
          </div>

          <div
            className="yg-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {benefits.map((item, i) => (
              <div key={i} className="yg-feature-card">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(255,212,71,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: BRAND.gold,
                    marginBottom: "24px",
                    fontSize: "20px",
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="yg-font-serif" style={{ fontSize: "20px", fontWeight: 800, color: BRAND.white, marginBottom: "12px", lineHeight: 1.2 }}>
                  {item.title}
                </h3>
                <p className="yg-font-sans" style={{ fontSize: "14px", color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Community;
