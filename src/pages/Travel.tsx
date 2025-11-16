import { useEffect } from "react";
import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaMountain, FaUmbrellaBeach, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import { LocationButton } from "../Components/ui/LocationButton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useEvents } from "../hooks/useApi";

const Travel = () => {
  // Fetch travel events
  const { events: travelEvents, isLoading: eventsLoading } = useEvents({
    category: "travel",
  });

  // Update page title and meta tags for SEO
  useEffect(() => {
    document.title = "Travel | Yenege";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Yenege - Discover amazing travel destinations and adventures in Ethiopia. Weekend getaways, day trips, and exciting adventures with Yenege.');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Travel | Yenege');
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Yenege - Discover amazing travel destinations and adventures in Ethiopia. Weekend getaways, day trips, and exciting adventures with Yenege.');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', window.location.href);
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', 'Travel | Yenege');
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', 'Yenege - Discover amazing travel destinations and adventures in Ethiopia. Weekend getaways, day trips, and exciting adventures with Yenege.');
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      game: "rgba(255, 212, 71, 0.15)",
      travel: "rgba(255, 111, 94, 0.15)",
      corporate: "rgba(255, 212, 71, 0.2)",
      community: "rgba(255, 111, 94, 0.15)",
    };
    return colors[category] || "rgba(255, 212, 71, 0.15)";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile App-like Sticky Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3">
          <h1 
            className="text-xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Travel & Adventures
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Discover amazing destinations
          </p>
        </div>
      </div>

      {/* Header Section - Desktop */}
      <section className="hidden md:block pt-24 md:pt-32 pb-12 md:pb-24 lg:pb-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 md:mb-8">
              <div 
                className="h-1 w-20 md:w-24 mx-auto mb-4 md:mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-8 tracking-tight px-2">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Yenege
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Weekend getaways, day trips, and exciting adventures. Explore new places with amazing people. Your premier destination for travel and events in Ethiopia.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-4 md:py-12 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 md:px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="group relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-[2rem] p-4 md:p-8 lg:p-12 xl:p-16 transition-all duration-700"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 240, 0.9) 100%)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)",
              }}
              onMouseEnter={(e) => {
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 30px 80px rgba(255, 111, 94, 0.15), 0 0 0 1px rgba(255, 212, 71, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)";
              }}
            >
              {/* Animated gradient background */}
              <div 
                className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                style={{
                  background: "radial-gradient(circle, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
                  transform: "translate(30%, -30%)",
                }}
              />

              <div className="relative z-10">
                {/* Decorative line */}
                <div 
                  className="h-0.5 sm:h-1 w-16 sm:w-20 md:w-24 mb-4 sm:mb-6 md:mb-8 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                ></div>

                <h2 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Yenege - Discover Amazing Destinations
                </h2>
                <div className="space-y-4 sm:space-y-5 md:space-y-6 text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed font-light">
                  <p>
                    Embark on unforgettable journeys with Yenege! Whether you're looking for a quick weekend escape or an extended adventure, we curate the perfect travel experiences that combine exploration, fun, and meaningful connections.
                  </p>
                  <p>
                    From scenic mountain hikes to relaxing beach getaways, from cultural city tours to thrilling outdoor activities - we've got something for every type of traveler. Join us and discover hidden gems, create lasting memories, and make new friends along the way. Yenege is your trusted partner for amazing travel experiences in Ethiopia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-6 md:py-12 lg:py-24 relative overflow-hidden bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-6 md:mb-12 lg:mb-20">
            <div className="inline-block mb-3 md:mb-6">
              <div 
                className="h-0.5 md:h-1 w-12 md:w-20 mx-auto mb-2 md:mb-4 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-6 tracking-tight px-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: FaMountain,
                title: "Weekend Getaways",
                description: "Perfect short trips to recharge and explore nearby destinations. Ideal for busy schedules.",
              },
              {
                icon: FaUmbrellaBeach,
                title: "Day Trips",
                description: "Quick adventures that fit into your day. Discover local attractions and hidden spots.",
              },
              {
                icon: FaMapMarkerAlt,
                title: "Extended Adventures",
                description: "Multi-day journeys to explore far-off places and immerse yourself in new cultures.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-[2rem] p-4 md:p-8 lg:p-10 transition-all duration-700 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768) {
                      e.currentTarget.style.transform = "translateY(-12px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 25px 60px rgba(255, 111, 94, 0.2), 0 0 0 1px rgba(255, 212, 71, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)";
                  }}
                >
                  {/* Animated gradient background */}
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 212, 71, 0.4) 0%, rgba(255, 111, 94, 0.4) 100%)`,
                      transform: "translate(30%, -30%)",
                    }}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    >
                      <Icon size={32} className="text-white" />
                    </div>

                    {/* Decorative line */}
                    <div 
                      className="h-0.5 sm:h-1 w-10 sm:w-12 md:w-16 mb-4 sm:mb-6 md:mb-8 rounded-full transition-all duration-700 group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-24"
                      style={{
                        background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    ></div>

                    <h3 
                      className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 tracking-tight"
                      style={{
                        background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Travel Events Section */}
      <section className="py-6 md:py-12 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-0 md:px-4 sm:px-6">
          <div className="text-center mb-6 md:mb-12 lg:mb-20 px-4 md:px-0">
            <div className="inline-block mb-3 md:mb-6">
              <div 
                className="h-0.5 md:h-1 w-12 md:w-20 mx-auto mb-2 md:mb-4 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-4 lg:mb-6 tracking-tight">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Upcoming Travel Events
              </span>
            </h2>
            <p className="text-sm md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our upcoming travel adventures
            </p>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-none md:rounded-2xl lg:rounded-3xl bg-white border-b md:border border-gray-100 md:border-gray-100 overflow-hidden animate-pulse"
                >
                  {/* Image Skeleton */}
                  <div className="h-48 md:h-48 bg-gray-200"></div>

                  <div className="p-4 md:p-6 lg:p-8">
                    {/* Decorative line */}
                    <div className="h-0.5 w-10 md:w-12 mb-4 md:mb-6 rounded-full bg-gray-200"></div>

                    {/* Title */}
                    <div className="h-6 md:h-8 w-3/4 mb-3 md:mb-4 bg-gray-200 rounded-lg"></div>

                    {/* Date and Location */}
                    <div className="space-y-2 mb-4">
                      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 mb-5 md:mb-6">
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    </div>

                    {/* CTA */}
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !travelEvents || travelEvents.length === 0 ? (
            <div className="text-center py-20">
              <div 
                className="h-1 w-16 mx-auto mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
              <p 
                className="text-xl md:text-2xl font-bold mb-4"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                No travel events scheduled yet
              </p>
              <p className="text-gray-600">Check back soon for exciting travel adventures!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
              {travelEvents.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group relative overflow-hidden rounded-none md:rounded-2xl lg:rounded-3xl bg-white transition-all duration-300 cursor-pointer border-b md:border border-gray-100 md:border-gray-100 hover:border-transparent active:bg-gray-50"
                  style={{
                    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768) {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth >= 768) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 0 0 rgba(0, 0, 0, 0)";
                    }
                  }}
                  onTouchStart={(e) => {
                    if (window.innerWidth < 768) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (window.innerWidth < 768) {
                      setTimeout(() => {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }, 150);
                    }
                  }}
                >
                  {/* Event Image */}
                  <div 
                    className="h-48 md:h-48 relative overflow-hidden"
                    style={{
                      background: getCategoryColor(event.category),
                    }}
                  >
                    {/* Event Image */}
                    {event.image ? (
                      <OptimizedImage
                        src={event.image}
                        alt={event.title}
                        width={400}
                        height={200}
                        quality={55}
                        priority="low"
                        responsive={true}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                        background: `linear-gradient(135deg, rgba(255, 111, 94, 0.4) 0%, rgba(255, 212, 71, 0.4) 100%)`,
                      }}
                    ></div>
                    
                    {/* Abstract shapes as fallback decoration */}
                    {!event.image && (
                      <>
                        <div 
                          className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-2xl"
                          style={{
                            background: `linear-gradient(135deg, rgba(255, 111, 94, 0.4) 0%, rgba(255, 212, 71, 0.4) 100%)`,
                            transform: "translate(20%, -20%)",
                          }}
                        ></div>
                        <div 
                          className="absolute bottom-0 left-0 w-20 h-20 md:w-24 md:h-24 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-xl"
                          style={{
                            background: `linear-gradient(135deg, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)`,
                            transform: "translate(-20%, 20%)",
                          }}
                        ></div>
                      </>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-3 right-3 md:top-6 md:right-6">
                      <div 
                        className="px-2.5 py-1 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-semibold tracking-wide uppercase backdrop-blur-md transition-all duration-300"
                        style={{
                          background: "#FF6F5E",
                          color: "#FFFFFF",
                          border: "1px solid rgba(255, 111, 94, 0.3)",
                          minHeight: '24px',
                          minWidth: '44px',
                        }}
                      >
                        Travel
                      </div>
                    </div>

                    {/* Event number */}
                    <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6">
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

                  <div className="p-4 md:p-6 lg:p-8">
                    {/* Decorative line */}
                    <div 
                      className="h-0.5 w-8 md:w-12 mb-3 md:mb-6 rounded-full transition-all duration-700 group-hover:w-12 md:group-hover:w-20"
                      style={{
                        background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    ></div>

                    <h3 
                      className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-4 tracking-tight"
                      style={{
                        background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {event.title}
                    </h3>

                    {/* Date and Location */}
                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
                      <div className="flex items-center text-gray-600 text-xs md:text-sm">
                        <FaCalendarAlt className="mr-2 flex-shrink-0" size={11} aria-hidden="true" />
                        <span className="line-clamp-1">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-xs md:text-sm">
                        <LocationButton 
                          location={event.location} 
                          className="!text-gray-600 hover:!text-gray-900 !text-xs md:!text-sm !p-0 !min-h-0 !min-w-0" 
                          showIcon={false} 
                        />
                      </div>
                      <div className="flex items-center text-gray-600 text-xs md:text-sm">
                        <FaUsers className="mr-2 flex-shrink-0" size={11} aria-hidden="true" />
                        <span>
                          {event.attendees || 0}
                          {event.maxAttendees ? ` / ${event.maxAttendees}` : event.attendees ? ' attending' : ''}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-xs md:text-sm lg:text-base line-clamp-3 md:line-clamp-4">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center pt-2">
                      <span 
                        className="text-xs md:text-sm font-semibold tracking-wide uppercase mr-2 md:mr-3 transition-all duration-300"
                        style={{
                          color: "#C73A26",
                        }}
                      >
                        View Details
                      </span>
                      <div 
                        className="w-6 md:w-8 h-0.5 transition-all duration-300"
                        style={{
                          background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                        }}
                      ></div>
                      <FaArrowRight 
                        className="ml-2 transition-all duration-300" 
                        style={{ color: "#C73A26" }}
                        size={12}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-12 lg:py-24 relative overflow-hidden bg-gray-50">
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(135deg, rgba(255, 212, 71, 0.1) 0%, rgba(255, 111, 94, 0.1) 50%, rgba(255, 212, 71, 0.1) 100%)",
          }}
        >
          <div 
            className="absolute top-10 left-10 w-48 h-48 md:w-64 md:h-64 rounded-full blur-3xl opacity-20"
            style={{
              background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div 
            className="absolute bottom-10 right-10 w-56 h-56 md:w-80 md:h-80 rounded-full blur-3xl opacity-15"
            style={{
              background: "linear-gradient(135deg, #FF6F5E 0%, #FFD447 100%)",
              animation: "float 8s ease-in-out infinite 2s",
            }}
          />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 md:mb-8">
              <div 
                className="h-0.5 md:h-1 w-16 md:w-24 mx-auto mb-3 md:mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 
              className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-6 lg:mb-8 tracking-tight px-4"
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Ready for Your Next Adventure?
            </h2>
            <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-6 md:mb-10 lg:mb-14 max-w-2xl mx-auto leading-relaxed px-4">
              Join us on our next travel adventure and create memories that last a lifetime.
            </p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link
                to="/events"
                className="group inline-flex items-center justify-center px-6 md:px-8 lg:px-10 py-3.5 md:py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden text-sm md:text-base w-full md:w-auto"
                style={{
                  background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                  color: "#1C2951",
                  boxShadow: "0 4px 20px rgba(255, 111, 94, 0.3)",
                  minHeight: '44px',
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(255, 111, 94, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 111, 94, 0.3)";
                }}
                onTouchStart={(e) => {
                  if (window.innerWidth < 768) {
                    e.currentTarget.style.opacity = "0.9";
                  }
                }}
                onTouchEnd={(e) => {
                  if (window.innerWidth < 768) {
                    setTimeout(() => {
                      e.currentTarget.style.opacity = "1";
                    }, 150);
                  }
                }}
              >
                <span className="relative z-10">Explore Travel Events</span>
                <FaArrowRight 
                  className="ml-2 md:ml-3 relative z-10 transition-all duration-300 group-hover:translate-x-1" 
                  size={14}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Travel;

