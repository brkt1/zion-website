import { useMemo, useState } from "react";
import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaUsers, FaWhatsapp } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { ErrorState } from "../Components/ui/ErrorState";
import { LocationButton } from "../Components/ui/LocationButton";
import OptimizedImage from "../Components/ui/OptimizedImage";
import { useCategories, useEvents } from "../hooks/useApi";

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch events and categories from API
  const { events, isError: eventsError, mutate: refetchEvents } = useEvents({
    category: selectedCategory === "all" ? undefined : selectedCategory as any,
  });
  
  const { categories: apiCategories } = useCategories();

  // Build categories list with "All Events" option
  const categories = useMemo(() => {
    const allCategories = [{ id: "all", name: "All Events", slug: "all" }];
    if (apiCategories && apiCategories.length > 0) {
      apiCategories.forEach(cat => {
        allCategories.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        });
      });
    } else {
      // Fallback categories if API doesn't return any
      allCategories.push(
        { id: "game", name: "Game Nights", slug: "game" },
        { id: "travel", name: "Travel", slug: "travel" },
        { id: "corporate", name: "Corporate", slug: "corporate" },
        { id: "community", name: "Community", slug: "community" }
      );
    }
    return allCategories;
  }, [apiCategories]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  if (eventsError) {
    return (
      <div className="min-h-screen bg-white">
        <div className="pt-24 pb-8 md:pt-28 md:pb-12">
          <ErrorState message="Failed to load events. Please try again later." onRetry={() => refetchEvents()} />
        </div>
      </div>
    );
  }

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
      {/* Header */}
      <section className="pt-24 pb-8 md:pt-28 md:pb-12 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 text-gray-900">
              Upcoming Events
            </h1>
            <p className="text-base text-gray-600">
              Discover amazing experiences and join the fun!
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl">
            {/* Search Bar */}
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-b border-gray-300 bg-transparent text-base focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`text-sm font-medium transition-colors pb-1 border-b-2 ${
                    selectedCategory === category.id
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEvents.length === 0 ? (
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
                No events found
              </p>
              <p className="text-gray-600">Try adjusting your filters or check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {filteredEvents.map((event, index) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-white transition-all duration-700 cursor-pointer border border-gray-100 hover:border-transparent"
                  style={{
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
                  }}
                  onMouseEnter={(e) => {
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
                    className="h-40 sm:h-48 relative overflow-hidden"
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
                        background: `linear-gradient(135deg, ${event.category === 'game' ? 'rgba(255, 212, 71, 0.4)' : event.category === 'travel' ? 'rgba(255, 111, 94, 0.4)' : 'rgba(255, 212, 71, 0.5)'} 0%, ${event.category === 'game' ? 'rgba(255, 111, 94, 0.4)' : event.category === 'travel' ? 'rgba(255, 212, 71, 0.4)' : 'rgba(255, 111, 94, 0.5)'} 100%)`,
                      }}
                    ></div>
                    
                    {/* Abstract shapes as fallback decoration */}
                    {!event.image && (
                      <>
                        <div 
                          className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-2xl"
                          style={{
                            background: `linear-gradient(135deg, ${event.category === 'game' ? 'rgba(255, 212, 71, 0.4)' : event.category === 'travel' ? 'rgba(255, 111, 94, 0.4)' : 'rgba(255, 212, 71, 0.5)'} 0%, ${event.category === 'game' ? 'rgba(255, 111, 94, 0.4)' : event.category === 'travel' ? 'rgba(255, 212, 71, 0.4)' : 'rgba(255, 111, 94, 0.5)'} 100%)`,
                            transform: "translate(20%, -20%)",
                          }}
                        ></div>
                        <div 
                          className="absolute bottom-0 left-0 w-20 h-20 md:w-24 md:h-24 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-xl"
                          style={{
                            background: `linear-gradient(135deg, ${event.category === 'game' ? 'rgba(255, 111, 94, 0.3)' : event.category === 'travel' ? 'rgba(255, 212, 71, 0.3)' : 'rgba(255, 212, 71, 0.4)'} 0%, ${event.category === 'game' ? 'rgba(255, 212, 71, 0.3)' : event.category === 'travel' ? 'rgba(255, 111, 94, 0.3)' : 'rgba(255, 111, 94, 0.4)'} 100%)`,
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
                          background: "#FF6F5E",
                          color: "#FFFFFF",
                          border: "1px solid rgba(255, 111, 94, 0.3)",
                        }}
                      >
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
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

                  <div className="p-6 md:p-8">
                    {/* Decorative line */}
                    <div 
                      className="h-0.5 w-10 md:w-12 mb-4 md:mb-6 rounded-full transition-all duration-700 group-hover:w-16 md:group-hover:w-20"
                      style={{
                        background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    ></div>

                    <h3 
                      className="text-xl md:text-2xl font-bold mb-3 md:mb-4 tracking-tight"
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
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-xs md:text-sm">
                        <FaCalendarAlt className="mr-2 flex-shrink-0" size={12} aria-hidden="true" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-xs md:text-sm">
                        <FaMapMarkerAlt className="mr-2 flex-shrink-0" size={12} aria-hidden="true" />
                        <LocationButton location={event.location} className="text-gray-600 text-xs md:text-sm" showIcon={false} />
                      </div>
                      {event.attendees && (
                        <div className="flex items-center text-gray-600 text-xs md:text-sm">
                          <FaUsers className="mr-2 flex-shrink-0" size={12} aria-hidden="true" />
                          <span>{event.attendees} attending</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-5 md:mb-6 leading-relaxed text-sm md:text-base line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center">
                      <span 
                        className="text-sm font-semibold tracking-wide uppercase mr-3 transition-all duration-300 group-hover:mr-4"
                        style={{
                          color: "#C73A26",
                        }}
                      >
                        View Details
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="h-1 w-16 md:w-20 mx-auto mb-6 rounded-full"
              style={{
                background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
              }}
            ></div>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight"
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Want to host an event?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Get in touch with us to organize your own community event!
            </p>
            <a
              href="https://wa.me/251978639887"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 md:px-10 py-3 md:py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden text-sm md:text-base text-white"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow: "0 4px 20px rgba(37, 211, 102, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (window.innerWidth >= 768) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(37, 211, 102, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.3)";
              }}
            >
              <FaWhatsapp size={16} />
              <span className="relative z-10">Contact via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;

