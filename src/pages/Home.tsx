import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import Gallery from "../Components/Gallery";
import Hero from "../Components/Hero";
import { LocationButton } from "../Components/ui/LocationButton";
import { useContactInfo, useEvents, useHomeContent } from "../hooks/useApi";
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
  const { contactInfo } = useContactInfo();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Auto-Changing Destinations */}
      <Hero />

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
                      color: "#FF6F5E",
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
                    style={{ color: "#FF6F5E" }}
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
                      <span className="text-sm font-semibold tracking-wide uppercase mr-3 transition-all duration-300 group-hover:mr-4" style={{ color: "#FF6F5E" }}>Explore Events</span>
                      <div className="w-8 h-0.5 transition-all duration-300 group-hover:w-12" style={{ background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)" }}></div>
                      <FaArrowRight className="ml-2 transition-all duration-300 group-hover:translate-x-2" style={{ color: "#FF6F5E" }} size={14} />
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-gray-50">
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
                Upcoming Events
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Don't miss out on these exciting experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {/* Featured Events from API */}
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-white transition-all duration-700 cursor-pointer border border-gray-100 hover:border-transparent"
                style={{
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
                }}
                onMouseEnter={(e) => {
                  handleLinkHover('/events');
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
                {/* Event Image */}
                <div 
                  className="h-32 sm:h-36 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${index % 3 === 0 ? 'rgba(255, 212, 71, 0.15)' : index % 3 === 1 ? 'rgba(255, 111, 94, 0.15)' : 'rgba(255, 212, 71, 0.2)'} 0%, ${index % 3 === 0 ? 'rgba(255, 111, 94, 0.15)' : index % 3 === 1 ? 'rgba(255, 212, 71, 0.15)' : 'rgba(255, 111, 94, 0.2)'} 100%)`,
                  }}
                >
                  {/* Event Image */}
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  
                  {/* Overlay gradient for better text readability */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                    style={{
                      background: `linear-gradient(135deg, ${index % 3 === 0 ? 'rgba(255, 212, 71, 0.4)' : index % 3 === 1 ? 'rgba(255, 111, 94, 0.4)' : 'rgba(255, 212, 71, 0.5)'} 0%, ${index % 3 === 0 ? 'rgba(255, 111, 94, 0.4)' : index % 3 === 1 ? 'rgba(255, 212, 71, 0.4)' : 'rgba(255, 111, 94, 0.5)'} 100%)`,
                    }}
                  ></div>
                  
                  {/* Abstract shapes as fallback decoration */}
                  {!event.image && (
                    <>
                      <div 
                        className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${index % 3 === 0 ? 'rgba(255, 212, 71, 0.4)' : index % 3 === 1 ? 'rgba(255, 111, 94, 0.4)' : 'rgba(255, 212, 71, 0.5)'} 0%, ${index % 3 === 0 ? 'rgba(255, 111, 94, 0.4)' : index % 3 === 1 ? 'rgba(255, 212, 71, 0.4)' : 'rgba(255, 111, 94, 0.5)'} 100%)`,
                          transform: "translate(20%, -20%)",
                        }}
                      ></div>
                      <div 
                        className="absolute bottom-0 left-0 w-20 h-20 md:w-24 md:h-24 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${index % 3 === 0 ? 'rgba(255, 111, 94, 0.3)' : index % 3 === 1 ? 'rgba(255, 212, 71, 0.3)' : 'rgba(255, 212, 71, 0.4)'} 0%, ${index % 3 === 0 ? 'rgba(255, 212, 71, 0.3)' : index % 3 === 1 ? 'rgba(255, 111, 94, 0.3)' : 'rgba(255, 111, 94, 0.4)'} 100%)`,
                          transform: "translate(-20%, 20%)",
                        }}
                      ></div>
                    </>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <div 
                      className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-semibold tracking-wide uppercase backdrop-blur-md transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: "rgba(255, 255, 255, 0.9)",
                        color: "#FF6F5E",
                        border: "1px solid rgba(255, 111, 94, 0.2)",
                      }}
                    >
                      Coming Soon
                    </div>
                  </div>

                  {/* Event number */}
                  <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                    <div 
                      className="text-4xl md:text-5xl font-black opacity-5 group-hover:opacity-10 transition-opacity duration-700"
                      style={{
                        background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        lineHeight: 1,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  {/* Decorative line */}
                  <div 
                    className="h-0.5 w-8 md:w-10 mb-2 md:mb-3 rounded-full transition-all duration-700 group-hover:w-12 md:group-hover:w-14"
                    style={{
                      background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                    }}
                  ></div>

                  {/* Date and Location */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-2.5 text-gray-500 text-xs mb-2">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" size={10} />
                      <span>{formatDateShort(event.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-1" size={10} />
                      <LocationButton location={event.location} className="truncate max-w-[120px] text-gray-500 text-xs" showIcon={false} />
                    </div>
                  </div>

                  <h3 
                    className="text-lg md:text-xl font-bold mb-2 tracking-tight"
                    style={{
                      background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-xs md:text-sm line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center">
                    <span 
                      className="text-xs font-semibold tracking-wide uppercase mr-2 transition-all duration-300 group-hover:mr-3"
                      style={{
                        color: "#FF6F5E",
                      }}
                    >
                      Learn More
                    </span>
                    <div 
                      className="w-6 h-0.5 transition-all duration-300 group-hover:w-10"
                      style={{
                        background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    ></div>
                    <FaArrowRight 
                      className="ml-1.5 transition-all duration-300 group-hover:translate-x-2" 
                      style={{ color: "#FF6F5E" }}
                      size={12}
                    />
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

          <div className="text-center mt-12 md:mt-16">
            <Link
              to="/events"
              className="group inline-flex items-center px-6 md:px-10 py-3 md:py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden text-sm md:text-base"
              style={{
                background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                color: "#1C2951",
                boxShadow: "0 4px 20px rgba(255, 111, 94, 0.3)",
              }}
              onMouseEnter={(e) => {
                handleLinkHover('/events');
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(255, 111, 94, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 111, 94, 0.3)";
              }}
            >
              <span className="relative z-10">View All Events</span>
              <FaArrowRight 
                className="ml-2 md:ml-3 relative z-10 transition-all duration-300 group-hover:translate-x-1" 
                size={14}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-20 lg:py-24 text-white overflow-hidden" style={{ minHeight: "400px" }}>
        {/* Hero-style background */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] md:w-[180vw] md:h-[180vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundImage: "url(https://cdn.pixabay.com/photo/2021/11/26/17/26/dubai-desert-safari-6826298_1280.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.6)",
              animation: "ctaRotate 20s linear infinite",
            }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] md:w-[180vw] md:h-[180vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundImage: "url(https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg)",
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
              backgroundImage: "url(https://cdn.pixabay.com/photo/2020/03/29/09/24/pale-di-san-martino-4979964_1280.jpg)",
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

