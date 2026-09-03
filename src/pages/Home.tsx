import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaGraduationCap,
  FaNetworkWired,
  FaRocket,
  FaStar,
  FaUsers,
  FaWhatsapp,
  FaMapMarkerAlt
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useLanguage } from "../contexts/LanguageContext";
import { useEvents, useHomeContent } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { optimizeImageUrl } from "../utils/imageOptimizer";
import { handleLinkHover } from "../utils/prefetch";

const Home = () => {
  useScrollReveal();
  const { t, language } = useLanguage();
  const { content: homeContent } = useHomeContent();
  const { events: recentEvents } = useEvents({ limit: 6 });

  const [imgOrientations, setImgOrientations] = useState<Record<string, 'portrait' | 'landscape' | 'unknown'>>({});

  const detectOrientation = (id: string, src: string) => {
    if (!src || imgOrientations[id]) return;
    const img = new Image();
    img.onload = () => {
      setImgOrientations(prev => ({
        ...prev,
        [id]: img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait',
      }));
    };
    img.src = src;
  };

  useEffect(() => {
    document.title = `${t.header.home || 'Home'} | YENEGE | Professional Event Production & Academy`;
  }, [t]);

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
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden selection:bg-[#FFD447] selection:text-[#1C2951]">
      
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. ACADEMY SPOTLIGHT ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-[#0B0F19]">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-radial from-[#FFD447]/8 via-transparent to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-radial from-[#FF6F5E]/8 via-transparent to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT: Copy */}
            <div className="space-y-6 sm:space-y-7">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#FFD447]/10 border border-[#FFD447]/30">
                <span className="w-2 h-2 rounded-full bg-[#FFD447] shadow-[0_0_10px_#FFD447]" />
                <span className="text-[#FFD447] font-black text-[10px] uppercase tracking-[0.25em]">
                  {t.home?.academyLabel || "ልዩ ስልጠና · Special Training"}
                </span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
                {t.home?.academyTitle || "Learn the Art of Event Architecture."}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium max-w-lg">
                {t.home?.academyDesc || "East Africa's most comprehensive event training program. From logistics to live execution — we build the next generation of certified event architects."}
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {[
                  t.home?.featureCert || "Professional Certification",
                  t.home?.featureMasterclass || "Hands-on Masterclasses",
                  t.home?.featureProjects || "Real-world Projects",
                  t.home?.featureMentors || "Industry Mentors"
                ].map((feat) => (
                  <span key={feat} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-slate-300">
                    <FaCheckCircle className="text-[#FFD447]" size={9} /> {feat}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 pt-2">
                <Link to="/masterclass-registration" className="w-full sm:w-auto text-center justify-center bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-105 flex items-center gap-2">
                  {t.home?.enrollNow || "Enroll Now"} <FaGraduationCap />
                </Link>
                <Link to="/masterclass" className="w-full sm:w-auto text-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/15 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:border-[#FFD447]/40 flex items-center gap-2">
                  {t.home?.seeMasterclass || "See Masterclass"} <FaArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* RIGHT: Stats cards */}
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                {[
                  { val: "1k+", label: t.home?.communityMembers || "Community Members", icon: <FaUsers size={18} /> },
                  { val: "4.9★", label: t.home?.studentRating || "Student Rating", icon: <FaStar size={18} /> },
                ].map((s, i) => (
                  <div key={i} className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden hover:border-[#FFD447]/30 transition-all">
                    <div className="text-[#FFD447] mb-2 sm:mb-3">{s.icon}</div>
                    <div className="font-heading text-3xl sm:text-4xl font-black text-white mb-1">{s.val}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.18em]">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Highlight card */}
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFD447]/10 to-[#FF6F5E]/8 border border-[#FFD447]/20 backdrop-blur-xl relative overflow-hidden hover:border-[#FFD447]/40 transition-all">
                <div className="text-[#FFD447] mb-3 sm:mb-4"><FaGraduationCap size={28} /></div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white mb-2">
                  {t.home?.eliteCircleTitle || "Join the Elite Circle."}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {t.home?.eliteCircleDesc || "Limiting enrollment to a Founding 50 allows for high-touch mentorship and 100% mastery in experience mapping and ROI modeling."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. FEATURED EVENTS ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <p className="text-[#FFD447] font-black text-[10px] uppercase tracking-[0.3em] mb-1">
                {t.home?.curatedExperiences || "Curated Experiences"}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                {t.home?.featuredEvents || "Featured Events"}
              </h2>
            </div>
            <Link to="/events" className="hidden md:flex items-center gap-2 text-xs font-black text-slate-400 hover:text-[#FFD447] transition-colors uppercase tracking-widest">
              {t.home?.viewAll || "View All"} <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {(recentEvents || []).filter(e => e.is_registration_open !== false).map((event) => {
              if (event.image && !imgOrientations[event.id]) {
                detectOrientation(event.id, event.image);
              }
              const isLandscape = imgOrientations[event.id] === 'landscape';
              const dateObj = new Date(event.date);
              const formattedDate = isNaN(dateObj.getTime()) ? event.date : dateObj.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: "short", day: "numeric" });

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className={`group rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-[#FFD447]/40 transition-all duration-500 hover:-translate-y-1.5 ${isLandscape ? 'md:col-span-2' : ''}`}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    {event.image ? (
                      <OptimizedImage
                        src={event.image}
                        alt={event.title}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                        <FaCalendarAlt size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />

                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#0F172A]/80 backdrop-blur-md text-[#FFD447] text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {event.category || 'Event'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#FFD447] text-[#1C2951] font-black text-[10px] uppercase tracking-wider">
                        {event.price === 'Free' || event.price === '0' ? (language === 'am' ? 'ነፃ' : language === 'om' ? 'Bilisaa' : 'Free') : `${event.price} ${event.currency || 'ETB'}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-[#FFD447]" />{formattedDate}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-[#FF6F5E]" />{event.location}</span>
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl font-black text-white group-hover:text-[#FFD447] transition-colors">
                      {event.title}
                    </h3>
                    <div className="pt-3 border-t border-white/8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#FFD447]">
                      <span>{t.eventsPage?.details || "View Details"}</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#FFD447] group-hover:text-[#1C2951] transition-all">
                        <FaArrowRight size={10} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-10 text-center md:hidden">
            <Link to="/events" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
              {t.home?.viewAll || "View All Events"} <FaArrowRight size={10} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. THE YENEGE DISTINCTION ────────────────────────────────────── */}
      <section className="py-16 md:py-24 relative bg-[#0B0F19] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFD447]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <p className="text-[#FFD447] font-black text-[10px] uppercase tracking-[0.3em]">
              {t.home?.distinctionLabel || "The Yenege Distinction"}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              {t.home?.distinctionTitle || "Our Journey of Excellence."}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
              {t.home?.distinctionDesc || "Our methodology is a continuous cycle of innovation, education, and proven results."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { id: "01", title: t.home?.step1Title || "Architectural Mastery", desc: t.home?.step1Desc || "We design experience systems where every detail is intentional and every moment is impactful.", icon: <FaRocket />, color: "#FFD447" },
              { id: "02", title: t.home?.step2Title || "Educational Core", desc: t.home?.step2Desc || "As home to East Africa's leading Event Academy, our team stays at the industry's absolute forefront.", icon: <FaGraduationCap />, color: "#FF6F5E" },
              { id: "03", title: t.home?.step3Title || "Hybrid Delivery", desc: t.home?.step3Desc || "We host one event and reach two audiences — connecting Addis Ababa to the global Ethiopian diaspora.", icon: <FaNetworkWired />, color: "#7B5CFF" },
              { id: "04", title: t.home?.step4Title || "Verified Footprint", desc: t.home?.step4Desc || "Thousands of successful events and a community spanning the globe — our track record speaks for itself.", icon: <FaCheckCircle />, color: "#3CCFCF" },
            ].map((step, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-[#FFD447]/30 transition-all duration-300 group">
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <span className="font-heading text-2xl sm:text-3xl font-black text-white/10 group-hover:text-[#FFD447] transition-colors">{step.id}</span>
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: step.color }}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-black text-white mb-2 sm:mb-3 group-hover:text-[#FFD447] transition-colors">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. YENEGE UNITY ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-[#FFD447]/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#FFD447] shadow-[0_0_10px_#FFD447]" />
            <span className="text-[#FFD447] font-black text-[10px] uppercase tracking-[0.25em]">
              {t.home?.unityBadge || "Yenege Unity"}
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            {t.home?.unityTitle || "Curated Access. Premium Connections."}
          </h2>

          <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto px-2">
            {t.home?.unityDesc || "A curated business environment designed strictly for strategic partnerships and brand visibility. Elevate your enterprise and connect directly with key decision-makers."}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/yenege-unity" className="w-full sm:w-auto text-center justify-center bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-8 sm:px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-105 flex items-center gap-3">
              {t.home?.exploreUnity || "Explore Yenege Unity"} <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. GALLERY ────────────────────────────────────────────────────── */}
      <Gallery />

      {/* ── 7. FINAL CTA ─────────────────────────────────────────────────── */}
      <section
        aria-label="Call to action"
        className="relative py-20 sm:py-28 overflow-hidden min-h-[420px] sm:min-h-[460px] flex items-center"
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
              filter: "brightness(0.5)",
              clipPath: bg.clip,
              animation: `yg-cta-rotate 22s linear infinite`,
              animationDelay: bg.delay,
              willChange: "transform",
            }}
          />
        ))}

        <style>{`
          @keyframes yg-cta-rotate {
            0%   { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}</style>

        {/* Overlay */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/55 to-[#0F172A]/70" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#FFD447] shadow-[0_0_8px_#FFD447]" />
            <span className="text-[#FFD447] font-black text-[10px] uppercase tracking-[0.25em]">{t.cta?.readyBegin || "Ready to Begin?"}</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight drop-shadow-2xl">
            {t.cta?.readyJoin || "Ready to Join the Team?"}
          </h2>

          <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
            {t.cta?.bePartOf || "Be part of a community of certified professionals."}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 justify-center pt-2">
            {homeContent?.cta?.buttons && homeContent.cta.buttons.length > 0 ? (
              homeContent.cta.buttons.map((button, index) =>
                button.type === "primary" ? (
                  <Link
                    key={index}
                    to={button.link}
                    className="w-full sm:w-auto text-center justify-center bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-8 sm:px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 flex items-center gap-2"
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
                    className="w-full sm:w-auto text-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 sm:px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    <FaWhatsapp size={16} /> {button.text}
                  </a>
                )
              )
            ) : (
              <>
                <Link
                  to="/events"
                  className="w-full sm:w-auto text-center justify-center bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-8 sm:px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 flex items-center gap-2"
                  onMouseEnter={() => handleLinkHover("/events")}
                >
                  {t.hero?.exploreEvents || "Explore Events"} <FaArrowRight size={12} />
                </Link>
                <Link
                  to="/masterclass-registration"
                  className="w-full sm:w-auto text-center justify-center bg-[#FFD447]/10 hover:bg-[#FFD447]/20 text-[#FFD447] border border-[#FFD447]/35 hover:border-[#FFD447]/70 font-black px-8 sm:px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all backdrop-blur-xl flex items-center gap-2"
                  onMouseEnter={() => handleLinkHover("/masterclass-registration")}
                >
                  <FaGraduationCap size={15} /> {t.home?.seeMasterclass || "Learn Event"}
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
