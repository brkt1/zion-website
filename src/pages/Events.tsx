import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaWhatsapp
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { EventsSkeleton } from "../Components/ui/EventsSkeleton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useEvents } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { BRAND, GRADIENT } from "../styles/theme";



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

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const Events = () => {
  useScrollReveal();

  useEffect(() => {
    document.title = "Events | YENEGE";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Yenege - Exclusive Event Portfolio. Bespoke travels and curated events across Ethiopia. Discover Ethiopia's most refined experiences."
      );
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const { events, isLoading: eventsLoading } = useEvents();

  const filteredEvents = useMemo(() => {
    return (events || []).filter((event) => {
      // Apply the search filter
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [events, searchQuery]);



  if (eventsLoading || !events) {
    return <EventsSkeleton />;
  }

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap');

        .yg-font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .yg-font-sans  { font-family: 'Manrope', system-ui, sans-serif; }

        .yg-event-card {
          background: #fff;
          border-radius: 42px;
          overflow: hidden;
          transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 10px 30px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          height: 100%;
          text-decoration: none;
          position: relative;
        }
        .yg-event-card:hover {
          transform: translateY(-16px) scale(1.01);
          box-shadow: 0 80px 140px -30px rgba(1, 33, 28, 0.15);
          border-color: rgba(228, 232, 33, 0.2);
        }
        .yg-event-card:hover .card-img {
          transform: scale(1.08);
        }
        .yg-event-card:hover .arrow-circle {
          background: #0F172A;
          color: #FFD447;
          transform: rotate(-45deg);
        }

        .vertical-date {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-family: 'Manrope', sans-serif;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          color: rgba(255, 255, 255, 0.4);
        }

        .price-badge {
          background: #0F172A;
          color: #FFD447;
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-style: italic;
          font-weight: 900;
          padding: 8px 18px;
          border-radius: 16px;
          box-shadow: 0 10px 20px rgba(1, 33, 28, 0.2);
        }

        .category-pill {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          color: #fff;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 6px 14px;
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .yg-category-nav {
          display: flex;
          gap: 32px;
          margin-bottom: 60px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding-bottom: 2px;
        }

        .yg-category-btn {
          position: relative;
          padding: 12px 0;
          font-family: 'Manrope', sans-serif;
          font-size: 11px;
          font-weight: 800;
          color: #9CA3AF;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .yg-category-btn.active {
          color: #0F172A;
        }
        .yg-category-btn::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 3px;
          background: #FFD447;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .yg-category-btn.active::after {
          width: 100%;
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 20px;
          padding: 8px 16px;
          width: 100%;
          max-width: 320px;
          transition: all 0.3s;
        }
        .search-container:focus-within {
          border-color: #0F172A;
          box-shadow: 0 10px 30px rgba(1, 33, 28, 0.05);
        }
        .search-input {
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          width: 100%;
        }
        .search-input::placeholder {
          color: #9CA3AF;
        }

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

        @media (max-width: 768px) {
          .yg-event-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .yg-category-nav { gap: 20px; overflow-x: auto; padding-bottom: 15px; }
          .yg-category-btn { white-space: nowrap; }
          .search-container { max-width: 100%; border-color: rgba(255,255,255,0.1) !important; background: rgba(255,255,255,0.05) !important; }
          .search-input { color: #fff !important; }
          .filtration-row { flex-direction: column; align-items: flex-start !important; }
          .sidebrand { display: none; }
        }
      `}</style>

      {/* ── 1. Hero Header ─────────────────────────────────────────────────── */}
      <section style={{ padding: "160px 0 40px", background: BRAND.primary, position: 'relative', overflow: 'hidden' }}>
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
          EXPERIENCES
        </div>
        <div className="noise-bk" />
        <div className="sidebrand">ZION PORTFOLIO 2024</div>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,111,94,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />

        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: 'relative', zIndex: 2 }}>
          <SectionLabel>Collections</SectionLabel>
          <h1 className="yg-font-serif" style={{ fontSize: "clamp(48px, 8vw, 84px)", fontWeight: 900, color: BRAND.white, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: "24px" }}>
            Event <br />
            <span style={{ fontStyle: "italic", background: GRADIENT.brand, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Curation</span>
          </h1>
          <p className="yg-font-sans" style={{ fontSize: "18px", color: 'rgba(255,255,255,0.5)', maxWidth: "540px", lineHeight: 1.6 }}>
            Discover our portfolio of exclusive experiences, from bespoke travels to high-impact community gatherings.
          </p>
        </div>
      </section>

      {/* ── 2. Events Grid ─────────────────────────────────── */}
      <section
        style={{
          padding: "40px 0 140px",
          background: BRAND.primary,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="noise-bk" />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(228,232,33,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />

        <div className="reveal-wrapper" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px" }}>
          
          <div className="filtration-row flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8 relative z-20">
            {/* Left Aligned Search - Glow Theme */}
            <div className="search-container reveal-wrapper" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', maxWidth: '400px' }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               </svg>
               <input 
                 type="text" 
                 placeholder="Search Zion experiences..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="search-input"
                 style={{ color: '#fff' }}
               />
            </div>
          </div>

          {eventsLoading ? (
            <div style={{ textAlign: "center", padding: "120px 0" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: `3px solid ${BRAND.gray100}`,
                  borderTopColor: BRAND.gold,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 24px",
                }}
              />
              <p className="yg-font-sans" style={{ color: BRAND.gray400, fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Curating Experiences...
              </p>
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </div>
          ) : filteredEvents.length === 0 ? (
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
                  fontSize: "28px",
                  fontWeight: 700,
                  color: BRAND.navy,
                  marginBottom: "16px",
                }}
              >
                No events found
              </h3>
              <p
                className="yg-font-sans"
                style={{
                  color: BRAND.gray500,
                  fontSize: "18px",
                  maxWidth: "480px",
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Try adjusting your filters or check back later! We're constantly curating new experiences.
              </p>
            </div>
          ) : (
            <div
              className="yg-event-grid reveal-wrapper reveal-delay-200"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: "60px",
              }}
            >
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="yg-event-card group"
                >
                  {/* Image Wrapper - Aspect 3:4 for vertical editorial feel */}
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
                       <span className="vertical-date">{formatDateShort(event.date)}</span>
                    </div>

                    {/* Content Over the Image (High Contrast) */}
                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-start">
                       <div className="flex items-center gap-3 mb-4">
                          <span className="category-pill">{event.category}</span>
                          <span className="h-1 w-1 bg-[#FFD447] rounded-full" />
                          <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">{event.location}</span>
                       </div>
                       
                       <h3 className="yg-font-serif text-3xl md:text-4xl font-black text-white leading-[1.05] tracking-tight mb-8">
                         {event.title}
                       </h3>

                       <div className="flex items-center justify-between w-full">
                         <div className="price-badge">
                           {event.price === "Free" ? "Gratis" : `${event.price} ${event.currency}`}
                         </div>
                         
                         <div className="arrow-circle w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white transition-all duration-500">
                           <FaArrowRight size={14} />
                         </div>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Final CTA ─────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "140px 0",
          background: BRAND.white,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "40%",
            height: "100%",
            background: "radial-gradient(circle, rgba(255,111,94,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div
          className="reveal-wrapper"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          <SectionLabel>Collaborate</SectionLabel>
          <h2
            className="yg-font-serif"
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 900,
              color: BRAND.navy,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "32px",
            }}
          >
            Want to Host <br />
            <span
              style={{
                background: GRADIENT.brand,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontStyle: "italic",
              }}
            >
              An Event?
            </span>
          </h2>
          <p
            className="yg-font-sans"
            style={{
              fontSize: "19px",
              color: BRAND.gray600,
              lineHeight: 1.8,
              marginBottom: "48px",
              maxWidth: "520px",
              margin: "0 auto 48px",
            }}
          >
            Get in touch with us to organize your own community event! We help you bring your vision to life.
          </p>

          <a
            href="https://wa.me/251978639887"
            target="_blank"
            rel="noopener noreferrer"
            className="yg-btn-whatsapp"
          >
            <FaWhatsapp size={18} />
            Contact via WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default Events;


