import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaFilter,
  FaMapMarkerAlt,
  FaSearch,
  FaWhatsapp
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { EventsSkeleton } from "../Components/ui/EventsSkeleton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useLanguage } from "../contexts/LanguageContext";
import { useCategories, useEvents } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { toEthiopianDate } from "../utils/ethiopianCalendar";

const formatDateShort = (dateString: string, lang: string) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const locale = lang === 'am' ? 'am-ET' : lang === 'om' ? 'om-ET' : 'en-US';
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

type Orientation = 'portrait' | 'landscape' | 'unknown';

const Events = () => {
  const { t, language } = useLanguage();
  const [imgOrientations, setImgOrientations] = useState<Record<string, Orientation>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { events, isLoading: eventsLoading } = useEvents();
  const { categories } = useCategories();

  useScrollReveal();

  useEffect(() => {
    document.title = `${t.eventsPage.title || 'Exclusive Events & Experiences'} | YENEGE`;
  }, [t, language]);

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

  const filteredEvents = useMemo(() => {
    return (events || []).filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || event.category === selectedCategory;
      const isRegistrationOpen = event.is_registration_open !== false;

      return matchesSearch && matchesCategory && isRegistrationOpen;
    });
  }, [events, searchQuery, selectedCategory]);

  if (eventsLoading && events.length === 0) {
    return <EventsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-[#FF0033] selection:text-white pb-24">
      {/* ── APP-STYLE PAGE HEADER ──────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* ── YENEGE.EVENTS & EVENTJOBS GATEWAY BANNER ── */}
          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#080808] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#FF0033]/15 to-transparent blur-[70px] pointer-events-none" />
            
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#FF0033]/10 border border-[#FF0033]/30 flex items-center justify-center text-[#FF0033] flex-shrink-0">
                <FaCalendarAlt size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF0033] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF0033]">
                    Official Event Hub & EventJobs
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Discover All Live Events & Careers on <span className="text-[#FF0033]">yenege.events</span>
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Instant QR ticketing, seat reservations, and backstage crew hiring for major East African events.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href="https://yenege.events"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-5 py-2.5 rounded-full bg-[#FF0033] hover:bg-[#E5002D] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,51,0.4)]"
              >
                <span>Open yenege.events</span>
                <FaArrowRight size={10} />
              </a>
              <a
                href="https://yenege.events"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 hover:bg-white/10"
              >
                <span>EventJobs</span>
              </a>
            </div>
          </div>

          {/* Row 1: Title + Live Count */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[#FF0033] font-black text-[10px] uppercase tracking-[0.3em] mb-1">
                {language === 'am' ? 'የነገ ኢቨንቶች' : language === 'om' ? 'QOPHIWWAN YENEGE' : 'YENEGE EXPERIENCES'}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {t.eventsPage.title}
              </h1>
              <p className="text-xs text-white/60 font-normal mt-1">
                {t.eventsPage.subtitle}
              </p>
            </div>
            <span className="text-[10px] font-bold text-white/80 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              {filteredEvents.length} {t.eventsPage.upcoming}
            </span>
          </div>

          {/* Row 2: Search + Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xs" />
              <input 
                type="text" 
                placeholder={t.eventsPage.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-[#FF0033] focus:ring-1 focus:ring-[#FF0033]/40 transition-all"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  !selectedCategory 
                    ? 'bg-[#FF0033] text-white shadow-lg shadow-[#FF0033]/30' 
                    : 'bg-[#0A0A0A] hover:bg-white/10 text-white/60 border border-white/10'
                }`}
              >
                {t.eventsPage.all}
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      isActive 
                        ? 'bg-[#FF0033] text-white shadow-lg shadow-[#FF0033]/30' 
                        : 'bg-[#0A0A0A] hover:bg-white/10 text-white/60 border border-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS GRID ─────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-[#0A0A0A] rounded-3xl border border-white/10 max-w-xl mx-auto p-6 sm:p-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-[#FF0033] text-xl mx-auto border border-white/10">
                <FaFilter />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {t.eventsPage.noEvents}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-normal">
                {language === 'am' 
                  ? 'እባክዎ የተለየ መፈለጊያ ቃል ወይም ምድብ ይምረጡ። አዳዲስ ኢቨንቶች በቅርቡ ይወጣሉ።' 
                  : language === 'om'
                  ? 'Maaloo jecha biraatiin barbaadaa ykn kaffaltii biraa filadhaa.'
                  : 'Try adjusting your search criteria or explore our live event portal on yenege.events.'}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                  className="px-5 py-2.5 rounded-full bg-[#FF0033] text-white font-black text-xs uppercase tracking-wider hover:bg-[#E5002D] transition-all"
                >
                  {t.eventsPage.clearFilters}
                </button>
                <a
                  href="https://yenege.events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full border border-white/20 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
                >
                  Visit yenege.events
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                if (event.image && !imgOrientations[event.id]) {
                  detectOrientation(event.id, event.image);
                }
                const isLandscape = imgOrientations[event.id] === 'landscape';

                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className={`minimal-card group overflow-hidden flex flex-col justify-between hover:border-[#FF0033]/60 transition-all duration-300 ${
                      isLandscape ? 'md:col-span-2' : ''
                    }`}
                  >
                    {/* Media Container */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                      {event.image ? (
                        <OptimizedImage
                          src={event.image}
                          alt={event.title}
                          width={800}
                          height={450}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-110 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#0F0F0F] text-white/30">
                          <FaCalendarAlt size={40} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      {/* Top Category & Price Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[#FF0033] text-[10px] font-black uppercase tracking-widest border border-white/10 truncate max-w-[50%]">
                          {event.category || 'Special Event'}
                        </span>

                        <span className="px-3.5 py-1 rounded-full bg-[#FF0033] text-white font-black text-[10px] uppercase tracking-wider shadow-lg">
                          {event.price === 'Free' || event.price === '0' ? t.eventsPage.free : `${event.price} ${event.currency || 'ETB'}`}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white/90">
                        <FaCalendarAlt className="text-[#FF0033]" />
                        <span>{formatDateShort(event.date, language)}</span>
                        {toEthiopianDate(event.date) && (
                          <span className="text-[#FF0033] text-[10px] font-black pl-1.5 border-l border-white/15">
                            🇪🇹 {toEthiopianDate(event.date)?.formattedAmharic}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <FaMapMarkerAlt className="text-[#FF0033] flex-shrink-0" />
                        <span className="truncate">{event.location || 'Addis Ababa, Ethiopia'}</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-[#FF0033] transition-colors leading-snug tracking-tight">
                        {event.title}
                      </h3>

                      <p className="text-xs text-white/60 leading-relaxed line-clamp-2 font-normal">
                        {event.description}
                      </p>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#FF0033]">
                        <span>{t.eventsPage.details}</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#FF0033] group-hover:border-[#FF0033] transition-all">
                          <FaArrowRight size={11} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── COLLABORATE / BRIEF CTA ───────────────────────────────────────── */}
      <section className="py-12 sm:py-16 relative px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#080808] border border-white/10 p-8 sm:p-12 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#FF0033]/15 to-transparent blur-3xl pointer-events-none" />
          
          <div className="space-y-5 relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-black text-[#FF0033] uppercase tracking-[0.25em] block">{t.eventsPage.hostWithUs}</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              {t.eventsPage.wantToHost}
            </h2>
            <p className="text-xs md:text-sm text-white/65 font-normal leading-relaxed">
              {t.eventsPage.submitBriefDesc}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-3">
              <Link 
                to="/event-feasibility" 
                className="w-full sm:w-auto bg-[#FF0033] hover:bg-[#E5002D] text-white font-black px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,0,51,0.4)] hover:scale-105 flex items-center justify-center gap-2"
              >
                {t.eventsPage.submitBriefBtn} <FaArrowRight />
              </Link>
              <a 
                href="https://wa.me/251978639887" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto border border-white/20 hover:border-white text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-white/10"
              >
                <FaWhatsapp size={15} className="text-[#FF0033]" /> {t.eventsPage.waInquiry}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
