import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaWhatsapp,
  FaSearch,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaFilter
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { EventsSkeleton } from "../Components/ui/EventsSkeleton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useCategories, useEvents } from "../hooks/useApi";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { toEthiopianDate } from "../utils/ethiopianCalendar";

const formatDateShort = (dateString: string) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

type Orientation = 'portrait' | 'landscape' | 'unknown';

const Events = () => {
  const [imgOrientations, setImgOrientations] = useState<Record<string, Orientation>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { events, isLoading: eventsLoading } = useEvents();
  const { categories } = useCategories();

  useScrollReveal();

  useEffect(() => {
    document.title = "Exclusive Events & Experiences | YENEGE";
  }, []);

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
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden selection:bg-[#FFD447] selection:text-[#1C2951] pb-24">
      {/* ── APP-STYLE PAGE HEADER ──────────────────────────────────────── */}
      <section className="relative pt-28 lg:pt-32 pb-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

          {/* Row 1: Title + Live Count */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#FFD447] font-black text-[10px] uppercase tracking-[0.3em] mb-1">Yenege Events</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-black text-white leading-tight">
                Upcoming <span className="italic text-[#FFD447]">Experiences</span>
              </h1>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {/* Row 2: Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input 
                type="text" 
                placeholder="Search by name, category or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E293B] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#FFD447] transition-all"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  !selectedCategory 
                    ? 'bg-[#FFD447] text-[#1C2951] shadow-lg shadow-[#FFD447]/20' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                All Events
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
                        ? 'bg-[#FFD447] text-[#1C2951] shadow-lg shadow-[#FFD447]/20' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
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
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 max-w-xl mx-auto p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#FFD447] text-2xl mx-auto">
                <FaFilter />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white">No Matching Events Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Try adjusting your search criteria or selecting a different category tab. New events are published regularly!
              </p>
              <button 
                type="button"
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="px-6 py-2.5 rounded-full bg-[#FFD447] text-[#1C2951] font-black text-xs uppercase tracking-wider"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredEvents.map((event) => {
                if (event.image && !imgOrientations[event.id]) {
                  detectOrientation(event.id, event.image);
                }
                const isLandscape = imgOrientations[event.id] === 'landscape';

                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className={`group rounded-3xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl hover:border-[#FFD447]/40 transition-all duration-500 shadow-2xl flex flex-col justify-between hover:-translate-y-1.5 ${
                      isLandscape ? 'md:col-span-2' : ''
                    }`}
                  >
                    {/* Media Container */}
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
                          <FaCalendarAlt size={48} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />

                      {/* Top Category & Price Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-3.5 py-1.5 rounded-full bg-[#0F172A]/80 backdrop-blur-md text-[#FFD447] text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {event.category || 'Special Event'}
                        </span>

                        <span className="px-4 py-1.5 rounded-full bg-[#FFD447] text-[#1C2951] font-black text-xs uppercase tracking-wider shadow-lg">
                          {event.price === 'Free' || event.price === '0' ? 'Gratis / Free' : `${event.price} ${event.currency || 'ETB'}`}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-slate-200">
                        <FaCalendarAlt className="text-[#FFD447]" />
                        <span>{formatDateShort(event.date)}</span>
                        {toEthiopianDate(event.date) && (
                          <span className="text-[#FFD447] text-[10px] font-black pl-1.5 border-l border-white/15">
                            🇪🇹 {toEthiopianDate(event.date)?.formattedAmharic}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-6 sm:p-8 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <FaMapMarkerAlt className="text-[#FF6F5E]" />
                        <span>{event.location || 'Addis Ababa, Ethiopia'}</span>
                      </div>

                      <h3 className="font-heading text-2xl font-black text-white group-hover:text-[#FFD447] transition-colors leading-snug">
                        {event.title}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-medium">
                        {event.description}
                      </p>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#FFD447]">
                        <span>Explore Event Details</span>
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#FFD447] group-hover:text-[#1C2951] transition-all">
                          <FaArrowRight size={12} />
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
      <section className="py-20 relative px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-r from-[#1C2951] via-[#0F172A] to-[#1C2951] border border-white/20 p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD447]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-black text-[#FFD447] uppercase tracking-[0.25em] block">Host With Us</span>
            <h2 className="font-heading text-4xl md:text-5xl font-black text-white leading-tight">
              Want to Host an <span className="text-[#FFD447] italic">Exceptional Event?</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              Submit a feasibility brief and let our experience architects assess technical viability, budget structure, and operational ROI.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <Link 
                to="/event-feasibility" 
                className="bg-gradient-to-r from-[#FFD447] to-[#FF6F5E] hover:from-[#ffe066] hover:to-[#ff8273] text-[#1C2951] font-black px-10 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#FF6F5E]/20 hover:scale-105 flex items-center gap-3"
              >
                Submit Event Brief <FaArrowRight />
              </Link>
              <a 
                href="https://wa.me/251978639887" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
              >
                <FaWhatsapp size={16} /> WhatsApp Inquiry
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
