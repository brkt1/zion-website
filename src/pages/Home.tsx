import { useMemo } from "react";
import { FaArrowRight, FaBriefcase, FaCalendarAlt, FaHandsHelping, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import expoHero from "../assets/expo/hero.png";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import { LocationButton } from "../Components/ui/LocationButton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useContactInfo, useEvents, useHomeContent } from "../hooks/useApi";
import { optimizeImageUrl } from "../utils/imageOptimizer";
import { handleLinkHover } from "../utils/prefetch";



const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const Home = () => {
  const { content: homeContent } = useHomeContent();
  const { events: featuredEvents } = useEvents({ featured: true, limit: 3 });

  // Optimize background images once on mount (static URLs)
  const optimizedBgImages = useMemo(() => ({
    dubai: optimizeImageUrl("https://cdn.pixabay.com/photo/2021/11/26/17/26/dubai-desert-safari-6826298_1280.jpg", { width: 1920, quality: 55, format: 'auto' }),
    maldives: optimizeImageUrl("https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg", { width: 1920, quality: 55, format: 'auto' }),
    dolomites: optimizeImageUrl("https://cdn.pixabay.com/photo/2020/03/29/09/24/pale-di-san-martino-4979964_1280.jpg", { width: 1920, quality: 55, format: 'auto' }),
  }), []);
  const { contactInfo } = useContactInfo();

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Manrope:wght@300;400;500;700;800&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Manrope', sans-serif; }
        
        .text-gold-gradient {
          background: linear-gradient(135deg, #FFD447, #FF6F5E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .luxury-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.05);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card:hover {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 40px 100px -20px rgba(255, 111, 94, 0.15);
          transform: translateY(-8px);
        }
        
        .glow-button-light {
          background: linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%);
          color: #1C2951;
          font-weight: 800;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .shine-effect {
          position: relative;
          overflow: hidden;
        }

        .shine-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shine 4s infinite;
        }
      `}</style>
      {/* Hero Section with Auto-Changing Destinations */}
      <Hero />

      {/* Wedding Expo Featured Banner */}
      <section className="relative overflow-hidden py-24 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-amber-500" />
                <span className="text-amber-600 font-sans tracking-[0.4em] uppercase text-[10px] font-black">Spotlight</span>
              </div>
              <h2 className="font-serif text-5xl md:text-7xl text-slate-900 tracking-tight leading-none">
                Featured <span className="italic text-gold-gradient">Masterpiece</span>
              </h2>
            </div>
            <p className="font-sans text-slate-400 uppercase tracking-[0.4em] text-[10px] font-black hidden md:block">
              Event Curation 2026
            </p>
          </div>

          <Link 
            to="/expo-info"
            className="group block relative rounded-[4rem] overflow-hidden shadow-2xl transition-all duration-700 hover:scale-[1.01] border border-slate-100 luxury-card"
          >
            <div className="lg:flex items-stretch min-h-[500px]">
              <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full overflow-hidden">
                <img 
                  src={expoHero} 
                  alt="Yene Ken Wedding Expo" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                <div className="absolute top-10 left-10">
                  <div className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl">
                    Exclusive Access
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 p-12 lg:p-20 bg-white flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50" />
                
                <h3 className="font-serif text-4xl lg:text-6xl text-slate-900 mb-6 tracking-tight relative z-10 leading-none">
                  Yene Ken <br />
                  <span className="italic text-gold-gradient">Wedding Expo</span>
                </h3>
                
                <div className="flex flex-wrap gap-8 mb-10 relative z-10">
                  <div className="space-y-1 text-left border-l-2 border-amber-500/20 pl-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Schedule</p>
                    <p className="font-sans font-black text-slate-800 text-sm">March 27–28</p>
                  </div>
                  <div className="space-y-1 text-left border-l-2 border-amber-500/20 pl-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Venue</p>
                    <p className="font-sans font-black text-slate-800 text-sm">Ghion Hotel</p>
                  </div>
                </div>

                <p className="text-slate-500 mb-12 max-w-lg leading-relaxed text-lg font-medium relative z-10">
                  Step into Ethiopia's most prestigious gathering of luxury wedding artisans. An curated ecosystem designed for the elite.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                  <span className="glow-button-light px-12 py-5 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-xs tracking-widest uppercase">
                    Explore Exhibition
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?u=expo${i}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">+200 Brands</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Gallery Section */}

      <Gallery />

      {/* Event Categories */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <div className="inline-block mb-4 md:mb-6">
              <div 
                className="h-1 w-16 md:w-20 mx-auto mb-3 md:mb-4 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight px-4">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                What We Offer
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              From events to travel adventures, we create experiences that bring people together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {/* Dynamic Categories from API */}
            {homeContent?.categories && homeContent.categories.length > 0 ? (
              homeContent.categories.map((category, index) => (
                <Link
                  key={category.id || index}
                  to={category.link}
              className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-700 cursor-pointer border border-gray-100 hover:border-transparent"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
              }}
              onMouseEnter={(e) => {
                handleLinkHover(category.link);
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.06)";
              }}
            >
              {/* Abstract shape background */}
              <div 
                className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
                  transform: "translate(30%, -30%)",
                }}
              ></div>
              
              {/* Number indicator */}
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <div 
                  className="text-4xl md:text-5xl lg:text-6xl font-black opacity-5 group-hover:opacity-10 transition-opacity duration-700"
                  style={{
                    background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                  }}
                >
                  {category.number || String(index + 1).padStart(2, '0')}
                </div>
              </div>

              <div className="relative z-10 pt-6 md:pt-8">
                {/* Decorative line */}
                <div 
                  className="h-1 w-12 md:w-16 mb-6 md:mb-8 rounded-full transition-all duration-700 group-hover:w-20 md:group-hover:w-24"
                  style={{
                    background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                ></div>

                <h3 
                  className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                  {category.description}
                </p>
                <div className="flex items-center">
                  <span 
                    className="text-sm font-semibold tracking-wide uppercase mr-3 transition-all duration-300 group-hover:mr-4"
                    style={{
                      color: "#C73A26",
                    }}
                  >
                    Learn More
                  </span>
                  <div 
                    className="w-8 h-0.5 transition-all duration-300 group-hover:w-12"
                    style={{
                      background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                    }}
                  ></div>
                  <FaArrowRight 
                    className="ml-2 transition-all duration-300 group-hover:translate-x-2" 
                    style={{ color: "#C73A26" }}
                    size={14}
                  />
                </div>
              </div>
            </Link>
              ))
            ) : (
              // Fallback to hardcoded categories if API doesn't return any
              <>
                <Link to="/events?category=game" className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-700 cursor-pointer border border-gray-100 hover:border-transparent" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)" }} onMouseEnter={(e) => { if (window.innerWidth >= 768) { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)"; } }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.06)"; }}>
                  <div className="relative z-10 pt-6 md:pt-8">
                    <div className="h-1 w-12 md:w-16 mb-6 md:mb-8 rounded-full transition-all duration-700 group-hover:w-20 md:group-hover:w-24" style={{ background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)" }}></div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 tracking-tight" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Events</h3>
                    <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">Fun-filled evenings with board games, trivia, and interactive challenges. Perfect for making new friends!</p>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold tracking-wide uppercase mr-3 transition-all duration-300 group-hover:mr-4" style={{ color: "#C73A26" }}>Explore Events</span>
                      <div className="w-8 h-0.5 transition-all duration-300 group-hover:w-12" style={{ background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)" }}></div>
                      <FaArrowRight className="ml-2 transition-all duration-300 group-hover:translate-x-2" style={{ color: "#C73A26" }} size={14} />
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Experiences Section */}
      <section className="py-32 relative overflow-hidden bg-[#FAF9F6]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <div className="inline-block px-5 py-1.5 mb-8 border border-amber-500/20 rounded-full bg-amber-500/5 backdrop-blur-sm">
              <span className="text-amber-600 font-sans tracking-[0.4em] text-[10px] uppercase font-black">Upcoming Curations</span>
            </div>
            <h2 className="font-serif text-5xl md:text-8xl mb-8 text-slate-900 tracking-tight leading-none">
              Featured <span className="italic text-gold-gradient">Experiences</span>
            </h2>
            <p className="font-sans text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              Join our strictly curated events designed for discovery, connection, and pure immersion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {/* Featured Events from API */}
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group relative flex flex-col luxury-card bg-white h-full overflow-hidden rounded-[3.5rem]"
                >
                  {/* Event Image */}
                  <div className="h-72 relative overflow-hidden">
                    {event.image ? (
                      <OptimizedImage
                        src={event.image}
                        alt={event.title}
                        width={600}
                        height={400}
                        quality={70}
                        priority="low"
                        responsive={true}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <FaCalendarAlt size={32} className="text-slate-200" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
                    
                    {/* Badge */}
                    <div className="absolute top-8 right-8">
                      <div className="glow-button-light px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
                        Coming Soon
                      </div>
                    </div>
                  </div>

                  <div className="p-10 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8 bg-amber-500/40" />
                      <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                        <span className="flex items-center gap-2">
                          <FaCalendarAlt size={10} className="text-amber-500" />
                          {formatDateShort(event.date)}
                        </span>
                        <span className="flex items-center gap-2">
                          <FaMapMarkerAlt size={10} className="text-amber-500" />
                          <LocationButton location={event.location} className="text-slate-400 font-black" showIcon={false} />
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif text-3xl text-slate-800 mb-6 tracking-tight group-hover:text-amber-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-slate-500 mb-10 leading-relaxed text-sm font-medium line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-900 group-hover:text-amber-600 transition-colors">
                        View Journey
                      </span>
                      <FaArrowRight className="text-amber-500 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No featured events at the moment. Check back soon!</p>
              </div>
            )}
          </div>

          <div className="text-center mt-24">
            <Link
              to="/events"
              className="inline-flex items-center gap-4 text-[10px] font-black tracking-[0.4em] uppercase text-slate-400 group hover:text-amber-600 transition-all"
            >
              Discover All Journeys
              <div className="w-12 h-px bg-amber-500/20 group-hover:w-20 group-hover:bg-amber-500 transition-all" />
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Section - Join Our Team */}
      <section className="py-32 relative overflow-hidden bg-white border-y border-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <div className="inline-block px-5 py-1.5 mb-8 border border-amber-500/20 rounded-full bg-amber-500/5 backdrop-blur-sm">
              <span className="text-amber-600 font-sans tracking-[0.4em] text-[10px] uppercase font-black">Community</span>
            </div>
            <h2 className="font-serif text-5xl md:text-8xl mb-8 text-slate-900 tracking-tight leading-none">
              Join Our <span className="italic text-gold-gradient">Collective</span>
            </h2>
            <p className="font-sans text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
              We're always looking for passionate individuals to join us as interns or volunteers.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="group relative overflow-hidden rounded-[4rem] bg-white border border-slate-100 luxury-card p-12 md:p-24 transition-all duration-700">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="flex gap-6">
                  <div className="w-1/2 aspect-[4/5] rounded-[3rem] overflow-hidden luxury-border-light">
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <FaBriefcase size={48} className="text-amber-500/40" />
                    </div>
                  </div>
                  <div className="w-1/2 aspect-[4/5] rounded-[3rem] overflow-hidden translate-y-12 luxury-border-light">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <FaHandsHelping size={48} className="text-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <h3 className="font-serif text-4xl md:text-6xl text-slate-800 leading-tight tracking-tight">
                    Be Part of <br /><span className="italic text-gold-gradient">The Journey.</span>
                  </h3>
                  <p className="font-sans text-xl text-slate-500 leading-relaxed font-light">
                    Whether you're looking for an internship to gain experience or want to volunteer for our next big event, your passion is what drives us forward.
                  </p>
                  
                  <div className="pt-8">
                    <Link
                      to="/apply"
                      className="glow-button-light inline-flex items-center gap-4 px-12 py-5 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm tracking-widest uppercase"
                    >
                      Apply Now <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-20 lg:py-24 text-white overflow-hidden" style={{ minHeight: "400px" }}>
        {/* Hero-style background */}
        <div className="absolute inset-0 z-0">
          {/* Background images - loaded on demand via IntersectionObserver in Hero component */}
          <div 
            className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] md:w-[180vw] md:h-[180vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundImage: `url(${optimizedBgImages.dubai})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.6)",
              animation: "ctaRotate 20s linear infinite",
            }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] md:w-[180vw] md:h-[180vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundImage: `url(${optimizedBgImages.maldives})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.6)",
              clipPath: "circle(23%)",
              animation: "ctaRotate 20s linear infinite",
              animationDelay: "0.2s",
            }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] md:w-[180vw] md:h-[180vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundImage: `url(${optimizedBgImages.dolomites})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.6)",
              clipPath: "circle(13%)",
              animation: "ctaRotate 20s linear infinite",
              animationDelay: "0.4s",
            }}
          ></div>
          {/* Dark overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.5) 100%)",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 px-4"
            style={{
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            {homeContent?.cta?.title || "Ready to Join the Fun?"}
          </h2>
          <p 
            className="text-base sm:text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto opacity-95 px-4"
            style={{
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {homeContent?.cta?.description || "Be part of a community that celebrates life, creates memories, and brings happiness to every moment."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            {homeContent?.cta?.buttons && homeContent.cta.buttons.length > 0 ? (
              homeContent.cta.buttons.map((button, index) => (
                button.type === 'primary' ? (
                <Link
                  key={index}
                  to={button.link}
                  onMouseEnter={() => handleLinkHover(button.link)}
                  className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-[50px] font-semibold hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                      color: "#1C2951",
                    }}
                  >
                    {button.text}
                  </Link>
                ) : (
                  <a
                    key={index}
                    href={button.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base text-white rounded-[50px] font-semibold hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                      boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)",
                      textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <FaWhatsapp size={18} />
                    {button.text}
                  </a>
                )
              ))
            ) : (
              <>
                <Link
                  to="/events"
                  onMouseEnter={() => handleLinkHover('/events')}
                  className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-[50px] font-semibold hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                    color: "#1C2951",
                  }}
                >
                  Explore Events
                </Link>
                <a
                  href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base text-white rounded-[50px] font-semibold hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)",
                    textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <FaWhatsapp size={18} />
                  Contact via WhatsApp
                </a>
              </>
            )}
          </div>
        </div>

        <style>{`
          @keyframes ctaRotate {
            0% {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
        `}</style>
      </section>
    </div>
  );
};

export default Home;

