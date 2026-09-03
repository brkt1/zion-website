import { useEffect } from "react";
import {
  FaCheckCircle,
  FaGraduationCap,
  FaRocket,
  FaUsers
} from "react-icons/fa";
import { Link } from "react-router-dom";
import CEOKnowledgeCard from "../Components/ui/CEOKnowledgeCard";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useLanguage } from "../contexts/LanguageContext";
import { useAboutContent } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";

const About = () => {
  useScrollReveal();
  const { t, language } = useLanguage();
  const { content } = useAboutContent();

  useEffect(() => {
    document.title = `${t.about?.title || 'About Us'} | YENEGE`;
    window.scrollTo(0, 0);
  }, [t, language]);

  const defaultContent = {
    story: {
      title: t.about?.originLabel || "The Yenege Vision",
      content: t.about?.originDesc || "Yenege is a modern lifestyle and experience platform based in Addis Ababa, operating at the intersection of professional event execution, leadership education, and community architecture.",
    },
    mission: {
      title: t.about?.missionTitle || "Our Mission",
      heading: t.about?.missionHeading || "Empowering Tomorrow Through Strategic Precision",
      content: t.about?.missionDesc || "Empowering Tomorrow through Strategic Management, Experience Architecture, and Production Precision.",
    },
    vision: {
      title: t.about?.visionTitle || "Our Vision",
      heading: t.about?.visionHeading || "Becoming East Africa's Premier Experience Architect",
      content: t.about?.visionDesc || "Becoming East Africa’s premier 'Experience Economy' architect, shaping a generation of opportunity-ready creative leaders.",
    },
    ceo: {
      name: t.about?.ceoName || "Bereket Yosef",
      title: t.about?.ceoRole || "Founder & Executive Director",
      bio: t.about?.ceoBio || "Bereket Yosef is a visionary strategist and the architect behind YENEGE. With over a decade of experience in high-level event production, strategic logistics, and brand architecture, he is dedicated to professionalizing the experience industry in East Africa.",
      image: "/ceo.jpg",
      details: [
        { label: language === 'am' ? "መስራች" : language === 'om' ? "Hundessaa" : "Founder", value: "Bereket Yosef" },
        { label: language === 'am' ? "ዋና መሪያ ቤት" : language === 'om' ? "Teessoo" : "Headquarters", value: "Addis Ababa, Ethiopia" },
        { label: language === 'am' ? "የተመሰረተበት" : language === 'om' ? "Bara Hundaa'e" : "Founded", value: "2019" },
        { label: language === 'am' ? "ትኩረት" : language === 'om' ? "Xiyyeeffannoo" : "Focus", value: "Event Architecture & Strategy" }
      ],
      socialLinks: [
        { platform: "Instagram", url: "https://instagram.com/bereket_yosef" },
        { platform: "LinkedIn", url: "https://linkedin.com/in/bereketyosef" },
        { platform: "Facebook", url: "https://facebook.com/yenege" }
      ]
    }
  };

  const finalContent = content || defaultContent;
  const ceo = finalContent.ceo;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden selection:bg-[#FFD447] selection:text-[#1C2951] pb-24">
      
      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-12 sm:pb-20 overflow-hidden">
        {/* Background Lights */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-radial from-[#FFD447]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-radial from-[#FF6F5E]/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mx-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD447] shadow-[0_0_12px_#FFD447]" />
            <span className="text-[#FFD447] font-black text-xs uppercase tracking-[0.25em]">{t.about?.label || "OUR STORY & PHILOSOPHY"}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white max-w-4xl mx-auto">
            {t.about?.title || 'About Yenege'}<br />
            <span className="bg-gradient-to-r from-[#FFD447] via-[#FF6F5E] to-[#7B5CFF] bg-clip-text text-transparent italic">
              {t.about?.subtitle || "Architecting East Africa's Experience Economy"}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            {t.about?.description || 'Yenege is an experience architecture studio and event leadership academy headquartered in Addis Ababa, Ethiopia.'}
          </p>
        </div>
      </section>

      {/* ── THE 3 CORE PILLARS ──────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: t.about?.exec || "Professional Execution",
                desc: t.about?.execDesc || "High-level event production, sound design, spatial architecture, and multi-venue logistics management.",
                icon: <FaRocket className="text-3xl text-[#FFD447]" />
              },
              {
                title: t.about?.edu || "Executive Education",
                desc: t.about?.eduDesc || "East Africa's premier academy training the next generation of certified event directors and project leads.",
                icon: <FaGraduationCap className="text-3xl text-[#FF6F5E]" />
              },
              {
                title: t.about?.comm || "Vibrant Community",
                desc: t.about?.commDesc || "A collaborative ecosystem uniting corporate clients, creatives, vendors, and international event organizers.",
                icon: <FaUsers className="text-3xl text-[#7B5CFF]" />
              }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-[#FFD447]/40 transition-all duration-300 flex flex-col gap-4 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-white group-hover:text-[#FFD447] transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY / ORIGIN SECTION ──────────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block">{t.about?.originLabel || "The Yenege Origin"}</span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                "{t.about?.originQuote || "Many Attend Events."}"<br />
                <span className="italic text-gold-gradient">"{t.about?.originQuoteSub || "Few Architect Them."}"</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {t.about?.originDesc || "Yenege was born in Addis Ababa from a vision to bring world-class precision to the art of human gathering. We believe events should be engineered with strategic rigor, financial clarity, and emotional resonance."}
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  t.about?.check1 || "Structured planning & vendor governance frameworks",
                  t.about?.check2 || "Financial strategy and revenue sustainability modeling",
                  t.about?.check3 || "Spatial design, staging, and technical audiovisual production",
                  t.about?.check4 || "Hybrid event delivery connecting Ethiopia to global audiences"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                    <FaCheckCircle className="text-[#FF6F5E] shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl relative group">
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop"
                  alt="Events Architecture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
              <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.2em] block">
                {finalContent.mission.title}
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white">{t.about?.missionHeading || "Empowering Tomorrow Through Strategic Precision"}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {finalContent.mission.content}
              </p>
            </div>

            <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1C2951] to-[#0F172A] border border-white/15 space-y-4 shadow-2xl">
              <span className="text-xs font-black text-[#FF6F5E] uppercase tracking-[0.2em] block">
                {finalContent.vision.title}
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-white">{t.about?.visionHeading || "Becoming East Africa's Premier Experience Architect"}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {finalContent.vision.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER & CEO SPOTLIGHT ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block">{t.about?.ceoLabel || "Leadership"}</span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                {t.about?.ceoTitle || "Crafting Ethiopia's Creative Future"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                {ceo?.bio}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link 
                  to="/masterclass-registration" 
                  className="w-full sm:w-auto text-center bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] text-[#1C2951] font-black px-8 py-3.5 rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  {t.about?.joinCohort || "Join Academy Cohort"}
                </Link>
                <Link 
                  to="/contact" 
                  className="w-full sm:w-auto text-center bg-white/10 hover:bg-white/20 text-white border border-white/15 px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all"
                >
                  {t.about?.contactLead || "Contact Leadership"}
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              {ceo && (
                <CEOKnowledgeCard 
                  name={ceo.name ?? ''}
                  title={ceo.title ?? ''}
                  bio={ceo.bio ?? ''}
                  image={ceo.image ?? ''}
                  details={ceo.details ?? []}
                  socials={ceo.socialLinks ?? []}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
