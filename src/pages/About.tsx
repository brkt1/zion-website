import { FaArrowRight, FaEnvelope, FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ErrorState } from "../Components/ui/ErrorState";
import { useAboutContent, useContactInfo } from "../hooks/useApi";

const About = () => {
  const { content, isError, mutate: refetchContent } = useAboutContent();
  const { contactInfo } = useContactInfo();

  if (isError || !content) {
    return (
      <div className="min-h-screen bg-white">
        <ErrorState message="Failed to load content. Please try again later." onRetry={() => refetchContent()} />
      </div>
    );
  }

  const values = content.values || [];
  const milestones = content.milestones || [];
  
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Clean Header */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 sm:mb-6 md:mb-8">
              <div 
                className="h-0.5 sm:h-1 w-16 sm:w-20 md:w-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight px-2">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Our Story
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Building a community where happiness, connection, and unforgettable experiences come together
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - Enhanced Design */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-6 sm:p-8 md:p-12 lg:p-16 transition-all duration-700"
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
                  {content.story?.title || "The Yenege Dream"}
                </h2>
                <div className="space-y-4 sm:space-y-5 md:space-y-6 text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed whitespace-pre-line font-light">
                  {content.story?.content || "Yenege was born from a simple yet powerful vision: to bring happiness to life through meaningful connections and unforgettable experiences."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <div className="inline-block mb-3 sm:mb-4 md:mb-6">
              <div 
                className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight px-4">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Our Values
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-6 sm:p-8 md:p-10 transition-all duration-700 cursor-pointer"
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
                  {/* Number indicator */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <div 
                      className="text-4xl sm:text-5xl md:text-6xl font-black opacity-5 group-hover:opacity-10 transition-opacity duration-700"
                      style={{
                        background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        lineHeight: 1,
                      }}
                    >
                      {value.number || String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Decorative line */}
                  <div 
                    className="h-0.5 sm:h-1 w-10 sm:w-12 md:w-16 mb-4 sm:mb-6 md:mb-8 rounded-full transition-all duration-700 group-hover:w-16 sm:group-hover:w-20 md:group-hover:w-24"
                    style={{
                      background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                    }}
                  ></div>

                  <h3 
                    className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 tracking-tight pr-12 sm:pr-16"
                    style={{
                      background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Mission */}
              <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-700 border border-gray-100 hover:border-transparent"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.06)";
                }}
              >
                {/* Abstract shape */}
                <div 
                  className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
                    transform: "translate(30%, -30%)",
                  }}
                ></div>

                <div className="relative z-10">
                  <div 
                    className="h-0.5 sm:h-1 w-10 sm:w-12 md:w-16 mb-4 sm:mb-6 rounded-full"
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
                    {content.mission?.title || "Our Mission"}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                    {content.mission?.content || "To create a vibrant community platform that brings people together through engaging events, exciting adventures, and meaningful connections, making happiness accessible to everyone."}
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 transition-all duration-700 border border-gray-100 hover:border-transparent"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.06)";
                }}
              >
                {/* Abstract shape */}
                <div 
                  className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
                    transform: "translate(30%, -30%)",
                  }}
                ></div>

                <div className="relative z-10">
                  <div 
                    className="h-0.5 sm:h-1 w-10 sm:w-12 md:w-16 mb-4 sm:mb-6 rounded-full"
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
                    {content.vision?.title || "Our Vision"}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                    {content.vision?.content || "To become the leading lifestyle and events platform in Ethiopia, known for creating unforgettable experiences and building a community where every member feels valued and happy."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <div className="inline-block mb-3 sm:mb-4 md:mb-6">
              <div 
                className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight px-4">
              <span 
                className="block"
                style={{
                  background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Our Journey
              </span>
            </h2>
          </div>

          {/* Timeline Design */}
          <div className="max-w-5xl mx-auto relative">
            {/* Timeline line - hidden on mobile */}
            <div 
              className="hidden md:block absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 sm:w-1"
              style={{
                background: "linear-gradient(180deg, #FFD447 0%, #FF6F5E 100%)",
                borderRadius: "2px",
              }}
            />
            
            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-start"
                >
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 relative z-10 w-full sm:w-auto flex justify-center sm:justify-start">
                    <div 
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl transition-all duration-500 group-hover:scale-110 sm:group-hover:scale-125 sm:group-hover:rotate-12"
                      style={{
                        background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                        color: "#1C2951",
                        boxShadow: "0 6px 20px rgba(255, 111, 94, 0.4), 0 0 0 3px rgba(255, 255, 255, 1)",
                      }}
                    >
                      {milestone.year === "Future" ? "∞" : milestone.year.slice(-2)}
                    </div>
                    {/* Pulse effect */}
                    <div 
                      className="absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-30 hidden sm:block"
                      style={{
                        background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                      }}
                    />
                  </div>
                  
                  {/* Content card */}
                  <div 
                    className="flex-grow w-full group relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-5 sm:p-6 md:p-10 transition-all duration-700"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%)",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth >= 768) {
                        e.currentTarget.style.transform = "translateX(12px)";
                        e.currentTarget.style.boxShadow = "0 25px 60px rgba(255, 111, 94, 0.2), 0 0 0 1px rgba(255, 212, 71, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 212, 71, 0.1)";
                    }}
                  >
                    {/* Gradient background on hover */}
                    <div 
                      className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                      style={{
                        background: "radial-gradient(circle, rgba(255, 212, 71, 0.3) 0%, rgba(255, 111, 94, 0.3) 100%)",
                        transform: "translate(30%, -30%)",
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <span 
                          className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, rgba(255, 212, 71, 0.2) 0%, rgba(255, 111, 94, 0.2) 100%)",
                            color: "#FF6F5E",
                          }}
                        >
                          {milestone.year}
                        </span>
                      </div>
                      
                      <h3 
                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 tracking-tight"
                        style={{
                          background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CEO Section */}
      {content.ceo && (
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
              <div className="inline-block mb-3 sm:mb-4 md:mb-6">
                <div 
                  className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                  }}
                ></div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight px-4">
                <span 
                  className="block"
                  style={{
                    background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Leadership
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
                  Meet the visionary behind Yenege
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 transition-all duration-700"
                style={{
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 111, 94, 0.15)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Abstract gradient background */}
                <div 
                  className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 212, 71, 0.2) 0%, rgba(255, 111, 94, 0.2) 100%)",
                    transform: "translate(30%, -30%)",
                  }}
                ></div>

                <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16">
                  <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-12 items-center">
                    {/* CEO Image */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div 
                          className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-700 group-hover:scale-105"
                          style={{
                            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
                          }}
                        >
                          {content.ceo.image ? (
                            <img 
                              src={content.ceo.image} 
                              alt={content.ceo.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl md:text-8xl font-bold"
                              style={{
                                background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                                color: "#1C2951",
                              }}
                            >
                              {content.ceo.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {/* Decorative accent */}
                        <div 
                          className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full opacity-20 blur-2xl"
                          style={{
                            background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* CEO Content */}
                    <div className="flex-grow text-center lg:text-left">
                      {/* Decorative line */}
                      <div 
                        className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 mb-4 sm:mb-6 md:mb-8 mx-auto lg:mx-0 rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                        }}
                      ></div>

                      {/* Name and Title */}
                      <h3 
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 tracking-tight"
                        style={{
                          background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {content.ceo.name}
                      </h3>
                      <p 
                        className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8 font-semibold"
                        style={{
                          color: "#C73A26",
                        }}
                      >
                        {content.ceo.title}
                      </p>

                      {/* Quote */}
                      {content.ceo.quote && (
                        <blockquote className="text-base sm:text-lg md:text-xl text-gray-700 italic mb-4 sm:mb-6 md:mb-8 leading-relaxed border-l-4 pl-3 sm:pl-4 md:pl-6"
                          style={{
                            borderColor: "#FF6F5E",
                          }}
                        >
                          "{content.ceo.quote}"
                        </blockquote>
                      )}

                      {/* Bio */}
                      <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                        {content.ceo.bio}
                      </p>

                      {/* Social Links */}
                      {content.ceo.socialLinks && content.ceo.socialLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center lg:justify-start">
                          {content.ceo.socialLinks.map((social, index) => {
                            const getIcon = () => {
                              const platform = social.platform.toLowerCase();
                              if (platform.includes('linkedin')) return <FaLinkedin size={18} />;
                              if (platform.includes('twitter') || platform.includes('x')) return <FaTwitter size={18} />;
                              if (platform.includes('instagram')) return <FaInstagram size={18} />;
                              if (platform.includes('facebook')) return <FaFacebook size={18} />;
                              if (platform.includes('email') || platform.includes('mail')) return <FaEnvelope size={18} />;
                              return null;
                            };

                            return (
                              <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110"
                                style={{
                                  background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                                  boxShadow: "0 4px 15px rgba(255, 111, 94, 0.3)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 111, 94, 0.5)";
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 111, 94, 0.3)";
                                  e.currentTarget.style.transform = "translateY(0)";
                                }}
                              >
                                <span className="text-white">
                                  {getIcon()}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Enhanced */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(135deg, rgba(255, 212, 71, 0.1) 0%, rgba(255, 111, 94, 0.1) 50%, rgba(255, 212, 71, 0.1) 100%)",
          }}
        >
          {/* Animated shapes */}
          <div 
            className="absolute top-10 left-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-3xl opacity-20"
            style={{
              background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div 
            className="absolute bottom-10 right-10 w-56 h-56 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-15"
            style={{
              background: "linear-gradient(135deg, #FF6F5E 0%, #FFD447 100%)",
              animation: "float 8s ease-in-out infinite 2s",
            }}
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 sm:mb-6 md:mb-8">
              <div 
                className="h-0.5 sm:h-1 w-16 sm:w-20 md:w-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFD447 0%, #FF6F5E 100%)",
                }}
              ></div>
            </div>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight px-4"
              style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Join Us on This Journey
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 md:mb-14 max-w-2xl mx-auto leading-relaxed px-4">
              Be part of a community that's making life more joyful, one event at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                to="/events"
                className="group inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden text-sm sm:text-base w-full sm:w-auto"
                style={{
                  background: "linear-gradient(135deg, #FFD447 0%, #FF6F5E 100%)",
                  color: "#1C2951",
                  boxShadow: "0 4px 20px rgba(255, 111, 94, 0.3)",
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
              >
                <span className="relative z-10">Explore Events</span>
                <FaArrowRight 
                  className="ml-2 sm:ml-3 relative z-10 transition-all duration-300 group-hover:translate-x-1" 
                  size={14}
                />
              </Link>
              <a
                href={`https://wa.me/${contactInfo?.phone?.replace(/\D/g, '') || '251978639887'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-semibold transition-all duration-500 text-sm sm:text-base text-white w-full sm:w-auto"
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
                <span>Contact via WhatsApp</span>
              </a>
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

export default About;

