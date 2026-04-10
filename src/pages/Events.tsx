import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaWhatsapp
} from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EventsSkeleton } from "../Components/ui/EventsSkeleton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useCategories, useEvents } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";

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

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");

  const { events, isLoading: eventsLoading } = useEvents({
    category: selectedCategory === "all" ? undefined : (selectedCategory as any),
  });

  const { categories: apiCategories } = useCategories();

  const categoriesList = useMemo(() => {
    const allCategories = [{ id: "all", name: "All", slug: "all" }];
    
    // Filter out categories user doesn't want: Community, Corporate, Game Nights
    const excludedIds = ["community", "corporate", "game"];
    
    if (apiCategories && apiCategories.length > 0) {
      apiCategories.forEach((cat) => {
        if (!excludedIds.includes(cat.id.toLowerCase())) {
          allCategories.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          });
        }
      });
    } else {
      allCategories.push(
        { id: "travel", name: "Travel", slug: "travel" }
      );
    }
    return allCategories;
  }, [apiCategories]);

  const filteredEvents = useMemo(() => {
    // Excluded IDs for manual filtering
    const excludedIds = ["community", "corporate", "game"];
    
    return (events || []).filter((event) => {
      // 1. First ensure we filter out the excluded categories even if on "All"
      if (excludedIds.includes(event.category?.toLowerCase())) return false;

      // 2. Then apply the category filter
      const matchesCategory =
        selectedCategory === "all" || event.category === selectedCategory;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "travel") {
      navigate("/travel");
      return;
    }
    if (categoryId === "community") {
      navigate("/community");
      return;
    }

    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

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
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 28px;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.4s cubic-bezier(0.16,1,0.3,1);
          display: flex;
          flex-direction: column;
          height: 100%;
          text-decoration: none;
        }
        .yg-event-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 80px -16px rgba(15,23,42,0.16);
        }

        .yg-search-input:focus {
          border-color: #E4E821 !important;
          box-shadow: 0 4px 20px rgba(228,232,33,0.1);
        }

        .yg-category-btn {
          position: relative;
          padding: 8px 0;
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: ${BRAND.gray500};
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.3s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .yg-category-btn.active {
          color: ${BRAND.navy};
        }
        .yg-category-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: ${GRADIENT.brand};
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .yg-category-btn.active::after {
          width: 100%;
        }

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

        @media (max-width: 768px) {
          .yg-event-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── 2. Events Grid (Start of page) ─────────────────────────────────── */}
      <section
        style={{
          padding: "160px 0 140px",
          background: BRAND.cream,
        }}
      >
        <div className="reveal-wrapper" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          {eventsLoading ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
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
              className="yg-event-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "40px",
              }}
            >
              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="yg-event-card"
                >
                  {/* Card Image */}
                  <div
                    style={{
                      height: "260px",
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
                        className="w-full h-full object-cover"
                        style={{ transition: "transform 1s cubic-bezier(0.16,1,0.3,1)" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: GRADIENT.navyVert,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FaCalendarAlt
                          size={40}
                          style={{ color: "rgba(228,232,33,0.3)" }}
                        />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(15,23,42,0.4) 0%, transparent 60%)",
                      }}
                    />

                    {/* Category tag */}
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "8px",
                        padding: "4px 12px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: BRAND.navy,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {event.category}
                    </div>

                    {/* Date badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#fff",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      <FaCalendarAlt size={12} style={{ color: BRAND.gold }} />
                      <span className="yg-font-sans" style={{ fontSize: "14px", fontWeight: 700 }}>
                        {formatDateShort(event.date)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    style={{
                      padding: "32px",
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "12px",
                      }}
                    >
                      <FaMapMarkerAlt size={10} style={{ color: BRAND.coral }} />
                      <span
                        className="yg-font-sans"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: BRAND.gray400,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {event.location}
                      </span>
                    </div>

                    <h3
                      className="yg-font-serif"
                      style={{
                        fontSize: "24px",
                        fontWeight: 800,
                        color: BRAND.navy,
                        marginBottom: "14px",
                        lineHeight: 1.25,
                      }}
                    >
                      {event.title}
                    </h3>

                    <p
                      className="yg-font-sans"
                      style={{
                        fontSize: "15px",
                        color: BRAND.gray500,
                        lineHeight: 1.7,
                        marginBottom: "32px",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {event.description}
                    </p>

                    {/* Card Footer */}
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "24px",
                        borderTop: `1px solid ${BRAND.gray100}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaUsers size={12} style={{ color: BRAND.gray400 }} />
                          <span
                            className="yg-font-sans"
                            style={{ fontSize: "12px", fontWeight: 600, color: BRAND.gray600 }}
                          >
                            {event.attendees || 0} attending
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: GRADIENT.brand,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.3s",
                        }}
                      >
                        <FaArrowRight size={12} style={{ color: BRAND.navy }} />
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


