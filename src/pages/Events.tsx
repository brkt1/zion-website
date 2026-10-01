import { useEffect } from "react";
import { FaArrowRight, FaCalendarAlt, FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const Events = () => {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = "Events & Ticketing | YENEGE | yenege.events";
    // Automatic seamless forward to yenege.events after 1.5 seconds
    const timer = setTimeout(() => {
      window.location.href = "https://yenege.events";
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center px-4 sm:px-6 relative overflow-hidden py-24">
      {/* Golden ambient background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-7 p-8 sm:p-12 rounded-3xl bg-[#080808] border border-white/10 shadow-2xl">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[#D4AF37] font-black text-[10px] sm:text-xs uppercase tracking-[0.25em]">
            Official Discovery Portal
          </span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <FaCalendarAlt size={28} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Events Are Live on <span className="text-[#D4AF37]">yenege.events</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/65 leading-relaxed font-normal">
            {language === 'am'
              ? 'ሁሉም የቀጥታ ኢቨንቶች፣ የቲኬት ሽያጭ እና ምዝገባዎች በይፋዊው yenege.events ፖርታል ላይ ይገኛሉ። በቅርቡ ይዘዋወራሉ...'
              : 'All live experiences, instant QR ticketing, and seat reservations have moved exclusively to our dedicated portal at yenege.events.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center">
          <a
            href="https://yenege.events"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#D4AF37] hover:bg-[#F5BD42] text-black text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-105"
          >
            <span>Go to yenege.events Now</span>
            <FaExternalLinkAlt size={11} />
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/20 hover:border-white text-white text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/10"
          >
            <span>Back to Home</span>
            <FaArrowRight size={10} />
          </Link>
        </div>

        <p className="text-[10px] text-white/40 uppercase tracking-widest pt-2">
          Redirecting automatically to yenege.events...
        </p>
      </div>
    </div>
  );
};

export default Events;
