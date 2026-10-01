import { useEffect, useMemo } from "react";
import {
  FaArrowRight,
  FaBriefcase,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaGraduationCap,
  FaNetworkWired,
  FaRocket,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import { useLanguage } from "../contexts/LanguageContext";
import { useHomeContent } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { optimizeImageUrl } from "../utils/imageOptimizer";

const Home = () => {
  useScrollReveal();
  const { t, language } = useLanguage();
  const { content: homeContent } = useHomeContent();

  useEffect(() => {
    document.title = `${t.header.home || 'Home'} | YENEGE | Experience Architecture & Events`;
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
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">
      
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2. PORTAL GATEWAY: yenege.events & EventJobs ─────────────────── */}
      <section className="py-14 sm:py-20 relative bg-[#050505] border-t border-b border-white/10 overflow-hidden">
        {/* Subtle golden ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-radial from-[#D4AF37]/15 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] font-black text-[10px] sm:text-xs uppercase tracking-[0.25em]">
                Live Ecosystem Hub
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Discover Events & Careers on <span className="text-[#D4AF37]">yenege.events</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-normal leading-relaxed">
              Explore live experiences, secure verified event tickets, or join high-profile production teams through our official sister portals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* CARD 1: DISCOVER EVENTS */}
            <div className="minimal-card p-7 sm:p-9 flex flex-col justify-between relative group hover:border-[#D4AF37]/60 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-black tracking-widest uppercase">
                    Ticketing & RSVP
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#D4AF37] group-hover:text-black group-hover:border-[#D4AF37] transition-all">
                    <FaExternalLinkAlt size={13} />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Discover Live Events
                </h3>

                <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                  Direct access to upcoming cultural festivals, professional summits, concerts, and exclusive VIP gatherings in Addis Ababa and across East Africa.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Instant QR Ticket</span>
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Live Calendar</span>
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Verified Venues</span>
                </div>
              </div>

              <div className="pt-7 mt-6 border-t border-white/10">
                <a
                  href="https://yenege.events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-xl bg-[#D4AF37] hover:bg-[#F5BD42] text-black text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]"
                >
                  <span>Go to yenege.events</span>
                  <FaArrowRight size={12} />
                </a>
              </div>
            </div>

            {/* CARD 2: EVENTJOBS */}
            <div className="minimal-card p-7 sm:p-9 flex flex-col justify-between relative group hover:border-white/50 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[10px] font-black tracking-widest uppercase">
                    Careers & Production
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    <FaBriefcase size={14} />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  EventJobs Portal
                </h3>

                <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                  Looking to work on premier events? Apply for verified crew opportunities in sound engineering, lighting design, stage management, security, and event hosting.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Production Crew</span>
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">Stage Operations</span>
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5">VIP Logistics</span>
                </div>
              </div>

              <div className="pt-7 mt-6 border-t border-white/10">
                <a
                  href="https://yenege.events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between px-6 py-4 rounded-xl border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-black uppercase tracking-widest transition-all duration-300"
                >
                  <span>Explore EventJobs</span>
                  <FaArrowRight size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. ACADEMY SPOTLIGHT ─────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 relative overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* LEFT: Copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                <span className="text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.25em]">
                  {t.home?.academyLabel || "Special Training · Academy"}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight">
                {t.home?.academyTitle || "Learn the Art of Event Architecture."}
              </h2>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal max-w-lg">
                {t.home?.academyDesc || "East Africa's most comprehensive event training program. From logistics to live execution — we build the next generation of certified event architects."}
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  t.home?.featureCert || "Professional Certification",
                  t.home?.featureMasterclass || "Hands-on Masterclasses",
                  t.home?.featureProjects || "Real-world Projects",
                  t.home?.featureMentors || "Industry Mentors"
                ].map((feat) => (
                  <span key={feat} className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white/80">
                    <FaCheckCircle className="text-[#D4AF37]" size={10} /> {feat}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 pt-2">
                <Link 
                  to="/masterclass-registration" 
                  className="w-full sm:w-auto text-center justify-center bg-[#D4AF37] hover:bg-[#F5BD42] text-black font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-105 flex items-center gap-2"
                >
                  {t.home?.enrollNow || "Enroll Now"} <FaGraduationCap />
                </Link>
                <Link 
                  to="/masterclass" 
                  className="w-full sm:w-auto text-center justify-center bg-transparent hover:bg-white/10 text-white border border-white/20 hover:border-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  {t.home?.seeMasterclass || "Curriculum Details"} <FaArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* RIGHT: Stats cards */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: "1k+", label: t.home?.communityMembers || "Community Members", icon: <FaUsers size={18} /> },
                  { val: "4.9★", label: t.home?.studentRating || "Student Rating", icon: <FaStar size={18} /> },
                ].map((s, i) => (
                  <div key={i} className="minimal-card p-6 relative overflow-hidden">
                    <div className="text-[#D4AF37] mb-3">{s.icon}</div>
                    <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">{s.val}</div>
                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-[0.15em]">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Highlight card */}
              <div className="minimal-card p-6 sm:p-7 relative overflow-hidden border-l-4 border-l-[#D4AF37]">
                <div className="text-[#D4AF37] mb-3"><FaGraduationCap size={24} /></div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">
                  {t.home?.eliteCircleTitle || "Join the Elite Circle."}
                </h3>
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed font-normal">
                  {t.home?.eliteCircleDesc || "Limiting enrollment to a Founding 50 allows for high-touch mentorship and 100% mastery in experience mapping and ROI modeling."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ── 5. THE YENEGE DISTINCTION (4 Minimal Phases) ─────────────────── */}
      <section className="py-14 sm:py-24 relative bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-12 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0A0A0A] border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              <span className="text-[#D4AF37] font-black text-[10px] sm:text-xs uppercase tracking-[0.25em]">
                {t.home?.distinctionLabel || "The Yenege Distinction"}
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {t.home?.distinctionTitle || "Our Journey of Excellence."}
            </h2>

            <p className="text-xs sm:text-sm text-white/60 font-normal max-w-xl mx-auto leading-relaxed">
              {t.home?.distinctionDesc || "Our methodology is a continuous cycle of innovation, education, and proven execution."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { 
                id: "01", 
                phase: "Phase I",
                title: t.home?.step1Title || "Architectural Mastery", 
                desc: t.home?.step1Desc || "We design experience systems where every detail is intentional and every moment is impactful.", 
                icon: <FaRocket />, 
              },
              { 
                id: "02", 
                phase: "Phase II",
                title: t.home?.step2Title || "Educational Core", 
                desc: t.home?.step2Desc || "Home to East Africa's leading Event Academy, our team stays at the industry's absolute forefront.", 
                icon: <FaGraduationCap />, 
              },
              { 
                id: "03", 
                phase: "Phase III",
                title: t.home?.step3Title || "Hybrid Delivery", 
                desc: t.home?.step3Desc || "We host one event and reach two audiences — connecting Addis Ababa to the global Ethiopian diaspora.", 
                icon: <FaNetworkWired />, 
              },
              { 
                id: "04", 
                phase: "Phase IV",
                title: t.home?.step4Title || "Verified Footprint", 
                desc: t.home?.step4Desc || "Hundreds of successful events and an elite verified community spanning across the continent.", 
                icon: <FaCheckCircle />, 
              },
            ].map((step, i) => (
              <div 
                key={i} 
                className="minimal-card p-6 sm:p-7 flex flex-col justify-between group hover:border-[#D4AF37]/60 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-black text-[#D4AF37]">
                      {step.id} • {step.phase}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    Execution Pillar
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. GALLERY ────────────────────────────────────────────────────── */}
      <Gallery />

      {/* ── 7. FINAL CTA ─────────────────────────────────────────────────── */}
      <section
        aria-label="Call to action"
        className="relative py-20 sm:py-28 overflow-hidden bg-black border-t border-white/10 flex items-center"
      >
        <div className="absolute inset-0 bg-radial from-[#D4AF37]/15 via-black/90 to-black pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0A0A0A] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
            <span className="text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.25em]">
              {t.cta?.readyBegin || "Experience Architecture"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Ready to Experience Excellence?
          </h2>

          <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed max-w-lg mx-auto">
            Discover upcoming events on <strong className="text-white">yenege.events</strong>, explore <strong className="text-white">EventJobs</strong>, or join the certified <strong className="text-white">Academy Masterclass</strong>.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 justify-center pt-2">
            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center justify-center bg-[#D4AF37] hover:bg-[#F5BD42] text-black font-black px-8 sm:px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] hover:scale-105 flex items-center gap-2"
            >
              <span>Discover on yenege.events</span>
              <FaExternalLinkAlt size={11} />
            </a>

            <a
              href="https://yenege.events"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center justify-center bg-[#0A0A0A] hover:bg-white hover:text-black text-white border border-white/20 hover:border-white font-black px-8 sm:px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <FaBriefcase size={12} className="text-[#D4AF37]" />
              <span>EventJobs Portal</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
